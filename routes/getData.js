var mysql = require('mysql');
var config = require('config');
var dateFormat = require('dateformat');

var connection;

function handleDisconnect() {
    connection = mysql.createConnection(config.get('MySql')); // Recreate the connection, since
    // the old one cannot be reused.

    connection.connect(function (err) {              // The server is either down
        if (err) {                                     // or restarting (takes a while sometimes).
            console.log(dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss:l"), "ERRORE", 'lost connection in get data reconnecting to db:', err);
            setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
        } else {
            console.log(dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss:l"), "INFO", "Database in get data module is connected ... nn");
        }                                     // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
                                            // If you're also serving http, display a 503 error.
    connection.on('error', function (err) {
        console.log('lost db connection in report modules reconnecting');
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}

handleDisconnect();

exports.getDictionary = function (req, res) {
	console.log('User At Ip: ',req.connection.remoteAddress,', is connected');
    var response = {
        "code": 200,
        "dictionary": []
    }
    connection.query("SELECT * from dictionary", function (error, results, fields) {
        if (error) {
            console.log("error ocurred", error);
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            var dictionaryName = results;
            response.dictionary = dictionaryName;
            res.send(response);
        }
    });


}
exports.getCorrections = function (req, res) {
    var response = {
        "code": 200,
        "correctionsList": []
    }
    connection.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'speakerphoneco_laboratory' AND NOT TABLE_NAME = 'dictionary'", function (error, results, fields) {
        if (error) {
            console.log("error ocurred", error);
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            response.correctionsList = results;
            res.send(response);
        }
    });

}
exports.getCompanys = function (req, res) {
    var response = {
        "code": 200,
        "post": "post successful",
        "companysList": []
    }

    var correction_table = req.body.correction;
    var companysList = [];
    connection.query("SELECT company from " + correction_table + " GROUP BY company", function (error, results, fields) {
        if (error) {
            console.log("error ocurred", error);
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            for (var i in results) {
                companysList.push(results[i].company)
            }
            response.companysList = companysList;
            res.send(response);
        }
    });
}
exports.getModel = function (req, res) {
    var response = {
        "code": 200,
        "modelsList": []
    }
    var correction_table = req.body.correction;
    var company_name = req.body.company;
    var modelsList = [];

    connection.query("SELECT model from " + correction_table + " where company = '" + company_name + "' GROUP BY model", function (error, results, fields) {
        if (error) {
            console.log("error ocurred", error);
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            for (var i in results) {
                modelsList.push(results[i].model)
            }
            response.modelsList = modelsList;
            res.send(response);
        }
    });
}

exports.getDeviceName = function (req, res) {
    var response = {
        "code": 200,
        "deviceNamesList": []
    }
    var correction_table = req.body.correction;
    var company_name = req.body.company;
    var model_name = req.body.model;
    var deviceNamesList = [];
    connection.query("SELECT device_name from " + correction_table + " where company = '" + company_name + "' and model = '" + model_name + "'", function (error, results, fields) {
        if (error) {
            console.log("error ocurred", error);
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            for (var i in results) {
                deviceNamesList.push(results[i].device_name)
            }

            response.deviceNamesList = deviceNamesList;
            res.send(response);
        }
    });
}

exports.getData = function (req, res) {
    var response = {
        "code": 200,
        "data": []
    }
    var correction_table = req.body.correction;
    var company_name = req.body.company;
    var model_name = req.body.model;
    var device_name = req.body.device_name;
    var data = [];
    connection.query("SELECT * from " + correction_table + " where company = '" + company_name + "' and model = '" + model_name + "' and device_name = '" + device_name + "'", function (error, results, fields) {
        if (error) {
            console.log("error ocurred", error);
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            data = results[0];
            response.data = data;
            res.send(response);
        }
    });
}