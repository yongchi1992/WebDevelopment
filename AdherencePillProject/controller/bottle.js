/**
 * Created by yichengwang on 28/11/2016.
 */
var checkSession = require('./utility').checkSession;
var isPatient = require('./utility').isPatient;


/* this update of the bottle exist a problem that this belongs to a multiple updatations' problem, what if in the middle
 * of the update, some update fails, how can we roll back? We may need to re-design the table to make sure all the update
 * is correct.
 */
exports.updateBottle = function(req, res) {
    var session = req.get('x-parse-session-token');
    checkSession(session, {
        success: function success(user) {
            isPatient(user, {
                success: function success(patient) {
                    var name = req.body.name;
                    var Bottle = Parse.Object.extend("Bottle");
                    var query = new Parse.Query(Bottle);

                    /* Do we need doctor's information when query the bottle? */
                    query.equalTo("name", name);
                    query.equalTo("owner", patient);
                    query.first({
                        success: function success(bottle) {
                            var number = req.body.number;
                            var leftNumber = bottle.get("pillNumber");
                            leftNumber = leftNumber - number;
                            bottle.set("pillNumber", leftNumber);
                            bottle.save(null, {
                                success: function success(bottle) {
                                    var bottleSchedule = Parse.Object.extend("bottleSchedule");
                                    var bottleScheduleQuery = new Parse.Query(bottleSchedule);
                                    bottleScheduleQuery.equalTo("bottle", bottle);
                                    var time = req.body.time;
                                    bottleScheduleQuery.equalTo("date", time);
                                    bottleScheduleQuery.first({
                                        success: function success(schedule) {
                                            var currentNumber;
                                            if (schedule) {
                                                console.log("schedule exist");
                                                currentNumber = schedule.get("number");
                                                currentNumber = (parseInt(currentNumber) + parseInt(number)).toString();
                                                console.log(currentNumber);
                                                schedule.set("number", currentNumber);
                                                schedule.save(null, {
                                                    success: function success() {
                                                        res.status(200).json({code: 1});
                                                    },
                                                    error: function error(error) {
                                                        res.status(400).json(error);
                                                    }
                                                });
                                            } else {
                                                console.log("schedule not exist");
                                                currentNumber = number;
                                                schedule = new bottleSchedule;
                                                schedule.set("number", currentNumber);
                                                schedule.set("date", time);
                                                schedule.set("bottle", bottle);
                                                schedule.save(null, {
                                                    success: function success(schedule) {
                                                        var schedules = bottle.get("schedules");
                                                        if (schedules) {
                                                            schedules.push(schedule);
                                                            bottle.set("schedules", schedules);
                                                        } else {
                                                            bottle.set("schedules", [schedule]);
                                                        }
                                                        bottle.save(null, {
                                                            success: function success() {
                                                                res.status(200).json({code: 1});
                                                            },
                                                            error: function error (error) {
                                                                res.status(400).json(error);
                                                            }
                                                        });
                                                    },
                                                    error: function error(error) {
                                                        res.status(400).json(error);
                                                    }
                                                });
                                            }
                                        },
                                        error: function error(error) {
                                            console.log("not found");
                                            res.status(400).json(error);
                                        }
                                    });
                                },
                                error: function error(error) {
                                    res.status(400).json(error);
                                }
                            });
                        },
                        error: function error(error) {
                            res.status(400).json(error);
                        }
                    });
                },
                error: function error(error) {
                    res.status(400).json(error);
                }
            });
        },
        error: function error(error) {
            res.status(400).json(error);
        }
    });
};


//exports.updateBottle = function(req, res) {
//    var session = req.get('x-parse-session-token');
//    checkSession(session, {
//        success: function success(user) {
//            isPatient(user, {
//                success: function success(patient) {
//                    var name = req.body.name;
//                    var Bottle = Parse.Object.extend("Bottle");
//                    var query = new Parse.Query(Bottle);
//
//                    /* Do we need doctor's information when query the bottle? */
//                    query.equalTo("name", name);
//                    query.equalTo("owner", patient);
//                    query.first({
//                        success: function success(bottle) {
//                            var number = req.body.number;
//                            var leftNumber = bottle.get("pillNumber");
//                            leftNumber = leftNumber - number;
//                            bottle.set("pillNumber", leftNumber);
//                            var bottleSchedules = bottle.get("bottleSchedules")
//                            if (bottleSchedules) {
//
//                            } else {
//
//                            }
//
//
//
//                            bottle.save(null, {
//                                success: function success(bottle) {
//                                    var bottleSchedule = Parse.Object.extend("bottleSchedule");
//                                    var bottleScheduleQuery = new Parse.Query(bottleSchedule);
//                                    bottleScheduleQuery.equalTo("bottle", bottle);
//                                    var time = req.body.time;
//                                    bottleScheduleQuery.equalTo("date", time);
//                                    bottleScheduleQuery.first({
//                                        success: function success(schedule) {
//                                            var currentNumber;
//                                            if (schedule) {
//                                                console.log("schedule exist");
//                                                currentNumber = schedule.get("number");
//                                                currentNumber = (parseInt(currentNumber) + parseInt(number)).toString();
//                                                console.log(currentNumber);
//                                                schedule.set("number", currentNumber);
//                                                schedule.save(null, {
//                                                    success: function success() {
//                                                        res.status(200).json({code: 1});
//                                                    },
//                                                    error: function error(error) {
//                                                        res.status(400).json(error);
//                                                    }
//                                                });
//                                            } else {
//                                                console.log("schedule not exist");
//                                                currentNumber = number;
//                                                schedule = new bottleSchedule;
//                                                schedule.set("number", currentNumber);
//                                                schedule.set("date", time);
//                                                schedule.set("bottle", bottle);
//                                                schedule.save(null, {
//                                                    success: function success(schedule) {
//                                                        var schedules = bottle.get("schedules");
//                                                        if (schedules) {
//                                                            schedules.push(schedule);
//                                                            bottle.set("schedules", schedules);
//                                                        } else {
//                                                            bottle.set("schedules", [schedule]);
//                                                        }
//                                                        bottle.save(null, {
//                                                            success: function success() {
//                                                                res.status(200).json({code: 1});
//                                                            },
//                                                            error: function error (error) {
//                                                                res.status(400).json(error);
//                                                            }
//                                                        });
//                                                    },
//                                                    error: function error(error) {
//                                                        res.status(400).json(error);
//                                                    }
//                                                });
//                                            }
//                                        },
//                                        error: function error(error) {
//                                            console.log("not found");
//                                            res.status(400).json(error);
//                                        }
//                                    });
//                                },
//                                error: function error(error) {
//                                    res.status(400).json(error);
//                                }
//                            });
//
//
//                        },
//                        error: function error(error) {
//                            res.status(400).json(error);
//                        }
//                    });
//                },
//                error: function error(error) {
//                    res.status(400).json(error);
//                }
//            });
//        },
//        error: function error(error) {
//            res.status(400).json(error);
//        }
//    });
//};