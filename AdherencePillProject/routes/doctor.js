var express = require('express');
var router = express.Router();
var utility = require('./utility');
var signUpUser = utility.signUpUser;
var checkSession = utility.checkSession;
var isDoctor = utility.isDoctor;
var findPatient = utility.findPatient;
var findPill = utility.findPill;

/* GET users listing. */
router.get('/', function(req, res, next) {
  var sessionToken = req.get("x-parse-session-token");
  Parse.User.become(sessionToken, {
    success: function() {
      var doctors = Parse.Object.extend("Doctor");
      var users = Parse.Object.extend("_User");
      var user = new users();
      var Query = new Parse.Query(doctors);
      Query.select("hospitalName", "hospitalAddress", "hospitalCity",
        "user.firstname", "user.lastname", "user.email");
      Query.exists("hospitalName");
      Query.include("user");
      Query.notEqualTo("hospitalName", "");
      Query.find({
        success: function(results) {
          console.log("get doctors,", results);
          results.forEach(function(doctor) {
            // user: doctor;
          });
          res.status(200).json(results);
        },
        error: function(error) {
          res.status(200).json({});
        }
      });
    },
    error: function(error) {
      res.status(401)
        .json({"code": error.code, "message": error.message});
    }
  });
});
router.post('/', function(req, res, next) {
  signUpUser(req.body, "Doctor", {
    success: function success (user) {
      var sessionToken = user.getSessionToken();
      res.status(201).json({"code": 1, "sessionToken": sessionToken});
    },
    error: function error (error) {
      res.status(400)
          .json({"code": error.code, "message": error.message});
    }
  });
});

router.get('/patients', function(req, res, next) {
  var sessionToken = req.get("x-parse-session-token");
  Parse.User.become(sessionToken, {
    success: function() {
      var user = Parse.User.current();
      var doctor = Parse.Object.extend("Doctor");
      var users = Parse.Object.extend("_User");
      var _user = new users();
      _user.id = user.id;
      var query = new Parse.Query(doctor);
      query.include("user");
      query.equalTo("user", _user);
      query.first({
        success: function(doctor) {
          if (doctor === undefined) {
            res.status(401).json({code:201, message:"Invalid session"});
          }
          else {
            var relation = Parse.Object.extend("PatientDoctor");
            var doctors = Parse.Object.extend("Doctor");
            var _doctor = new doctors();
            _doctor.id = doctor.id;
            // query.select("", "", "patient.user.firstname", "patient.user.lastname",
              // "patient.user.dateOfBirth", "patient.user.phone");
            var query = new Parse.Query(relation);
            query.include("patient");
            query.include("patient.user");
            query.equalTo("doctor", _doctor);
            query.find({
              success: function(results) {
                var ret = new Array();
                for (var i=0; i<results.length; i++) {
                  ret.push({
                    firstName: results[i].get("patient").get("user").get("firstname"),
                    lastName: results[i].get("patient").get("user").get("lastname"),
                    dateOfBirth: results[i].get("patient").get("user").get("dateOfBirth"),
                    phone: results[i].get("patient").get("user").get("phone"),
                    email: results[i].get("patient").get("user").get("email"),
                    gender: results[i].get("patient").get("user").get("gender"),
                    patientId: results[i].get("patient").id
                  });
                }
                res.status(200).json(ret);
              },
              error: function(error) {
                res.status(400).json(error);
              }
            })
          }

        },
        error: function(error) {
          res.status(400).json(error);
        }
      });
    },
    error: function(error) {
      res.status(401)
        .json({"code": error.code, "message": error.message});
    }
  });
});

