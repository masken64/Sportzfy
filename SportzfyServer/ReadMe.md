# Sportzfy Turf Server

## Table of Contents

  <ol>
    <li>
      <a href="#about">About</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
        <li><a href="#levels-of-authorization ">Levels of Authorization </a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#local-installation">Local Installation</a></li>
      </ul>
    </li>
    <li>
      <a href="#levels-of-authorization">Levels of Authorization</a>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#Contributors">Contributors</a></li>
  </ol>

## About

This is the backend server for the Sportzfy Turf,
Responsible for handling Booking Data & Website Data updation and syncing all the data between multiple users and their devices. The server also grants access to cetain functionalites based on the users level of authorization.

### Built With

* [![nodejs-icon]][nodejs-url]

* [![express-icon]][express-url]

* [![mongodb-icon]][MongoDB-url]

* [![github-icon]][github-url]


## Getting Started

The following segment will guide you on how to setup the server locally or host it on any platform.

### Prerequisites

* Must have Node.js (greater than Version 19.3) installed on the system
* Run the following command in the same directory as `package.json`:
  ```sh
  npm i
  ```

### Local Installation

* Create an `.env` file in the same path as `package.json` and add the following information:

    ```sh
    PORT=3113
    FRONTEND="<frontend-url>"
    FRONTEND_DATA_LOCATION="data.json"
    STORAGE_DIR="/tmp/uploads/"

    DATABASE_URL="<database-url>"
    DATABASE_NAME="<database-name>"

    GITHUB_API_URL="https://api.github.com"
    GITHUB_TOKEN="<github-access-token>"
    GITHUB_REPO_OWNER="<repo-owner-username>"
    GITHUB_REPO_NAME="<repo-name>"
    GITHUB_DATA_PATH="public/data.json"
    GITHUB_REPO_BRANCH="main"

    SITE_MAIL="<email>@gmail.com"

    DEV_PASSWORD="<dev-password>"
    MASTER_PASSWORD="<master-password>"
    VIEWER_PASSWORD="<viewer-password>"
    ```
* To start the server
    ```
    npm run start
    ```
  This will start up a server at `http://localhost:3113/`, You can ping the server via [Postman](https://www.postman.com/) or [Thunder Client](https://www.thunderclient.com/) to ensure it is working


## Levels of Authorization 

**Viewer:** Grants only viewing the data and not modifying it.  
**Admin:** Grants manipulating the booking and website data of the turf.  
**Developer:** Grants handling of any technical aspects like database reconnection.

>  *Note: In the code, `Admin` is synonymous with `Master`*


## Usage  
| URL path                     | request Types | Request Format                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Developer Access | Admin Access | Viewer Access |
|------------------------------|---------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------|--------------|---------------|
| `/verify`                    | POST          | ``` {     body:{      username: "<username>",     password: "<password>"   } } ```                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | ✅                | ✅            | ✅             |
| `/website/data`              | GET           | ``` {   headers: {     username: "<username>",     password: "<password>"   } } ```                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | ✅                | ✅            | ✅             |
| `/website/update`            | PATCH         | ``` {   "Content-Type": "multipart/form-data",   headers: {     username: "<username>",     password: "<password>"   } } ```                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | ✅                | ✅            | ❌             |
| `/website/Images/:file_name` | GET           | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | ✅                | ✅            | ✅             |
| `/booking?month=3&year=2023` | GET           | ``` {   headers: {     username: "<username>",     password: "<password>"   } } ```                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | ✅                | ✅            | ✅             |
| `/booking/add`               | POST          | ``` {         headers: {             'Accept': 'application/json',             'Content-Type': 'application/json',             username: "username",             password: "password"         },         body: {             data: {                 phone_number:"<phn_no-string>",                 name: "<name-string>",                 description: "<description-string>",                 area:"<area-string>",                 from: "<date-ISO-format>",                 till: "<date-ISO-format>",                 canteen_cost: "<float>",                 rate: "<float>",                 discount: "<float>",                 advance: "<float>",                 payment_status: "<status-string>",                 partial_payment: "<float>"             }         } } ``` | ✅                | ✅            | ❌             |
| `/booking/update`            | PATCH         | ``` {         headers: {             'Accept': 'application/json',             'Content-Type': 'application/json',             username: "username",             password: "password"         },         body: {             data: {                 phone_number:"<phn_no-string>",                 name: "<name-string>",                 description: "<description-string>",                 area:"<area-string>",                 from: "<date-ISO-format>",                 till: "<date-ISO-format>",                 canteen_cost: "<float>",                 rate: "<float>",                 discount: "<float>",                 advance: "<float>",                 payment_status: "<status-string>",                 partial_payment: "<float>"             }         } } ``` | ✅                | ✅            | ❌             |
| `/booking/delete`            | DELETE        | ``` {         headers: {             'Accept': 'application/json',             'Content-Type': 'application/json',             username: "<username>",             password: "<password>"         },          body: {             id: <bookingId>,             data: { ... }         } } ```                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | ✅                | ✅            | ❌             |
| `/booking/check_clash`       | POST          | ``` {        headers: {             "Content-Type": "application/json",             username: "<username>",             password: "<password>",         },         body: { area:"<area-string>", from: "<date-ISO>", till: "<date-ISO>"} } ```                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | ✅                | ✅            | ❌             |

## Contributors
* Ojas Gupta
* Manas Ravindra Makde
* Kartik Sharma
* Satwik Srivastava
* Gevariya Kelvin



[mongodb-icon]:https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white
[mongodb-url]:https://github.com/mongodb/mongo

[nodejs-icon]:https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white
[nodejs-url]:https://github.com/nodejs/node

[github-icon]:https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white
[github-url]:https://github.com/

[express-icon]:https://img.shields.io/badge/Express.js-404D59?style=for-the-badge
[express-url]:https://github.com/expressjs/express