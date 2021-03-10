const express = require("express");
const parser = require("body-parser");
const mysql = require('mysql');
var formidable = require('formidable');
const jsyaml = require("js-yaml")
var fs = require('fs');
const sendMail=require("./communication");
const modules=require("./module");
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
      console.log(`[${configs.DB_CONFIG.host}] db connected`);
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
var debug = process.env.debug || false;

app.listen(port, () => {
  console.log(`servr stated on port :: ${port}`);
  loadConfigs(() => {
    console.log("configuration loaded.");
    db_config = configs.DB_CONFIG;
    handleDisconnect();
  });
});

const logger =(req, res, next)=>{
  console.log(`[ ${new Date().toLocaleString()} ${req.hostname} ${(req.originalUrl).split('?')[0]} ${req.method} ]`);

  next();
}


const corsAuth = function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-requested-with");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT");
  res.writeHead(200);
  //res.sendStatus(200);
  next();
}
app.use(corsAuth);
app.use(parser.json());
app.use(parser.urlencoded({
  extended: true
}));
app.use('/',logger);


function uploadVehicleInfo(req, res) {
  if (req.body.status == '201') {
    console.log(JSON.stringify(req.body));
    var vehicle_data = req.body;
    var resource_url = (vehicle_data.http_proto) + '://' + (vehicle_data.server_host) + '/' + (vehicle_data.file);
    //console.log(resource_url);
    var query = `INSERT INTO cty_fleet (category, fueltype, imgId, vehicleId,resource_uri) VALUES ('${vehicle_data.veh_catg.toUpperCase()}','${(((vehicle_data.fuelid).toUpperCase()).substring(0,1)).concat(((vehicle_data.fuelid).toLowerCase()).substring(1))}','${vehicle_data.filename}','${vehicle_data.vehid.toUpperCase()}','${resource_url}')`;
    db.query(query, (err, result, fields) => {
      if (err) throw err;
      console.log('vehicle info saved');
      res.end('201');
    });
    //res.send('201');

  } else {
    //res.send('500');
    res.end('500');
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
    //res.send();
    res.end(JSON.stringify(catg));
  })
}

function setCategory(req, res) {
  if (Object.keys(req.body).length) {
    var vehicle_data = req.body;
    console.log(vehicle_data);
    var query = `INSERT INTO cty_category (category) VALUES ('${vehicle_data.new_category.toUpperCase()}')`;

    db.query(query, (err, result) => {
      if (err) throw err;
      res.end('201');
    })
  } else {
    res.end('401');

  }

}


function getVehicles(req, res) {
  //console.log(req.query);
  if (Object.keys(req.query).length) {
  var catg = req.query.catg;
  //const serverUrl = 'https://cityrentacar-node-server.herokuapp.com/assets';
  //const serverUrl='/images/fleet/';
  db.query("select category, vehicleId, imgId, fueltype, resource_uri from cty_fleet where `category`='" + catg.toUpperCase() + "'", (err, result, fields) => {
    if (err) throw err;
    res.end(JSON.stringify(result));
  })
  }
  else{
    res.end('400');
  }
}

function status(req, res) {
  res.write('Running');
  res.end();
}

function upload(req, res) {
  uploadVehicleInfo(req, res);
}

function sendMailToOwner(req,res){
  if(Object.keys(req.body).length){
    //console.log(req.body);
    sendMail(req,res);
    res.end('201');
  }
  else{
    res.end('401');
  }
}

var query_result;
function queryExecutor(queryName){
  fs.readFile('./resources/Queries/generic.yaml', (err, data) => {
    if(err) throw err;

    var queries = jsyaml.load(data);

    if(queries[queryName] != undefined){
      db.query(queries[queryName] , (err, result) => {
        if (err) throw err;
        query_result= JSON.stringify(result);
      })
    }
  });
}

function getDataFromQuery(req,res){
  if(Object.keys(req.query).length){
    queryExecutor(req.query.query_name);
    setTimeout(()=>{
      res.end(query_result);
    },2000);
  }else res.end('400');
}

function restart(req,res){
  console.log("restarted");
  modules.log.uptime();
  res.end('Running');
}

function authenticate(req,res){
  if(Object.keys(req.query).length){
    db.query("select username, passcode from cty_admin where `username`='"+`${req.query.username}`+"'", (err, result, fields) => {
      if (err) throw err;
      if(result.length!=0 && result[0].passcode==req.query.passcode){
        res.end('SUCCESS');
      }
      else
        res.end('FAIL');
    })
  }else res.end('400');
}
/****************************** ROUTE MAPPING *****************************/
app.use('/upload', upload);
app.use('/getVehicles', getVehicles);
app.use('/status', status);
app.use('/getCategory', getCategory);
app.use('/setCategory', setCategory);
app.use('/ping/mail', sendMailToOwner);
app.use('/getDataFromQuery', getDataFromQuery);
app.use('/restart',restart);
app.use('/auth',authenticate);