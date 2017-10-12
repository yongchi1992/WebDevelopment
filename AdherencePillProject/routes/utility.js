var exports = module.exports = {};
var utility = require('utility');
var mail = require('../common/mail');



//Add an object according to the type (Patient or Doctor)
function addPerson (userInfo, type, callback) {
  var Person = new Parse.Object.extend(type);
  var newPerson = new Person();
  newPerson.set("user", userInfo.user);
  console.log("enter addPerson!!!");
  console.log(userInfo);
  if (type === "Doctor") {
      newPerson.set("hospitalName", userInfo.addtionInfo.hospitalName);
      newPerson.set("hospitalAddress", userInfo.addtionInfo.hospitalAddress);
      newPerson.set("hospitalCity", userInfo.addtionInfo.hospitalCity);
      newPerson.set("hospitalCountry", userInfo.addtionInfo.hospitalCountry);
      newPerson.set("hospitalState", userInfo.addtionInfo.hospitalState);
      newPerson.set("zipCode", userInfo.addtionInfo.zipCode);
  }
  console.log("new person:");
  console.log(newPerson);
  newPerson.save(null ,{
      success: function (person) {
          return callback.success(person);
      },
      error: function (person, error) {
          return callback.error(error);
      }
  });
}

exports.checkSession = function(session, callback) {
  if (!session) {
    return callback.error({code: 201, massage: "Invalid session"})
  } else {
    Parse.User.become(session, {
      success: function(user) {
        if (user) {
          return callback.success(user);
        } else {
          return callback.error({code: 201, massage: "Invalid session"})
        }
      },
      error: function(error) {
        return callback.error(error);
      }
    });
  }
};

exports.getPatientProfile = function(userId, callback) {
  var patient = Parse.Object.extend("Patient");
  var users = Parse.Object.extend("_User");
  var _user = new users();
  _user.id = userId;
  var query = new Parse.Query(patient);
  query.include("user");
  query.equalTo("user", _user);
  query.first({
    success: function(patient) {
      if (patient) {
        return callback.success(patient);
      }
      else {
        return callback.error({code: -1, message: "Patient not found"});
      }
    },
    error: function(error) {
      return callback.error(error);
    }
  });
}

exports.isDoctor = function(userId, callback) {
  var Doctor = Parse.Object.extend("Doctor");
  var User = Parse.Object.extend("_User");
  var user = new User();
  user.id = userId;
  var query = new Parse.Query(Doctor);
  query.include("user");
  query.equalTo("user", user);
  query.first({
    success: function(doctor) {
      if (doctor) {
        return callback.success(doctor);
      }
      else {
        return callback.error({code: -1, message: "Doctor not found"});
      }
    },
    error: function(error) {
      return callback.error(error);
    }
  });
};

exports.isPatient = function(userId, callback) {
  var Patient = Parse.Object.extend("Patient");
  var user = new Parse.User();
  user.id = userId;
  var query = new Parse.Query(Patient);
  query.include("user");
  query.equalTo("user", user);
  query.first({
    success: function success(patient) {
      if (patient) {
        return callback.success(patient);
      } else {
        return callback.error({code: -1, message: "Patient not found"});
      }
    },
    error: function(error) {
      return callback.error(error);
    }
  });
};

exports.findPatient = function(patientId, callback) {
  var Patient = Parse.Object.extend("Patient");
  var query = new Parse.Query(Patient);
  query.include("user");
  query.equalTo("objectId", patientId);
  query.first({
    success: function(patient) {
      if (patient) {
        return callback.success(patient);
      }
      else {
        return callback.error({code: -1, message: "Patient not found"});
      }
    },
    error: function(error) {
      return callback.error(error);
    }
  });
}

exports.findDoctor = function(doctorId, callback) {
  var doctor = Parse.Object.extend("Doctor");
  var query = new Parse.Query(doctor);
  query.equalTo("objectId", doctorId);
  query.first({
    success: function(doctor) {
      if (doctor) {
        return callback.success(doctor);
      }
      else {
        return callback.error({code:-1, message: "Doctor not found"});
      }
    },
    error: function(error) {
      return callback.error(error);
    }
  });
}

