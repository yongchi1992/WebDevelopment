var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {
    res.status(400)
            .json({code: "400", message: "undefined username or undefined password"});
});

module.exports = router;