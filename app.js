var express = require("express");
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

router.get('/get_correction', getData.getCorrections);

// test route
router.get('/', function (req, res) {
    res.sendFile(__dirname +'/public/index.html');
});




app.use('/api', router);
app.listen(5000);
console.log("server is up")

