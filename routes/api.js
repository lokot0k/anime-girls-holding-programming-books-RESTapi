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
    } else {
        res.status(404);
        res.json();
    }
});

function buildArrayOfContent(dirPath, language) {
    const serverName = process.env.SERVER;
    const protocol = process.env.PROTOCOL
    let responseArray = [];
    const namesArray = fs.readdirSync(dirPath, "utf8");
    namesArray.forEach(name => responseArray.push({
        language,
        url: protocol + "://" + serverName + "/" + language + "/" + name,
        "size": fs.statSync(path.join(dirPath, name)).size
    }));
    return responseArray;
}

module.exports = router;