exports.findPill = function(pillId, callback) {
  var Pill = Parse.Object.extend("PillLib");
  var query = new Parse.Query(Pill);
  query.equalTo("objectId", pillId);
  query.first({
    success: function(pill) {
      if (pill) {
        return callback.success(pill);
      }
      else {
        return callback.error({code:-1, message: "Pill not found"});
      }
    },
    error: function(error) {
      return callback.error(error);
    }
  })
}

//Sign up a new user
exports.signUpUser = function(userInfo, type, callback) {
  // TODO: Check body
  var newUser = new Parse.User();
  console.log(userInfo);

  // TODO: Check parameters value valid
  newUser.set("username", userInfo.email);
  newUser.set("password", userInfo.password);
  newUser.set("email", userInfo.email);
  newUser.set("phone", userInfo.phone);
  newUser.set("firstname", userInfo.firstname);
  newUser.set("lastname", userInfo.lastname);
  newUser.set("gender", userInfo.gender);
  newUser.set("dateOfBirth", {__type: "Date", iso: userInfo.dob});

  // TODO: Check if registered before
  // Do not check, signup check it by itself
  newUser.signUp(null, {
    success: function (user) {
      addPerson({user: user, addtionInfo: userInfo}, type, {
        success: function (person) {
          console.log(type + " " + person.id + " saved");
          // var pointer = type.toLowerCase() + "Pointer";
          // console.log(pointer);
          // user.set(pointer, person);
          if (type.toLowerCase() === 'patient') {
            user.set('type', 1);
          }
          else if (type.toLowerCase() === 'doctor') {
            user.set('type', 10);
          }
          user.save(null, {
            success: function() {
              var email = user.get('email');
              var firstname = user.get('firstname');
              var token = utility.md5(email + firstname + "test");
              mail.activateEmail(email, token, firstname, {
                success: function success () {
                  console.log("Email Sent!");
                },
                error: function error() {
                  console.log("Email not Sent");
                }
              });
              Parse.User.logIn(userInfo.email, userInfo.password, {
                success: function(user) {
                  callback.success(user);
                },
                error: function(user, error) {
                  callback.error(error);
                }
              });
            },
            error: function(error) {console.log(error);}
          });
        },
        error: function (error) {
          callback.error(error);
        }
      });
    },
    //TODO If error is invalid session token, consider using master key
    error: function (user, error) {
      callback.error(error);
    }
  });

}
//
//exports.getUserProfile = function(userInfo, type, callback) {
//  Parse.User.become(userInfo, {
//    success: function(user) {
//      console.log(user);
//      if (user) {
//        if (type === "Doctor") {
//          user.
//        }
//        return callback.success(user);
//      } else {
//        return callback.error({code: 209, message: "Invalid Session Token"});
//      }
//    },
//    error: function(error) {
//      return callback.error({code: error.code, message: error.message});
//    }
//  });
//}

exports.addPatientDoctorRelation = function(patient, doctor, callback) {
  var query = new Parse.Query(Parse.Object.extend("PatientDoctor"));
  query.equalTo("patient", patient);
  query.equalTo("doctor", doctor);
  query.first({
    success: function(result) {
      if (result === undefined) {
        var relation = new Parse.Object("PatientDoctor");
        relation.set("patient", patient);
        relation.set("doctor", doctor);
        relation.save(null, {
          success: function(relation) {
            return callback.success(relation);
          },
          error: function(relation, error) {
            return callback.error(error);
          }
        });
      }
      else {
        return callback.success(result);
      }

    },
    error: function(error) {
      return callback.error(error);
    }
  })
}

exports.addPatientDoctorRelationApply = function(patient, doctor, callback) {
    var query = new Parse.Query(Parse.Object.extend("PatientDoctor"));
    query.equalTo("patient", patient);
    query.equalTo("doctor", doctor);
    query.first({
        success: function(result) {
            //console.log("result",result);
            if (result === undefined) {
                var relation = new Parse.Object("PatientDoctor");
                //console.log("patient,", patient);
                //console.log("doctor,", doctor);
                relation.set("patient", patient);
                relation.set("doctor", doctor);
                relation.save(null, {
                    success: function(relation) {
                        return callback.success(relation);
                    },
                    error: function(relation, error) {
                        return callback.error(error);
                    }
                });
            }
            else {
                return callback.success(result);
            }
        },
        error: function(error) {
            return callback.error(error);
        }
    })
}

