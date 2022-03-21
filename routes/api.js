const express = require('express');
const router = express.Router();
const db = require("../db/dbModule");
require("dotenv").config();
/* GET all pictures with certain language */
router.get('/:id(\\d+)', async (req, res) => {
    let id = req.params.id;
    //TODO: implement this
});
router.get('/:language', async (req, res, next) => {
    let language = req.params.language;
    let rows;
    try {
        rows = (await db.getPictureByLanguage(language)).rows;
        if (rows === undefined || rows.length === 0) {
            res.status(404);
        }
    } catch (e) {
        console.log(e)
    } finally {
        res.json(rows);
    }
    console.log("my control");
});


module.exports = router;

