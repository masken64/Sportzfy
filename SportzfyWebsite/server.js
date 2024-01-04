const express=require('express');
const { existsSync } = require('fs');
const server=express();
const path=require("path")

const PUBLIC_DIR_NAME='public'
const PORT=3100;

server.use(express.static(path.join(__dirname, PUBLIC_DIR_NAME)));

server.get('/', (req, res) => { //returns index page on /
    res.sendFile(`index.html`, { root: PUBLIC_DIR_NAME });
});

server.get('/:id', (req, res) => { //instead of creating a get() for every page, this get() sends non unique pages by :id
    
    let dir = `${req.params.id}.html`;
    if (existsSync(`${PUBLIC_DIR_NAME}/${dir}`))
        res.sendFile(dir, { root: PUBLIC_DIR_NAME });
    else
        res.sendFile(`404.html`, { root:PUBLIC_DIR_NAME });
});

server.listen(PORT,()=>{
    console.log(`listening at ${PORT} ...`);
});