/**
 * Created by yichengwang on 13/2/2017.
 */

var checkSession = require('./utility').checkSession;
var isPatient = require('./utility').isPatient;


exports.getBottleInfo = function(req, res) {
    var sessionToken = req.get("x-parse-session-token");
    checkSession(sessionToken, {
        success: function success(user) {
            var prescriptionId = req.query.prescriptionId;
            var Prescription = new Parse.Object.extend("Prescription");
            var query = new Parse.Query(Prescription);
            query.equalTo("objectId", prescriptionId);
            query.include("bottle");
            query.first({
                success: function success(prescription) {
                    var nameSet = new Set();
                    nameSet.add(prescription.get("bottle").get("name"));
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
                                    taken: bottles[i].get("taken"),
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
    });
}

exports.getNewPrescriptions = function(req, res) {
    var sessionToken = req.get("x-parse-session-token");
    checkSession(sessionToken, {
        success: function success(user) {
            isPatient(user, {
                success: function success(patient) {
                    var Prescription = new Parse.Object.extend("Prescription");
                    var query = new Parse.Query(Prescription);
                    query.equalTo("patient", patient);
                    query.equalTo("newAdded", true);
                    query.include("bottle");
                    query.include("schedule");
                    var newPrescriptions = [];
                    query.each(function (newPrescription, err) {
                        newPrescription.set("newAdded", false);
                        newPrescription.save();
                        newPrescriptions.push(newPrescription);
                    }, {useMasterKey: true}).then(function() {
                        res.json(newPrescriptions);
                    }, function(err) {
                        console.log(err);
                        res.status(400).json(err);
                    });
                },
                error: function error(err) {
                    res.status(400).json(err);
                }
            });
        },
        error: function error(err) {
            res.status(400).json(err);
        }
    });
}