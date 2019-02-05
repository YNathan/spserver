var GoogleSpreadsheet = require('google-spreadsheet');
var express = require("express");
var device = require('express-device');
var bodyParser = require('body-parser');
var async = require('async');
var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(device.capture());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// spreadsheet key is the long id in the sheets URL
var doc = new GoogleSpreadsheet('1W9EK8bHkJgNLtKRlxnBlrw1smHPE5m0OJcR53aSPMbM');

var ColumnsNames = {
    company: 1,
    model: 2,
    deviceName: 3,
    riskAndComments: 4,
    price1: 5,
    price2: 6
};


var request;
var responce;
var responceBody;

function setAuth(step) {
    doc.useServiceAccountAuth(require('./credentials.json'), step);
}

function respond(step) {
    try{
        responce.json(responceBody);
    }catch(error){

        handleError(error);
    }
    step();

}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function handleError(err) {
    if (err) {
        var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
        console.log("Error When User in IP: " + ip + ", With Device: " + request.device.type + ", request for: " + request.originalUrl.split("/api/")[1] + ".");
        console.log('Error: ' + err);
    }
}

getFixes = function (req, res) {
    var worksheetsTitles = [];
    async.series([
        setAuth,
        function getSheetsTitles(step) {
            doc.getInfo(function (err, info) {
                worksheetsTitles = info.worksheets.map(o => o.title);
                responceBody = worksheetsTitles;
                step();
            });
        },
        respond
    ], function (err) {
        handleError(err);
    });
};


getCompany = function (req, res) {
    var companiesNames = [];
    async.series([
        setAuth,
        function getValueFromRowAndCell(step) {
            doc.getInfo(function (err, info) {
                var rowParams = {
                    title: req.query.fix,
                    offset: 2,
                };
                for (var wIdx in info.worksheets) {
                    if (info.worksheets[wIdx].title == req.query.fix) {
                        info.worksheets[wIdx].getRows(rowParams, function (err, rows) {
                            companiesNames = rows.map(o => fromRowToFieldAtIndex(o, ColumnsNames.company)).filter(onlyUnique);
                            responceBody = companiesNames;
                            step();
                        });
                    }
                }
            });
        },
        respond
    ], function (err) {
        handleError(err);
    });
};


getDeviceName = function (req, res) {
    var devicesNames = [];
    async.series([
        setAuth,
        function getValueFromRowAndCell(step) {
            doc.getInfo(function (err, info) {
                var rowParams = {
                    title: req.query.fix,
                    offset: 2,
                };
                for (var wIdx in info.worksheets) {
                    if (info.worksheets[wIdx].title == req.query.fix) {
                        info.worksheets[wIdx].getRows(rowParams, function (err, rows) {
                            for (var rIdx in rows) {
                                if (fromRowToFieldAtIndex(rows[rIdx], ColumnsNames.company) == req.query.company) {
                                    devicesNames.push(fromRowToFieldAtIndex(rows[rIdx], ColumnsNames.deviceName));
                                }
                            }
                            responceBody = devicesNames.filter(onlyUnique);
                            step();
                        });
                    }
                }
            });
        },
        respond
    ], function (err) {
        handleError(err);
    });
};

getModel = function (req, res) {
    var models = [];
    async.series([
        setAuth,
        function getValueFromRowAndCell(step) {
            doc.getInfo(function (err, info) {
                var rowParams = {
                    title: req.query.fix,
                    offset: 2,
                };
                for (var wIdx in info.worksheets) {
                    if (info.worksheets[wIdx].title == req.query.fix) {
                        info.worksheets[wIdx].getRows(rowParams, function (err, rows) {

                            for (var rIdx in rows) {
                                if (fromRowToFieldAtIndex(rows[rIdx], ColumnsNames.company) === req.query.company && fromRowToFieldAtIndex(rows[rIdx], ColumnsNames.deviceName) === req.query.devicename) {
                                    models.push(fromRowToFieldAtIndex(rows[rIdx], ColumnsNames.model));
                                }
                            }
                            responceBody = models.filter(onlyUnique);
                            step();
                        });
                    }
                }
            });
        },
        respond
    ], function (err) {
        handleError(err);
    });
};

getAll = function (req, res) {
    var allResults = {
        riskAndComments: "",
        price: ""
    }
    async.series([
        setAuth,
        function getValueFromRowAndCell(step) {
            doc.getInfo(function (err, info) {
                var rowParams = {
                    title: req.query.fix,
                    offset: 2,
                };
                for (var wIdx in info.worksheets) {
                    if (info.worksheets[wIdx].title == req.query.fix) {
                        info.worksheets[wIdx].getRows(rowParams, function (err, rows) {
                            for (var rIdx in rows) {
                                if (fromRowToFieldAtIndex(rows[rIdx],ColumnsNames.company) === req.query.company && fromRowToFieldAtIndex(rows[rIdx],ColumnsNames.deviceName) === req.query.devicename && fromRowToFieldAtIndex(rows[rIdx],ColumnsNames.model) === req.query.model) {
                                    allResults.riskAndComments = fromRowToFieldAtIndex(rows[rIdx],ColumnsNames.riskAndComments);
                                    allResults.price = fromRowToFieldAtIndex(rows[rIdx],ColumnsNames.price1);
                                }
                            }
                            responceBody = allResults;
                            step();
                        });
                    }
                }
            });
        },
        respond
    ], function (err) {
        handleError(err);
    });
};

function fromRowToFieldAtIndex(row, index) {
    delete row._xml;
    delete row._links;
    delete row.del;
    delete row.save;
    delete row.__proto__;
    var rowAsJson = JSON.parse(JSON.stringify(row));
    var arr = [];
    for (var i in rowAsJson) {
        arr.push(rowAsJson[i]);
    }
    return arr[index];
}


var router = express.Router();

router.get('*', function (req, res, next) {
    request = req;
    responce = res;
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log("User in IP: " + ip + ", With Device: " + req.device.type + ", request for: " + req.originalUrl.split("/api/")[1] + ".");
    next();
});

router.get('/fixes', getFixes);
router.get('/company', getCompany);
router.get('/devicenames', getDeviceName);
router.get('/model', getModel);
router.get('/all', getAll);


// test route
router.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.use('/api', router);
app.listen(5000);
console.log("Server running on port: 5000");
//settingTheColumns();