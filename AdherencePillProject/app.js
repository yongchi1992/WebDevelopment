var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ParseServer = require('parse-server').ParseServer;
var dotenv = require('dotenv');
dotenv.load();

var fs = require('fs')
var routes = require('./routes/index');
var user = require('./routes/user');
var password = require('./routes/password');
var doctor = require('./routes/doctor');
var patient = require('./routes/patient');
var pharmacy = require('./routes/pharmacy');
var tests = require('./routes/tests');
var account = require('./routes/account');
var bottleUpdate = require('./routes/bottleUpdate');
var bottleUpdateDelete = require('./routes/bottleUpdateDelete');
var bottleWifi = require('./routes/bottleWifi');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('json spaces', 40);

//CORS middleware
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type,X-Parse-Application-Id,X-Parse-Session-Token');

    next();
};
app.use(allowCrossDomain);
// Set Parse Server env
var api = new ParseServer({
  databaseURI: process.env.DATABASE_URI || 'mongodb://localhost:27017/parse',
  // databaseURI: process.env.DATABASE_URI || '',
  // databaseURI: process.env.DATABASE_URI || 'mongodb://129.105.36.93:5000/adherence',
  cloud: process.env.CLOUD_CODE_MAIN || './cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || 'myMasterKey',
  // clientKey: 'myClientKey',
  serverURL: process.env.SERVER_URL || '',
  // serverURL: process.env.SERVER_URL || 'http://localhost:5000/parse',
  liveQuery: {
    classNames: ["Posts", "Comments"]
  }
});
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})
app.use(logger('dev', {stream: accessLogStream}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));

app.use('/', routes);
app.use('/user', user);
app.use('/password', password);
app.use('/patient', patient);
app.use('/doctor', doctor);
app.use('/pharmacy', pharmacy);
app.use('/test', tests);
app.use('/account', account);
app.use('/update', bottleUpdate);
app.use('/bottleWifi', bottleWifi);


// catch 404 and forward to error handler
app.use(function(err, req, res, next) {

  if (err.status == 404) {
    res.json({
      'message': 'path ' + req.originalUrl + ' Not Found'
    })
  }
});

app.post('/upload', function(req, res) {
  console.log("hi");
  
  var writeStream = fs.createWriteStream('./res.jpeg');
  req.pipe(writeStream);

  req.on('end', function () {
    res.writeHead(200, {"content-type":"text/html"});
    res.end('<form method="POST"><input name="test" /><input type="submit"></form>');
  });

});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
