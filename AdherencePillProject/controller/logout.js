/**
 * Created by yichengwang on 28/11/2016.
 */

exports.logout = function(req, res) {
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
            .json({code: 209, error: "Invalid Session Token!"});
    }
};