//add a new prescription for a patient
router.post('/patient/prescription', function(req, res, next) {
  checkSession(req.get("x-parse-session-token"), {
    success: function(user) {
      isDoctor(user.id, {
        success: function(doctor) {
          findPatient(req.body.patientId, {
            success: function(patient) {
              findPill(req.body.pillId, {
                success: function(pill) {
                  var Schedule = new Parse.Object.extend("Schedule");
                  var schedule = new Schedule();
                  schedule.set("times", req.body.times);

                  /* Do we need to add the basic information such as doctor and patient into the schedule?
                   * Or if prescription contains the schedule, and the schedule only contains the time. Can we
                   * just move the time to the prescription and discard schedule? Which is better?
                   * If we keep both, which one is more important to the doctor. Schedule? Or Prescription?
                   */
                  //schedule.set("doctor", doctor);
                  //schedule.set("patient", patient);

                  /* Save the schedule which is assigned by the doctor in the prescription or in the bottle table?
                   * which is better?
                   */

                  schedule.save(null, {
                    success: function(schedule) {
                      var Prescription = new Parse.Object.extend("Prescription");
                      var prescription = new Prescription();
                      prescription.set("name", req.body.name);
                      //prescription.set("name", "req.body.namettt");
                      prescription.set("schedule", schedule);
                      prescription.set("prescriptionId", req.body.prescriptionId);
                      prescription.set("note", req.body.note);
                      prescription.set("doctor", doctor);
                      prescription.set("patient", patient);
                      prescription.set("newAdded", true);
		                  prescription.set("pill", req.body.pillName);

                      //pill should be changed to the bottle.
                      //prescription.set("pill", pill);
                      var Bottle = new Parse.Object.extend("Bottle");
                      var bottle = new Bottle();
                      bottle.set("owner", patient);

                      /* the reasons why we need to add doctor to the bottle are
                       * 1. it's much easier to get bottle information of the patients of one specific doctor
                       * 2. one patient can have many doctors, if we search bottle information of a patient of a doctor,
                       *    it will take more steps to decide whether this bottle is assigned by this doctor.
                       */
                      bottle.set("doctor", doctor);

                      var name = pill.get("pillName");

                      /* save the name of the pill, need to think about which is better, just the name of the pill, or
                       * or the objectId of this pill? which is better?
                       */
                      bottle.set("name", name);

                      /* This information should be taken from the information of that pill.
                       * So we need standard pill number in the pillLab.
                       */
                      bottle.set("pillNumber", 5);
                      

                      bottle.save(null, {
                        success: function success(bottle) {
                          prescription.set("bottle", bottle);
                          prescription.save(null, {
                            success: function(prescription) {
                              res.status(201).json({code: 1});
                            },
                            error: function(error) {
                              res.status(400).json(error);
                            }
                          });
                        },
                        error: function error(error) {
                          res.status(400).json(error);
                        }
                      });
                    },
                    error: function(error) {
                      res.status(400).json(error);
                    }
                  }); //schedule.save
                },
                error: function(error) {
                  res.status(400).json(error);
                }
              }); //findPill
            },
            error: function(error) {
              res.status(400).json(error);
            }
          }); //findPatient
        },
        error: function(error) {
          res.status(400).json(error);
        }
      }); //isDoctor
    },
    error: function(error) {
      res.status(400).json(error);
    }
  }); //checkSession
});

//get all of the bottles' information of all the patients who belongs to the doctor
router.get('/patients/prescriptions', function(req, res) {
  var session = req.get("x-parse-session-token");
  checkSession(session, {
    success: function success(user) {
      isDoctor(user.id, {
        success: function success(doctor) {
          var Bottle = Parse.Object.extend("Bottle");
          var query = new Parse.Query(Bottle);
          query.include("owner");
          query.include("owner.user");
          query.include("schedules");
          query.equalTo("doctor", doctor);
          query.find({
            success: function success(bottles) {
              //res.json(bottles);
              var ret = {};
              for (var i = 0; i < bottles.length; ++i) {
                var bottleSchedules = bottles[i].get("schedules");
                var schedules = [];
                console.log("here1");
                if (bottleSchedules) {
                  for (var j = 0; j < bottleSchedules.length; ++j) {
                    var entry = {
                      number: bottleSchedules[j].get("number"),
                      date: bottleSchedules[j].get("date")
                    };
                    schedules.push(entry);
                  }
                }
                //console.log("here2");
                //console.log("bottle objId: ", bottles[i].id);
                var entry = {
                  objectId: bottles[i].id,
                  name: bottles[i].get("name"),
                  pillNumber: bottles[i].get("pillNumber"),
                  schedules: schedules
                };
                if (ret.hasOwnProperty(bottles[i].get("owner").get("user").id)) {
                  ret[bottles[i].get("owner").get("user").id]["bottle"].push(entry);
                } else {
                  var info = {
                    firstname: bottles[i].get("owner").get("user").get("firstname"),
                    lastname: bottles[i].get("owner").get("user").get("lastname"),
                    bottle: [entry]
                  }
                  ret[bottles[i].get("owner").get("user").id] = info;
                }
              }
              res.json(ret);
            },
            error: function error(error) {
              res.status(400).json(error);
            }
          });
        },
        error: function(error) {
          res.status(400).json(error);
        }
      });
    },
    error: function(error) {
      res.status(400).json(error);
    }
  });
});

