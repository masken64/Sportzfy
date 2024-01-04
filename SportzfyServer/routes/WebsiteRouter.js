import fs from 'fs';
import fetch from "node-fetch";
import { randomUUID } from 'crypto';
import "dotenv/config.js";
import { Router } from "express";
import { asyncHandler, Authorize } from "../GLOBAL.js";

import { Octokit } from "@octokit/core";
import { createPullRequest, DELETE_FILE } from "octokit-plugin-create-pull-request";
const MyOctokit = Octokit.plugin(createPullRequest);
const octokit = new MyOctokit({

    timeZone: 'Asia/Kolkata',
    baseUrl: process.env.GITHUB_API_URL,
    auth: process.env.GITHUB_TOKEN,
    request: {
        fetch: fetch,
    }
})

import multer from "multer";
var upload = multer({ dest: process.env.STORAGE_DIR });


const WebsiteRouter = Router()


let ongoing_commit = false
WebsiteRouter.patch("/update", upload.array("update_website"), asyncHandler(async (req, res) => { // Updating website data sent from App


    Authorize(req, [process.env.MASTER_PASSWORD, process.env.DEV_PASSWORD])

    // if commit is already ongoing then abort
    if (ongoing_commit) {

        console.log("POST /update, Commit is already ongoing!")

        res.json({
            is_valid: false,
            error: "Ongoing changes to site, Try again after a few minutes!"
        })

        return
    }

    let final_err
    ongoing_commit = true
    try {

        Authorize(req, [process.env.MASTER_PASSWORD, process.env.DEV_PASSWORD])

        let new_data = JSON.parse(req.body["update_website"]).site_data


        // Retrieving and parsing old data from Github
        const data_file_result = await octokit.request(`GET /repos/{owner}/{repo}/contents/{file_path}`,
            {
                owner: process.env.GITHUB_REPO_OWNER,
                repo: process.env.GITHUB_REPO_NAME,
                file_path: process.env.GITHUB_DATA_PATH,
                branch: process.env.GITHUB_REPO_BRANCH
            });


        let old_data = JSON.parse(Buffer.from(data_file_result.data.content, 'base64').toString())

        console.log(`POST /update, Old Site Data=>`, old_data)
        console.log(`POST /update, New Site Data=>`, new_data)
        console.log(`POST /update, Recieved Files=>`, req.files)


        // setting image files which are to be added to the repo
        let tree_data = {}
        let original_name = {}
        req.files.forEach(async (item) => {

            const unique_filename = randomUUID() + "." + item.originalname.split('.').pop()
            const content = fs.readFileSync(item.path, { encoding: 'base64' });

            original_name[item.originalname] = unique_filename

            tree_data['public/Images/' + unique_filename] = {
                content,
                encoding: "base64"
            }
        })


        // Removing old images & adding new ones
        let keys = ["latest_images", "turf_images", "lawn_images"]
        keys.forEach((key) => {

            old_data[key].forEach(item => {
                if (!new_data[key].some((compare) => item.source == compare.source))
                    tree_data["public/" + item.source] = DELETE_FILE
            })

            new_data[key] = new_data[key].map(item => {

                if (item.to_update)
                    return {
                        source: 'Images/' + original_name[item.filename]
                    }

                return item
            })

        });


        //Updating website "data.json" file
        tree_data[process.env.GITHUB_DATA_PATH] = JSON.stringify(new_data)

        console.log(`POST /update, sending tree data=>`, tree_data)


        //Sending pull request to github then pushing those changes
        octokit.createPullRequest({
            owner: process.env.GITHUB_REPO_OWNER,
            repo: process.env.GITHUB_REPO_NAME,
            title: "Updating site",
            body: "Updating site",
            base: process.env.GITHUB_REPO_BRANCH,
            head: "pull-request-branch-master",
            update: true,
            changes: [{
                files: tree_data,
                commit: "Updating site",
                author: {
                    name: req.headers.username,
                    email: process.env.SITE_MAIL
                },
            }]
        })
            .then((resp) => {

                console.log(`POST /update, Successfully created pull request, Response=>`, resp)
                if (resp?.data?.number) {

                    console.log(`POST /update, Merging pull request number`, resp.data.number)

                    octokit.request('PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge', {
                        owner: process.env.GITHUB_REPO_OWNER,
                        repo: process.env.GITHUB_REPO_NAME,
                        pull_number: resp.data.number,
                        commit_title: 'Updating Site',
                        commit_message: 'Updating Site',
                    })
                        .then((result) => {
                            console.log(`POST /update, Successfully merged pull request number`, resp.data.number)
                            res.json({
                                is_valid: true,
                            })
                        })
                        .catch(err => {
                            console.log(`POST /update, Failed to merge pull request number`, resp.data.number)
                            throw err
                        })
                }
                else {
                    console.log(`POST /update, Can't merge since pull req number not found`)
                    throw new Error("Updating site failed")
                }

            })
            .catch(err => {
                console.log(`POST /update, Failed to create pull request, Error:\n`, err)
                throw err
            })
            .finally(() => {
                ongoing_commit = false
            })

    }
    catch (error) {

        console.log(`POST /update, Error occured: `, error.message)
        final_err = error
    }

    fs.readdirSync(process.env.STORAGE_DIR).forEach(f => fs.rmSync(`${process.env.STORAGE_DIR}/${f}`));

    if (final_err)
        throw final_err

}));

WebsiteRouter.get("/data", asyncHandler(async (req, res) => {  // Getting website data for App

    Authorize(req, [process.env.VIEWER_PASSWORD, process.env.MASTER_PASSWORD, process.env.DEV_PASSWORD])

    const result = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: process.env.GITHUB_REPO_OWNER,
        repo: process.env.GITHUB_REPO_NAME,
        path: process.env.GITHUB_DATA_PATH,
    })
    const content = Buffer.from(result.data.content, 'base64').toString()

    console.log("GET /website/data :", content)

    res.send(content)
}))

WebsiteRouter.get("/Images/:file_name", asyncHandler(async (req, res, next) => {  // Getting images for App

    Authorize(req, [process.env.VIEWER_PASSWORD, process.env.MASTER_PASSWORD, process.env.DEV_PASSWORD])

    octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: process.env.GITHUB_REPO_OWNER,
        repo: process.env.GITHUB_REPO_NAME,
        path: 'public/Images/' + req.params.file_name
    })
        .then(result => {
            if (result.data.content) {

                var img = Buffer.from(result.data.content, 'base64');
                res.writeHead(200, {
                    'Content-Length': img.length,
                    'Content-Type': "image/" + req.params.file_name.split('.').pop()
                });
                res.end(img);
            }
        })
        .catch(err => {
            res.writeHead(404)
        })

}))


export default WebsiteRouter