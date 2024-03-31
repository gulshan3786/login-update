
var express = require("express");
var app = express();

var router=require("./route")



const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port=3001;

app.use("/",router);

  app.listen(port,(err)=>{
    if(err)throw err;
    console.log(`app is listening on ${port}`)
  });
  
