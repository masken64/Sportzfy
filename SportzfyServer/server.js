// If running locally make sure to run mongodb server `systemctl start mongod`
import "dotenv/config.js";
import { MongoClient, ObjectId } from 'mongodb';
import WebsiteRouter from './routes/WebsiteRouter.js';
import BookingRouter from './routes/BookingRouter.js';
import express from 'express';
import { Authorize, DATABASE, InvalidDb, SETTINGS_COLLECTION, set_DATABASE } from "./GLOBAL.js";


// EXPRESS STRUCTURE
const server = express();

server.use(express.json())

server.post('/verify', (req, res) => {  // Verifying credentials for App

    let type = ""

    switch (req.body?.password) {

        case process.env.DEV_PASSWORD:
            type = "DEV"; break;
        case process.env.MASTER_PASSWORD:
            type = "MASTER"; break;
        case process.env.VIEWER_PASSWORD:
            type = "VIEWER"; break;
    }

    let is_valid = (type != "")

    res.json({ is_valid, type })
});

server.use('/website', WebsiteRouter);

server.use('/booking', BookingRouter);

server.post("/reconnect_database", (req, res) => {  // Reconnecting to Database
    console.log("Reconnecting to database...")

    Authorize(req, [process.env.DEV_PASSWORD])

    MongoClient.connect(process.env.DATABASE_URL)
        .then((client) => {
            console.log("Reconnected to database!")
            set_DATABASE(client.db())

            res.json({
                is_valid: true,
            })
        })
        .catch((err) => {
            console.log("Could not reconnect to database\n", err)
            throw Error(err.message)
        })

});

server.get("/settings", (req, res) => {  // Get settings from database

    Authorize(req, [process.env.VIEWER_PASSWORD, process.env.DEV_PASSWORD, process.env.MASTER_PASSWORD])

    DATABASE.collection(SETTINGS_COLLECTION).findOne({})
        .then((result, err) => {
            res.json({
                is_valid: true,
                data: result
            })
        })
        .catch((err) => {
            res.json({
                is_valid: false,
                err
            })
        })

});

server.post("/settings", (req, res) => {  // Get settings from database

    Authorize(req, [process.env.DEV_PASSWORD, process.env.MASTER_PASSWORD])

    const _id = req.body._id
    delete req.body._id

    DATABASE.collection(SETTINGS_COLLECTION).updateOne({ _id: new ObjectId(_id) }, { $set: req.body },{ upsert: true })
        .then(result => {
            console.log("Succesfully updated Database settings! ", result)
            res.status(200).json({
                is_valid: true
            })
        })
        .catch(err => {
            console.log(err)
            throw Error(err)
        })
});

// Handle Error
server.use((err, req, res, next) => {
    console.error("Handling Malfunction!\n", err.stack)

    res.json({
        is_valid: false,
        error: err.message
    })
})

// Connecting to Database
console.log("Connecting to Database...")
set_DATABASE(new InvalidDb("Pending connection to database, Please Refresh..."))

// Starting server
set_DATABASE(new InvalidDb("Pending connection to database, Please Refresh..."))

// Connecting to Database
MongoClient.connect(process.env.DATABASE_URL)
    .then((client) => {
        set_DATABASE(client.db())
        console.log("Connected to database!")
    })
    .catch((err) => {
        set_DATABASE(new InvalidDb("Could not connect to Database"))
        console.log("Could not connect to database\n", err)
    })
    .finally(() => {
        const PORT = 3113 || process.env.PORT

        server.listen(PORT, () => {
            console.log(`listening at ${PORT} ...`);
        });
    })