var express = require('express');
var router = express.Router();
var path = require('path');
var mail = require('../common/mail');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../public/test.html'));
});
//mail.activateEmail("yichengwang2015@u.northwestern.edu", "SHvsMK", "SHvsMK", {
//  success: function success() {
//    console.log("yes");
//  },
//  error: function error() {
//    console.log("no");
//  }
//});
module.exports = router;
