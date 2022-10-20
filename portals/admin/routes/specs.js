var express = require('express');
var router = express.Router();
const fs = require('fs');

router.get('/admin', (req, res) => {
    fs.readFile('../specs/admin.json', (err, json) => {
        let obj = JSON.parse(json);
        res.json(obj);
    });

});

module.exports = router;