router.get('/patient/prescription', function(req, res, next) {
  var sessionToken = req.get("x-parse-session-token");
  if (sessionToken) {
    Parse.User.become(sessionToken, {
      success: function(user) {
        var doctors = Parse.Object.extend("Doctor");
        var users = Parse.Object.extend("_User");
        var _user = new users();
        _user.id = user.id;
        var query = new Parse.Query(doctors);
        query.include("user");
        query.equalTo("user", _user);
        query.first({
          success: function(doctor) {
            var patient = Parse.Object.extend("Patient");
            var query = new Parse.Query(patient);
            query.equalTo("objectId", req.query.patientId);
            query.first({
              success: function(patient) {
                var Prescription = new Parse.Object.extend("Prescription");
                var query = new Parse.Query(Prescription);
                var doctors = Parse.Object.extend("Doctor");
                var _doctor = new doctors();
                _doctor.id = doctor.id;
                var patients = Parse.Object.extend("Patient");
                var _patient = new patients();
                _patient.id = patient.id;
                query.include("schedule");
                query.include("bottle");
                query.equalTo("doctor", _doctor);
                query.equalTo("patient", _patient);
                query.find({
                  success: function(results) {
                    console.log("resultsLen:",results.length);
                    var latestResults = {};
                    var ret = new Array();
                    //Get latest prescritions from results using hashmap
                    for (var i = 0; i < results.length; i++) {
                      if (results[i].get("prescriptionId") in latestResults) {
                        var previous =  latestResults[results[i].get("prescriptionId")];
                        if (previous.get("createdAt") < results[i].get("createdAt")) {
                          latestResults[results[i].get("prescriptionId")] = results[i];
                        }
                      } else {
                        latestResults[results[i].get("prescriptionId")] = results[i];
                      }
                    }
                    
                    for (var key in latestResults) {
                      console.log("pill name in this pre:",latestResults[key].get("pill"));
                      ret.push({
                        id: latestResults[key].id,
                        name: latestResults[key].get("name"),
                        prescriptionId: latestResults[key].get("prescriptionId"),
                        pill: latestResults[key].get("bottle"),
                        pillName: latestResults[key].get("pill"),
                        note: latestResults[key].get("note"),
                        times: latestResults[key].get("schedule").get("times")
                      });
                    }
                    res.status(200).json(ret);
                  },
                  error: function(error) {
                    res.status(400).json(error);
                  }
                })
              },
              error: function(error) {
                res.status(400).json(error);
              }
            })

          },
          error: function(error) {
            res.status(400).json(error);
          }
        });
      },
      error: function(error) {
        res.status(400).json(error);
      }
    });
  }
  else {
    res.status(403).json({code: 201, massage: "Invalid session"});
  }
})



router.delete('/patient/prescription', function(req, res, next) {
  var sessionToken = req.get("x-parse-session-token");
  if (sessionToken) {
    Parse.User.become(sessionToken, {
      success: function(user) {
        var doctors = Parse.Object.extend("Doctor");
        var users = Parse.Object.extend("_User");
        var _user = new users();
        _user.id = user.id;
        var query = new Parse.Query(doctors);
        query.equalTo("user", _user);
        query.first({
          success: function(doctor) {
            var Prescription = Parse.Object.extend("Prescription");
            var query = new Parse.Query(Prescription);
            query.equalTo("objectId", req.query.prescriptionId);
            query.first({
              success: function(result) {
                result.destroy({
                  success: function(result) {
                    res.status(200).json({code: 1});
                  },
                  error: function(error) {
                    res.status(400).json(error);
                  }
                });
              },
              error: function(error) {
                res.status(400).json(error);
              }
            });
          },
          error: function(error) {
            res.status(400).json(error);
          }
        });
      },
      error: function(error) {
        res.status(400).json(error);
      }
    });
  }
  else {
    res.status(403).json({code: 201, massage: "Invalid session"});
  }
})

router.get('/appointments', function(req, res, next) {
  checkSession(req.get("x-parse-session-token"), {
    success: function(user) {
      isDoctor(user.id, {
        success: function(doctor) {
          var Appointment = new Parse.Object.extend("Appointment");
          var query = new Parse.Query(Appointment);
          query.equalTo("doctor", doctor);
          query.include("patient");
          query.include("patient.user");
          query.ascending("time");
          query.find({
            success: function(results) {
              console.log(results);
              var ret = new Array();
              for (var i=0; i<results.length; i++) {
                ret.push({
                  time: results[i].get("time"),
                  patient: {
                    id: results[i].get("patient").id,
                    firstname: results[i].get("patient").get("user").get("firstname"),
                    lastname: results[i].get("patient").get("user").get("lastname"),
                    gender: results[i].get("patient").get("user").get("gender"),
                    dateOfBirth: results[i].get("patient").get("user").get("dateOfBirth")
                  }
                });
              }
              res.status(200).json(ret);
            },
            error: function(error) {
              res.status(400).json(error);
            }
          }); //query.find
        },
        error: function(error) {
          res.status(400).json(error);
        }
      }); //isDoctor
    },
    error: function(error) {
      res.status(400).json(error);
    }
  }); //checkSession
});

