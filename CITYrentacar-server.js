const express = require("express");
const parser = require("body-parser");
const mysql = require('mysql');
var formidable = require('formidable');
const jsyaml = require("js-yaml")
var fs = require('fs');
/**************************************************************************/
var configs;
var loadConfigs = (callback) => {
  fs.readFile('./resources/config.yaml', (err, data) => {
    var config = jsyaml.load(data);

    configs = config;
    callback();

  });
}

var db_config;
var db;

function handleDisconnect() {
  db = mysql.createConnection(db_config);


  db.connect(function (err) {
    if (err) {
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000);
    } else
      console.log('db connected');
  });

  db.on('error', function (err) {
    //console.log('db error', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}


//process.env.PORT
var port = process.env.PORT || 3000;
var app = express();

app.listen(port, () => {
  console.log(`servr stated on port :: ${port}`);
  loadConfigs(() => {
    console.log("configuration loaded.");
    db_config = configs.DB_CONFIG;
    handleDisconnect();
  });
});




const corsAuth = function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-requested-with");
  next();
}
app.use(corsAuth);
app.use(parser.json());
app.use(parser.urlencoded({
  extended: true
}));



function uploadVehicleInfo(req, res) {
  if (req.body.status == '201') {
    console.log(JSON.stringify(req.body));
    var vehicle_data = req.body;
    var resource_url = (vehicle_data.http_proto) + '://' + (vehicle_data.server_host) + '/' + (vehicle_data.file);
    //console.log(resource_url);
    var query = `INSERT INTO cty_fleet (category, fueltype, imgId, vehicleId,resource_uri) VALUES ('${vehicle_data.veh_catg}','${vehicle_data.fuelid}','${vehicle_data.filename}','${vehicle_data.vehid}','${resource_url}')`;
    db.query(query, (err, result, fields) => {
      if (err) throw err;
      console.log('vehicle info saved');
    });
    res.send('201');
    res.end();
  } else {
    res.send('500');
    res.end();
  }

}

function getCategory(req, res) {
  var query = "select category from cty_category";
  var catg = [];
  db.query(query, (err, results) => {
    if (err) throw err;
    for (var i = 0; i < results.length; i++) {
      catg[i] = results[i].category;
    }
    res.send(JSON.stringify(catg));
    res.end();
  })
}

function setCategory(req, res) {
  var vehicle_data = req.body;
  var query = `INSERT INTO cty_category (category) VALUES ('${vehicle_data.new_category.toUpperCase()}')`;

  db.query(query, (err, result) => {
    if (err) throw err;
    res.send('201');
  })
}


function getVehicles(req, res) {
  var catg = req.query.catg;
  //const serverUrl = 'https://cityrentacar-node-server.herokuapp.com/assets';
  //const serverUrl='/images/fleet/';
  db.query("select category, vehicleId, imgId, fueltype, resource_uri from cty_fleet where `category`='" + catg.toUpperCase() + "'", (err, result, fields) => {
    if(err) throw err;
    res.send(JSON.stringify(result));
  })
}

function status(req, res) {
  res.write('Running');
  res.end();
}

function upload(req, res) {
  uploadVehicleInfo(req, res);
}

/****************************** ROUTE MAPPING *****************************/
app.use('/upload', upload);
app.use('/getVehicles', getVehicles);
app.use('/status', status);
app.use('/getCategory', getCategory);
app.use('/setCategory', setCategory);