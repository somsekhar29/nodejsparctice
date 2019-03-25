var express=require('express'),
    app=express(),
    port=process.env.port||3000;
    mongoose=require('mongoose'),
    // mongodb=require('mongodb').MongoClient,
    Task=require('./api/models/todoListModel'),
    bodyParser=require('body-parser');

    mongoose.Promise = global.Promise;
    mongoose.connect('mongodb://localhost/Tododb'); 
    
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

var routes=require('./api/routes/todoListRoutes');
    routes(app);

    app.use(function(req, res) {
        res.status(404).send({url: req.originalUrl + ' not found'})
      });

app.listen(port);

console.log("port started on:" + port);
