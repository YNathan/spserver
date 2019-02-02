var GoogleSpreadsheet = require('google-spreadsheet');
var express = require("express");
var bodyParser = require('body-parser');
var async = require('async');
var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
var responce = {
    fix: "",
    columns: [],
    values: []
}

function initResponce() {
    responce = {
        fix: "",
        columns: [],
        values: []
    }
}

// spreadsheet key is the long id in the sheets URL
var doc = new GoogleSpreadsheet('1W9EK8bHkJgNLtKRlxnBlrw1smHPE5m0OJcR53aSPMbM');
var sheet;

var ColumnsNames = {
    company : "מכשירשנכנסעלבעיהמסוימתותוךכדיהתיקוןנתגלתהבעיהנוספתיעוכבזמןהתיקוןשלו.איןאחריותעלתיקוניקורוזיה.ניקויקורוזיהלאכוללרכיביםוחלקיםנוספיםאחרים.תוכנהמחייבתמחיקתנתוניםהמעבדהאינהאחראיתעלשוםמידעבמכשיר.המחיריםכוללעבודהוכוללמעמ.שירותלעסקים050-437-2672זכותהקנייןהרוחניהואשלספיקרפוןכלהזכויותשמורות",
    model : "_cokwr",
    deviceName : "_cpzh4",
    riskAndComments : "_cre1l",
    price1 : "_ciyn3",
    price2 : "_cyevm"

}
var screenRisk = "מכשירשנכנסעלבעיהמסוימתותוךכדיהתיקוןנתגלתהבעיהנוספתיעוכבזמןהתיקוןשלו.איןאחריותעלתיקוניקורוזיה.ניקויקורוזיהלאכוללרכיביםוחלקיםנוספיםאחרים.תוכנהמחייבתמחיקתנתוניםהמעבדהאינהאחראיתעלשוםמידעבמכשיר.המחיריםכוללעבודהוכוללמעמ.שירותלעסקים050-437-2672זכותהקנייןהרוחניהואשלספיקרפוןכלהזכויותשמורות";
var screenCompany = "מכשירשנכנסעלבעיהמסוימתותוךכדיהתיקוןנתגלתהבעיהנוספתיעוכבזמןהתיקוןשלו.";

var newVersionFixes = ["מסכים"];


function isEqual(element, anotherOne) {
    return element == anotherOne;
}

function setAuth(step) {
    doc.useServiceAccountAuth(require('./credentials.json'), step);
}

getFixes = function (req, res) {
    async.series([
        setAuth,
        function getInfoAndWorksheets() {
            doc.getInfo(function (err, info) {
                res.json(info.worksheets.map(o => o.title));
            });
        },
    ], function (err) {
        if (err) {
            console.log('Error: ' + err);
        }
    });
}

