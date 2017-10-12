/**
 * Created by yichengwang on 28/11/2016.
 */
var checkSession = require('./utility').checkSession;

exports.activateEmail = function(req, res) {
    var token = req.query.key;
    var email = req.query.email;
    var firstname = req.query.firstname;
    Parse.Cloud.run('activateEmail', {email: email}, {
        success: function success(message) {
            console.log(message);
            res.json({code: 1, message: "success"});
        },
        error: function error(error) {
            console.log(error);
            res.json({code: 0, message: "fail"});
        }
    });
};

exports.sendPasswordResettingEmail = function(req, res) {
    var email = req.body.email;
    Parse.Cloud.run('requirePasswordResetting', {email: email}, {
        success: function success(message) {
            console.log(message);
            res.json({code: 1, message: "success"});
        },
        error: function error(error) {
            console.log(error);
            res.json({code: 0, message: "fail"});
        }
    });
};

exports.resetPassword = function(req, res) {
    var email = req.body.email;
    var token = req.body.key;
    var password = req.body.password;
    Parse.Cloud.run('resetPassword', {email: email, token: token, password: password}, {
        success: function success(message) {
            console.log(message);
            res.json({code: 1, message: "success"});
        },
        error: function error(error) {
            console.log(error);
            res.json({code: 0, message: "fail"});
        }
    });
};

exports.editAccount = function(req, res) {
    var session = req.get('x-parse-session-token');
    checkSession(session, {
        success: function success(user) {
            var firstname = req.body.firstname;
            var gender = req.body.gender;
            var email = req.body.email;
            var phone = req.body.phone;
            if (firstname !== undefined) {
                user.set("firstname", firstname);
            }
            if (gender !== undefined) {
                user.set("gender", gender);
            }
            if (email !== undefined) {
                user.set("email", email);
            }
            if (phone !== undefined) {
                user.set("phone", phone);
            }
            user.save(null, {
                success: function(user) {
                    res.status(200).json({code: 1, user: user});
                },
                error: function error(error) {
                    res.status(400).json(error);
                }
            });
        },
        error: function error(error) {
            res.status(400).json(error);
        }
    });
};