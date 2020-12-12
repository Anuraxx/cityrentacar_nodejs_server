var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  host:"smtp.mail.yahoo.com",
  service: "Yahoo",
  auth: {
    user: 'noreply.cityrentacar@yahoo.com',
    pass: 'kwctnavltpekpxfy'
  },
  port: 465,
  secure: false

});



var mailOptions = {
  from: 'noreply.cityrentacar@yahoo.com',
  to: 'omavihso@gmail.com',
  subject: 'ALERT!',
  html: '',
  setDetails: function(details){
    var template= `<div style="border: 1px solid rgba(0, 0, 0, 0.212); max-width: 800px;margin: auto;"> <div class="header" style="text-align: center;margin: 30px auto;margin-bottom: 100px;"> <div class="logo_container" style=""> <div class="logo" style=""><a href="#"> <img src="https://cdn.glitch.com/d37c8188-448c-4a1a-a032-0885b34ea28d%2Fcracar.png?v=1607785397562" alt="" style="width: 100px; border-radius: 50%;"></a> </div></div></div><div style="height: 290px;background-image: url('https://cdn.glitch.com/d37c8188-448c-4a1a-a032-0885b34ea28d%2Ftemplate2.JPG?v=1607785406691');position: relative;" class="table_cont"> <div style="width: 60%;text-align: center; margin: auto;top: -50px;position: relative;" class="div1"> <p style="font-size: 35px;color: #B5739D;font-family: 'Lucida Console' !important;">ENQUIRY</p></div><div style="width: 60%;text-align: center;margin: auto;position: relative;top: 30px;" class="div2"> <div style="width: 100%;"> <p style="display: inline;width: 48%;float: left;margin: 0;margin-bottom: 10px;margin-right: 2%;float: left;background-color: white;">Customer Name</p><p style="display: inline;width: 48%;float: left;margin: 0; margin-bottom: 10px;margin-right: 2%;background-color: white;">${details.custName}</p></div><div style="width: 100%;"> <p style="display: inline;width: 48%;float: left;margin: 0;margin-bottom: 10px;margin-right: 2%;float: left;background-color: white;">Email</p><p style="display: inline;width: 48%;float: left;margin: 0; margin-bottom: 10px;margin-right: 2%;background-color: white;">${details.custEmail}</p></div><div style="width: 100%;"> <p style="display: inline;width: 48%;float: left;margin: 0;margin-bottom: 10px;margin-right: 2%;float: left;background-color: white;">Contact</p><p style="display: inline;width: 48%;float: left;margin: 0; margin-bottom: 10px;margin-right: 2%;background-color: white;">${details.custContact}</p></div><div style="width: 100%;"> <p style="display: inline;width: 48%;float: left;margin: 0;margin-bottom: 10px;margin-right: 2%;float: left;background-color: white;">Day Of Requirement</p><p style="display: inline;width: 48%;float: left;margin: 0; margin-bottom: 10px;margin-right: 2%;background-color: white;">${details.requiDay}</p></div><div style="width: 100%;"> <p style="display: inline;width: 48%;float: left;margin: 0;margin-bottom: 10px;margin-right: 2%;float: left;background-color: white;">Type Of Car</p><p style="display: inline;width: 48%;float: left;margin: 0; margin-bottom: 10px;margin-right: 2%;background-color: white;">${details.typeOfCar}</p></div></div></div></div>`
    mailOptions.html= template;
  } 
};

function fillDetails(req,res){
   var details={
    custName: req.body.name,
    custEmail: req.body.email,
    custContact: req.body.contact,
    requiDay: req.body.dor,
    typeOfCar: req.body.type
   }
  mailOptions.setDetails(details);
}

module.exports = function(req, res){
  fillDetails(req,res);
  //console.log(mailOptions.html);
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  }); 
} 


