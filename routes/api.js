const express = require('express');
const router = express.Router();
const db = require("../db/dbModule");
require("dotenv").config();
/* GET all pictures with certain language */
router.get('/:language', async (req, res) => {
    let language = req.params.language;
    const {rows} = await db.getPictureByLanguage(language)
    if (rows === undefined || rows.length === 0) {
        res.status(404);
    }
    res.json(rows);
});

module.exports = router;

