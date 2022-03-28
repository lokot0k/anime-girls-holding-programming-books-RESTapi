const express = require('express');
const router = express.Router();
const db = require("../db/dbModule");
const path = require('path');
const fs = require("fs");
const fetch = require("node-fetch");
require("dotenv").config();

/* GET picture by id */
router.get('/:id(\\d+)', async (req, res) => {
    let id = req.params.id;
    let pic;
    try {
        pic = await db.getPictureById(id);
        if (!pic) {
            res.status(404);
        }
    } catch (e) {
        res.status(404);
        console.log(e)
    } finally {
        res.json(pic);
    }
});

/* GET all pictures with certain language */
router.get('/:language', async (req, res) => {
    let language = req.params.language;
    let rows;
    try {
        rows = (await db.getPictureByLanguage(language)).rows;
        if (rows === undefined || rows.length === 0) {
            res.status(404);
        }
    } catch (e) {
        res.status(404);
        console.log(e)
    } finally {
        res.json(rows);
    }
});
// TODO: add implementation for blob and add authentication
router.post('/', async (req, res) => {
        let body = req.body;
        const authHeader = req.header("Authorization");
        const fullPath = path.join(__dirname, "..", 'public', 'images', body.language);
        try {
            if (!(body.hasOwnProperty('language') && body.hasOwnProperty('url') && body.hasOwnProperty('name'))) {
                res.status(422);
                res.send("Error: body doesn't have required properties");
            } else if (!(fs.existsSync(fullPath))) {
                res.status(422);
                res.send("Language doesn't exist");
            } else if (fs.existsSync(path.join(fullPath, body.name))) {
                res.status(422);
                res.send("Picture with this name already exists");
            } else {
                const img = await fetch(body.url);
                const imgBuffer = await img.buffer();
                let streamWrite = fs.createWriteStream(path.join(fullPath, body.name))
                streamWrite.write(imgBuffer);
                streamWrite.close();
                body.size = fs.statSync(path.join(fullPath, body.name)).size;
                const isSuccess = await db.addPicture(body);
                if (isSuccess) {
                    res.status(200);
                    res.send("Success");
                } else {
                    res.status(500)
                    res.send("Server-side error");
                }
            }
        } catch (e) {
            console.log(e);
            res.status(500);
            res.send("Something went wrong");
        }
    }
);

module.exports = router;
