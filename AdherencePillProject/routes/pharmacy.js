var express = require('express');
var router = express.Router();
var utility = require('./utility');
var checkSession = utility.checkSession;
var isDoctor = utility.isDoctor;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.post('/', function(req, res, next) {
  console.log(req);
  res.json({
    ret: 1
  });
});

router.get('/pills', function(req, res, next) {
  checkSession(req.get("x-parse-session-token"), {
    success: function success(user) {
      isDoctor(user.id, {
        success: function(doctor) {
          var PillLib = Parse.Object.extend("PillLib");
          var query = new Parse.Query(PillLib);
          query.find({
            success: function(results) {
                var ret = new Array();
                results.forEach(function(pill) {
                  ret.push({
                    pillId: pill.id,
                    pillName: pill.get("pillName"),
                    pillInfo: pill.get("pillInfo"),
                    pillInstruction: pill.get("pillInstruction")
                  })
                });
                res.status(200).json(ret);
            },
            error: function(error) {
              res.status(400).json(error);
            }
          }); // query.find
        },
        errro: function(error) {
          res.status(400).json(error);
        }
      }); //isDoctor
    },
    error: function(error) {
      res.status(401).json(error);
    }
  }); //checkSession
})

module.exports = router;
