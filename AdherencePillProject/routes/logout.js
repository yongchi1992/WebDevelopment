var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    // TODO Check header
    var sessionToken = req.get("x-parse-session-token");
    if (sessionToken) {
        Parse.User.become(sessionToken).then(function(user) {
            Parse.User.logOut().then(function () {
                console.log('success');
                res.json({code: 1, success: "success"});
            }, function(error) {
                console.log('error');
                res.status(401).json({code: error.code, message: error.message});
            });
        }, function(error) {
            res.status(401)
                .json({code: error.code, message: error.message});
        });
    } else {
        res.status(401)
            .json({code: 209, error: "Error"});
    }
});

module.exports = router;