var express = require('express'),
  app = express(),
  port = process.env.port || 8080,
  mongoose = require('mongoose'),
  morgan = require('morgan'),
  jwt = require('jsonwebtoken'),
  config = require('./config'),
  // mongodb=require('mongodb').MongoClient,
  Task = require('./api/models/todoListModel'),
  bodyParser = require('body-parser');
  var User   = require('./api/models/user'); // get our mongoose model


mongoose.Promise = global.Promise;
mongoose.connect(config.database);
app.set('superSecret', config.secret);


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));





app.get('/', function (req, res) {
  res.send('port started on ' + port);
});

app.get('/setup', function (req, res) {

  // create a sample user
  var som = new User({
    name: 'somsekhar',
    password: 'som123',
    admin: true
  });

  // save the sample user
  som.save(function (err) {
    if (err) throw err;

    console.log('User saved successfully');
    res.json({ success: true });
  });
});

var apiRoutes = express.Router();

apiRoutes.post('/authenticate', function (req, res) {

  // find the user
  User.findOne({
    name: req.body.name
  }, function (err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      // check if password matches
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {

        // if user is found and password is right
        // create a token
        var payload = {
          admin: user.admin
        }
        var token = jwt.sign(payload, app.get('superSecret'), {
          expiresIn: 86400 // expires in 24 hours
        });

        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });
      }

    }

  });
});

apiRoutes.use(function(req, res, next) {

	// check header or url parameters or post parameters for token
	var token = req.body.token || req.param('token') || req.headers['x-access-token'];

	// decode token
	if (token) {

		// verifies secret and checks exp
		jwt.verify(token, app.get('superSecret'), function(err, decoded) {			
			if (err) {
				return res.json({ success: false, message: 'Failed to authenticate token.' });		
			} else {
				// if everything is good, save to request for use in other routes
				req.decoded = decoded;	
				next();
			}
		});

	} else {

		// if there is no token
		// return an error
		return res.status(403).send({ 
			success: false, 
			message: 'No token provided.'
		});
		
	}
	
});

apiRoutes.get('/', function(req, res) {
	res.json({ message: 'yes you are now an authenticated user' });
});

apiRoutes.get('/users', function(req, res) {
	User.find({}, function(err, users) {
		res.json(users);
	});
});

apiRoutes.get('/check', function(req, res) {
	res.json(req.decoded);
});
apiRoutes.get('/tasks',function(req, res) {
  Task.find({}, function(err, task) {
    if (err) res.send(err);
    res.json(task);
  });
})
apiRoutes.post('/tasks',function(req, res) {
  var new_task = new Task(req.body);
  new_task.save(function(err, task) {
    if (err) res.send(err);
    res.json(task);
  });
})

// var apiRoutes = require('./api/routes/todoListRoutes');
// apiRoutes(app);

app.use('/api', apiRoutes);

app.listen(port);

console.log("port started on:" + port);