getColumns = function (req, res) {
    initResponce();
    async.series([
        setAuth,
        function findFix() {
            doc.getInfo(function (err, info) {

                for (var i in info.worksheets) {
                    if (info.worksheets[i].title == req.query.fix) {
                        sheet = info.worksheets[i];
                        info.worksheets[i].getCells({'min-row': 1,'max-row': 1,}, function (err, cells) {
                            responce.fix = req.query.fix;
                            responce.columns = cells.map(c => c.value);
                            res.json(responce);
                        });
                    }
                }
            });
        }
    ], function (err) {
        if (err) {
            console.log('Error: ' + err);
        }
    });
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

getValueByColumns = function (req, res) {
    initResponce();
    var colIndex;
    async.series([
        setAuth,
        function getValueFromRowAndCell() {
            doc.getInfo(function (err, info) {
                var rowParams = {
                    title :  req.query.fix,
                    offset: 1,
                };
                for (var wIdx in info.worksheets) {
                    if (info.worksheets[wIdx].title == req.query.fix) {
                        info.worksheets[wIdx].getRows(rowParams, function (err, rows) {
                            var  a = rows.map(o => o[req.query.column]).filter( onlyUnique );
                            res.json(rows.map(o => o[req.query.column]).filter( onlyUnique ));
                        });
                    }
                }
            });
        }
  /*  var a = [];
    for(var i in rows){
        if(rows[i]["חברה"] == "APPLE"){
            a.push(rows[i]);
        }
    }
*/
], function (err) {
        if (err) {
            console.log('Error: ' + err);
        }
    });
}

function isNewVersion(fix) {
    return newVersionFixes.includes(fix);
}

getCompany = function (req, res) {
    initResponce();
    async.series([
        setAuth,
        function getValueFromRowAndCell() {
            doc.getInfo(function (err, info) {
                var rowParams = {
                    title :  req.query.fix,
                    offset: 2,
                };
                for (var wIdx in info.worksheets) {
                    if (info.worksheets[wIdx].title == req.query.fix) {
                        info.worksheets[wIdx].getRows(rowParams, function (err, rows) {
                           if(isNewVersion(req.query.fix)){
                               res.json(rows.map(o => o[screenCompany]).filter( onlyUnique ));
                           }else{
                               res.json(rows.map(o => o[ColumnsNames.company]).filter( onlyUnique )); 
                           }
                           
                        });
                    }
                }
            });
        }
    ], function (err) {
        if (err) {
            console.log('Error: ' + err);
        }
    });
}


getDeviceName = function (req, res) {
    initResponce();
    async.series([
        setAuth,
        function getValueFromRowAndCell() {
            doc.getInfo(function (err, info) {
                var rowParams = {
                    title :  req.query.fix,
                    offset: 2,
                };
                for (var wIdx in info.worksheets) {
                    if (info.worksheets[wIdx].title == req.query.fix) {
                        info.worksheets[wIdx].getRows(rowParams, function (err, rows) {
                            var results = [];
                            for(var rIdx in rows) {
                                if (isNewVersion(req.query.fix)) {
                                    if (rows[rIdx][screenCompany] == req.query.company) {
                                        results.push(rows[rIdx][ColumnsNames.deviceName])
                                    }
                                } else {
                                    if (rows[rIdx][ColumnsNames.company] == req.query.company) {
                                        results.push(rows[rIdx][ColumnsNames.deviceName])
                                    }
                                }
                            }
                            res.json(results.filter(onlyUnique));
                        });
                    }
                }
            });
        }
    ], function (err) {
        if (err) {
            console.log('Error: ' + err);
        }
    });
}

getModel = function (req, res) {
    initResponce();
    async.series([
        setAuth,
        function getValueFromRowAndCell() {
            doc.getInfo(function (err, info) {
                var rowParams = {
                    title :  req.query.fix,
                    offset: 2,
                };
                for (var wIdx in info.worksheets) {
                    if (info.worksheets[wIdx].title == req.query.fix) {
                        info.worksheets[wIdx].getRows(rowParams, function (err, rows) {
                            var results = [];
                            for(var rIdx in rows) {
                                if (isNewVersion(req.query.fix)) {
                                    if (rows[rIdx][screenCompany] === req.query.company && rows[rIdx][ColumnsNames.deviceName] === req.query.devicename) {
                                        results.push(rows[rIdx][ColumnsNames.model])
                                    }
                                } else {
                                    if (rows[rIdx][ColumnsNames.company] == req.query.company && rows[rIdx][ColumnsNames.deviceName] === req.query.devicename) {
                                        results.push(rows[rIdx][ColumnsNames.model])
                                    }
                                }
                            }
                            res.json(results.filter(onlyUnique));
                        });
                    }
                }
            });
        }
    ], function (err) {
        if (err) {
            console.log('Error: ' + err);
        }
    });
}

getAll = function (req, res) {
    initResponce();
    async.series([
        setAuth,
        function getValueFromRowAndCell() {
            doc.getInfo(function (err, info) {
                var rowParams = {
                    title :  req.query.fix,
                    offset: 2,
                };
                for (var wIdx in info.worksheets) {
                    if (info.worksheets[wIdx].title == req.query.fix) {
                        info.worksheets[wIdx].getRows(rowParams, function (err, rows) {
                            var found = false;
                            var results = [];

                            var allResults = {
                                riskAndComments : "",
                                price : ""
                            }
                            for(var rIdx in rows) {
                                if (isNewVersion(req.query.fix)) {
                                    if (rows[rIdx][screenCompany] === req.query.company && rows[rIdx][ColumnsNames.deviceName] === req.query.devicename && rows[rIdx][ColumnsNames.model] === req.query.model) {
                                        found = true;
                                        allResults.riskAndComments = rows[rIdx][screenRisk];
                                        allResults.price = rows[rIdx][ColumnsNames.price2];
                                        res.json(allResults);
                                    }
                                } else {
                                    if (rows[rIdx][ColumnsNames.company] == req.query.company && rows[rIdx][ColumnsNames.deviceName] === req.query.devicename  && rows[rIdx][ColumnsNames.model] === req.query.model) {
                                        found = true;
                                        allResults.riskAndComments = rows[rIdx][ColumnsNames.riskAndComments];
                                        allResults.price = rows[rIdx][ColumnsNames.price1];
                                        res.json(allResults);
                                    }
                                }
                            }
                            if(!found){
                                res.json({});
                            }
                        });
                    }
                }
            });
        }
    ], function (err) {
        if (err) {
            console.log('Error: ' + err);
        }
    });
}

var router = express.Router();
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
