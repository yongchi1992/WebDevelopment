var addBottleUpdate = require('./utility').addBottleUpdate;
var checkSession = require('./utility').checkSession;
var removeUpdate = require('./utility').removeUpdate;

exports.addUpdate = function(req, res) {
    const name = req.body.Name;
    const time = req.body.timeStamp;
    const sessionToken = req.get("x-parse-session-token");

    if (req.body.taken == undefined) 
        req.body.taken = 0;

    if (name == undefined || time == undefined) {
        res.status(400)
            .json({code: "400", message: "undefined username or undefined password"});
    }
    else {
        checkSession(sessionToken, {
            success: function(user) {
                addBottleUpdate(req.body);
                res.json({"code": 200});
            },
            error: function (err) {
                res.status(400).json(err);
            }
        });
        // res.send('NOT IMPLEMENTED: Site Home Page');
    }
};

exports.deleteUpdateObject = function(req, res) {

    console.log("not this guy?");
    const name = req.body.Name;
    const time = req.body.timeStamp;
    const sessionToken = req.get("x-parse-session-token");
    
    if (name == undefined || time == undefined) {
        res.status(400)
            .json({code: "400", message: "undefined username or undefined password"});
    }
    else {
        checkSession(sessionToken, {
            success: function(user) {
                removeUpdate(req.body);
                res.json({"code": 200});
            },
            error: function(err) {
                res.status(400).json(err);
            }
        });
    }
    // res.json({"code": 200});
};

