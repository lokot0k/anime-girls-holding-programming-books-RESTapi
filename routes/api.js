const express = require('express');
const router = express.Router();
const db = require("../db/dbModule");
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
    const authHeader = req.header("Authorization");
    const body = req.body;
    if (!(body.hasOwnProperty('language') && body.hasOwnProperty('url') && body.hasOwnProperty('name'))) {
        res.status(422);
        res.send("Error: body don't have required properties");
    } else {
        const img = (await (await fetch(body.url)).blob());
        //TODO: implement this normally
        await db.addPicture(body);
    }
})

module.exports = router;
