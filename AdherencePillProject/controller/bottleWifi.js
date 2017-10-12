var addGameScore = require('./utility').addGameScore;

exports.addData = function(req, res) {
    console.log("in controller");

    addGameScore();

    res.json({"code": 200});
}