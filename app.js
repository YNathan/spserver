var express = require("express");
var config = require('config');
var path = require('path');
var bodyParser = require('body-parser');
var getData = require('./routes/getData');
var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
var router = express.Router();

router.get('/get_dictionary', getData.getDictionary);
router.get('/get_corrections', getData.getCorrections);
router.post('/get_companys', getData.getCompanys);
router.post('/get_model', getData.getModel);
router.post('/get_device_name', getData.getDeviceName);
router.post('/get_data', getData.getData);
// test route
router.get('/', function (req, res) {
    res.sendFile(__dirname +'/public/index.html');
});




app.use('/api', router);
app.listen(config.get("Server.port"));
console.log("server is up")

