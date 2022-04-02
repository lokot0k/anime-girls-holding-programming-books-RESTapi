const express = require('express');
const router = express.Router();
const db = require("../db/dbModule");
const path = require('path');
const fs = require("fs");
const {savePictureByURL, savePictureByBlob} = require("../utils/utils")
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
// TODO: add implementation for blob
router.post('/', async (req, res) => {
    let body = req.body;
    const authHeader = req.header("Authorization");
    const [authMethod, authKey] = authHeader.split(" ");
    if (!(authKey === process.env.SECRET_key && authMethod === "Basic")) {
        console.log(authKey + " " + authMethod)
        res.status(401);
        res.send("Wrong auth key");
        return
    }
    try {
        if (!(body.hasOwnProperty('language') && body.hasOwnProperty('name'))) {
            res.status(422);
            res.send("Error: body doesn't have required properties");
            return
        }
        const fullPath = path.join(__dirname, "..", 'public', 'images', body.language);
        if (!(fs.existsSync(fullPath))) {
            res.status(422);
            res.send("Language doesn't exist");
        } else if (fs.existsSync(path.join(fullPath, body.name))) {
            res.status(422);
            res.send("Picture with this name already exists");
        } else if (body.hasOwnProperty('url')) {
                await savePictureByURL(body.url, path.join(fullPath, body.name), async (picturePath) => {
                    let size = fs.statSync(picturePath).size;
                    if (size < 100) {
                        res.status(422);
                        res.send(`Most likely wrong "url" property in request was used`);
                        fs.unlinkSync(picturePath);
                        return
                    }
                    const isSuccess = await db.addPicture(body);
                    if (isSuccess) {
                        res.status(200);
                        res.send("Success");
                    } else {
                        res.status(500)
                        res.send("Server-side error");
                    }
                });
            } else if (body.hasOwnProperty('picBlob')) {
                await savePictureByBlob(body.picBlob, path.join(fullPath, body.name), async (picturePath) => {
                    let size = fs.statSync(picturePath).size;
                    if (size < 100) {
                        res.status(422);
                        res.send(`Most likely wrong "url" property in request was used`);
                        fs.unlinkSync(picturePath);
                        return
                    }
                    const isSuccess = await db.addPicture(body);
                    if (isSuccess) {
                        res.status(200);
                        res.send("Success");
                    } else {
                        res.status(500)
                        res.send("Server-side error");
                    }
                });

            }

    } catch (e) {
        console.log(e);
        res.status(500);
        res.send("Something went wrong");
    }
});

module.exports = router;
