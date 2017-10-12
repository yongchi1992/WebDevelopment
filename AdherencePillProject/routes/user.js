var express = require('express');
var router = express.Router();
var utility = require('./utility');
var checkSession = utility.checkSession;

/* GET users listing. */
router.get('/', function(req, res, next) {
  checkSession(req.get("x-parse-session-token"), {
    success: function(user) {
      res.status(200).json({
        code: 1,
        email: user.get("email"),
        firstname: user.get("firstname"),
        lastname: user.get("lastname"),
        phone: user.get("phone"),
        gender: user.get("gender"),
        dateOfBirth: user.get("dateOfBirth"),
        type: user.get("type"),
        patientPointer: user.get("patientPointer"),
        doctorPointer: user.get("doctorPointer")
      });
    },
    error: function(error) {
      res.status(401)
        .json({"code": error.code, "message": error.message});
    }
  });//checkSession
});
router.post('/', function(req, res, next) {
  console.log(req);
  res.json({
    ret: 1
  });
});

module.exports = router;
