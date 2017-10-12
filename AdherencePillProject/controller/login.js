/**
 * Created by yichengwang on 28/11/2016.
 */

exports.login = function(req, res) {

    var username = req.body.username;
    var password = req.body.password;
    if (username === undefined || password === undefined) {
        res.status(400)
            .json({code: "400", message: "undefined username or undefined password"});
    } else {
        Parse.User.logIn(username, password, {
            success: function (user) {
                
                var sessionToken = req.get("x-parse-session-token");

                // var bottleId = user.attributes.bottle.id;

                // var Bottle = new Parse.Object.extend("Bottle");
                // var query = new Parse.Query(Bottle);
                // query.get(bottleId, {
                //     success: function(bottle) {
                //         var bottle_name = bottle.get("name");
                //         res.json({"code": 1, "sessionToken": user.attributes.sessionToken, "bottle": bottle_name});
                //     },
                //     error: function(obj, err) {
                //         bottle_name = "bad";
                //     }
                // });

                res.json({"code": 1, "sessionToken": user.attributes.sessionToken, "bottle": "aderall"});
                
            },
            error: function (user, error) {
                console.log(error);
                res.status(401)
                    .json({"code": error.code, "message": error.message});
            }
        });
    }
};