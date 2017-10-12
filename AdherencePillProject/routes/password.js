var express = require('express');
var router = express.Router();
var utility = require('utility');
var mail = require('../common/mail');

/* GET home page. */
router.post('/forget', function(req, res, next) {
    var email = req.body.email;
    var query = new Parse.Query(Parse.User);
    query.equalTo("email", email);
    query.find({
        success: function success(user) {
            var firstname = user.get("firstname");
            var token = utility.md5(email + firstname + "test");
            mail.forgetPassword(email, token, firstname, {
                success: function success() {
                    res.status(200)
                        .json({code: 1, message: "success"});
                },
                error: function error(error) {
                    res.status(400)
                        .json({code: error.code, message: error.message});
                }
            });
        },
        error: function error(error) {
            res.status(401)
                .json({code: error.code, message: error.message});
        }
    })
});

router.get('/reset', function(req, res, next) {
    var email = req.body.email;
    var password = req.body.password;
    var query = new Parse.Query(Parse.User);
    query.equalTo("username", email);
    query.find({
        success: function success(user) {
            user.set("password", password);
            res.status(200)
                .json({code: 1, success: "success"});
        },
        error: function error(error) {
            res.status(401)
                .json({code: error.code, message: error.message});
        }
    })
});

module.exports = router;
