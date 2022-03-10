const express = require('express');
const path = require('path');
const fs = require("fs");
const router = express.Router();
require("dotenv").config();

/* GET all pictures with certain language */
router.get('/:language', (req, res) => {
    let language = req.params.language;
    const pathToLanguage = path.join(__dirname, '..', 'public', 'images', language);
    if (fs.existsSync(pathToLanguage)) {
        res.status(200);
        res.json(buildArrayOfContent(pathToLanguage, language));
        res.status(200);
    } else {
        res.status(404);
        res.json();
    }
});

function buildArrayOfContent(dirPath, language) {
    let responseArray = [];
    const namesArray = fs.readdirSync(dirPath, "utf8");
    namesArray.forEach(name => responseArray.push({
        language,
        name,
        "size": fs.statSync(path.join(dirPath, name)).size
    }));
    return responseArray;
}

module.exports = router;

