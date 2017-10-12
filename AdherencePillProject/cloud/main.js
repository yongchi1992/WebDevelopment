var crypto = require('crypto');
var mail = require('../common/mail');
var utility = require('utility');

Parse.Cloud.define('activateEmail', function(req, res) {
  Parse.Cloud.useMasterKey();
  var email = req.params.email;
  var query = new Parse.Query(Parse.User);
  query.equalTo("email", email);
  query.first({
      success: function success(user) {
      user.set("emailVerified", true);
      user.save(null, {
        success: function success(user) {
          res.success(user);
        },
        error: function error(error) {
          res.error(error);
        }
      });
    },
    error: function error(error) {
      res.error("fail");
    }
  });
});

Parse.Cloud.define('resetPassword', function(req, res) {
    Parse.Cloud.useMasterKey();
    var email = req.params.email;
    var token = req.params.token;
    var password = req.params.password;

    var query = new Parse.Query(Parse.User);
    
    query.equalTo("email", email);
    query.equalTo("passwordResettingToken", token);
    query.first({
        success: function success(user) {
            user.set("password", password);
            user.save(null, {
                success: function success(user) {
                    res.success("success");
                },
                error: function error(error) {
                    res.error(error);
                }
            })
        },
        error: function error(error) {
            res.error(error);
        }
    });
});

Parse.Cloud.define('requirePasswordResetting', function (req, res) {
    Parse.Cloud.useMasterKey();
    var email = req.params.email;
    var query = new Parse.Query(Parse.User);
    query.equalTo("email", email);
    console.log(email);
    query.first({
        success: function success(user) {
            var firstname = user.get("firstname");
            crypto.randomBytes(256, function(err, buf) {
                if (err) {
                    res.error(err);
                } else {
                    var token = buf.toString('hex');
                    user.set("passwordResettingToken", token);
                    user.save(null, {
                        success: function success(user) {
                            mail.forgetPassword(email, token, firstname, {
                                success: function success() {
                                    console.log("sent");
                                    res.success("success");
                                },
                                error: function error(error) {
                                    console.log("not sent");
                                    res.error(error);
                                }
                            });
                        },
                        error: function error(error){
                            res.error(error);
                        }
                    })
                }
            });
        },
        error: function error(error) {
            res.error(error);
        }
    });
});