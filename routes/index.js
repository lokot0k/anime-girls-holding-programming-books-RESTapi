const express = require('express');
const router = express.Router();

/* GET documentation page */
router.get('/', function (req, res) {
    res.render('index', {title: 'Documentation'});
});

module.exports = router;