var express = require('express');
var router = express.Router();
var controller = require('../controller');
var login = controller.login;
var logout = controller.logout;
var account = controller.account;
var bottle = controller.bottle;
var prescription = controller.prescription;
var bottleUpdte = controller.bottleUpdate;
var bottleWifi = controller.bottleWifi;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* login */
router.post('/login', login.login);

/* logout */
router.get('/logout', logout.logout);


router.post('/bottleUpdate', bottleUpdte.addUpdate);
router.post('/bottleUpdateDelete', bottleUpdte.deleteUpdateObject);
// router.get('/update', bottleUpdte.index);
router.get('/bottleWifi', bottleWifi.addData);

///* activate email, the name of this API should change to /account/verification, this will be changed to the PUT method */
//router.get('/account/email', account.activateEmail);
//
///* send the email to the user's email for resetting password, this function's name should be better */
//router.get('/account/password', account.sendPasswordResettingEmail);
//
///* update password */
//router.put('/account/password', account.resetPassword);
//
///* update basic information of a user, do we need to combine updata password with basic information, is there any
// * place for change password in the user's profile page?
// */
//router.put('/account/info', account.editAccount);

/* update the bottle information */
router.put('/bottle', bottle.updateBottle);

///* get the information of a patient */
//router.get('/patient', );
//
///* signup a new patient */
//router.post('/patient', );
//
///* retrieve the appintments of a patient */
//router.get('/patient/appointment', );
//
///* add an appointment for a patient with the doctor selected */
//router.post('/patient/appointment', );
//
///* get precriptions of a patient*/
//router.get('/patient/prescription', );
//
///* */
//router.get('/patient/pills', );
//
//
//router.get('/doctor', );
//
//router.get('/profile', );

router.get('/patient/newPrescriptions', prescription.getNewPrescriptions);

router.get('/prescription', prescription.getBottleInfo);

module.exports = router;