router.post('/appointment', function(req, res, next) {
  checkSession(req.get("x-parse-session-token"), {
    success: function(user) {
      isDoctor(user.id, {
        success: function(doctor) {
          findPatient(req.body.patientId, {
            success: function(patient) {
              var Appointment = new Parse.Object.extend("Appointment");
              var appointment = new Appointment();
              var newQuery = new Parse.Query(Appointment);
              var time = {__type: "Date", iso: req.body.date};
              newQuery.equalTo("doctor", doctor);
              newQuery.equalTo("patient", patient);
              newQuery.equalTo("time", time);
              newQuery.first({
                success: function success(ret) {
                  if (ret === undefined) {
                    var appointment = new Parse.Object("Appointment");
                    appointment.set("doctor", doctor);
                    appointment.set("patient", patient);
                    appointment.set("time", {__type: "Date", iso: req.body.date});
                    appointment.save(null, {
                      success: function(appointment) {
                        res.status(200).json({code: 1});
                      },
                      error: function(error) {
                        res.status(400).json(error);
                      }
                    }); //appointment.save
                  }
                  else {
                    res.status(400).json({code: 0, message: "Already exists!"});
                  }
                },
                error: function(error) {
                  res.status(400).json(error);
                }
              }); //newquery.first
            },
            error: function(error) {
              res.status(400).json(error);
            }
          }); //findPatient
        },
        error: function(error) {
          res.status(400).json(error);
        }
      }); //isDoctor
    },
    error: function(error) {
      res.status(400).json(error);
    }
  }); //checkSession
});

router.get('/patient/bottles', function(req, res) {
  var sessionToken = req.get("x-parse-session-token");
  checkSession(sessionToken, {
    success: function success(user) {
      isDoctor(user.id, {
        success: function success(doctor) {
          findPatient(req.query.patientId, {
            success: function success(patient) {
              var Bottle = new Parse.Object.extend("Bottle");
              var query = new Parse.Query(Bottle);
              query.equalTo("doctor", doctor);
              query.equalTo("owner", patient);
              query.find({
                success: function success(bottles) {
                  //res.json(bottles);
                  var nameSet = new Set();
                  for (var i = 0; i < bottles.length; ++i) {
                    var name = bottles[i].get("Name");
                    if(name !== undefined) {
                      nameSet.add(name);
                    }
                  }
                  var names = Array.from(nameSet);
                  var BottleUpdate = new Parse.Object.extend("BottleUpdates");
                  var newQuery = new Parse.Query(BottleUpdate);
                  newQuery.containedIn("Name", names);
                  newQuery.find({
                    success: function success(bottles) {
                      var dict = [];
                      for (var i = 0; i < bottles.length; ++i) {
                        var name = bottles[i].get("Name");
                        var entry = {
                          battery: bottles[i].get("Battery"),
                          units: bottles[i].get("Units"),
                          timestamp: bottles[i].get("timeStamp"),
                          voltage: bottles[i].get("Voltage"),
                        };
                        if (dict.hasOwnProperty(name)) {
                          dict[name].push(entry);
                        } else {
                          dict[name] = [entry];
                        }
                      }
                      var ret = [];
                      for (var key in dict) {
                        if (dict.hasOwnProperty(key)) {
                          ret.push({
                            name: key,
                            updates: dict[key]
                          });
                        }
                      }
                      res.json(ret);
                    },
                    error: function error(err) {
                      res.status(400).json(err);
                    }
                  });
                },
                error: function error(err) {
                  res.status(400).json(err);
                }
              })
            },
            error: function error(err) {
              res.status(400).json(err);
            }
          })
        },
        error: function error(err) {
          res.status(400).json(err);
        }
      });
    },
    error: function error(err) {
      res.status(400).json(err);
    }
  })
});

// GET get the doctorApply object of the doctor
router.get('/DoctorApply', function(req, res, next) {
  checkSession(req.get("x-parse-session-token"), {
    success: function success(doctor) {
      var DoctorApply = Parse.Object.extend("PatientDoctorApplication");
      query.equalTo("doctor", doctor.id);
      query.find({
        success: function(results) {
          var ret = new Array();
          for (var i=0; i<results.length; i++) {
            ret.push({
              patient: results[i].get("patient")
            });
          }
          res.status(200).json(ret);
        },
        error: function(error) {
          res.status(200).json([]);
        }
      })
      res.status(200).json({code: 1, info: ret});
    },
    error: function error(error) {
      res.status(401)
          .json({code: error.code, message: error.message});
    }
  }); //checkSession
});


module.exports = router;