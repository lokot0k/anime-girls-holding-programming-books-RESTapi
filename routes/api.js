const express = require('express');
const path = require('path');
const fs = require("fs");
const router = express.Router();

/* GET pictures by language */
router.get('/:language', (req, res) => {

    let language = req.params.language;
    if (fs.existsSync(path.join(__dirname, '..', 'public', 'images', language))) {
        res.json({"success": true});
        res.status(200);
    } else {
        res.json({"success": false});
        res.status(404);
    }
});

module.exports = router;

