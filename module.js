var fs = require('fs');

module.exports={
  log: {
    uptime: function(){
    fs.appendFile('log/uptime.log', new Date().toLocaleString()+"\n", function (err) {
      if (err) throw err;
      //console.log('Saved!');
    });
    }
  }
}