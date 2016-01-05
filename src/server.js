var bodyParser = require('body-parser');
var express = require('express');
var expressHandlebars = require('express-handlebars');
var logger = require('morgan');
var path = require('path');
var session = require('express-session');

var Configuration = require('./lib/Configuration');
var globalConfig = require('./config');

var app = express();

// load config
globalConfig.set(Configuration.load(path.resolve(__dirname, '../config')));

// view engine setup
var handlebars = expressHandlebars.create({
	defaultLayout: 'layout',
	extname: '.hbs',
	helpers: {
		uiComponentsVersion: function() {
			return globalConfig.get().getUIComponentsVersion();
		},
	},
	layoutsDir: path.join(__dirname, 'views/layouts'),
	partialsDir: path.join(__dirname, 'views/partials'),
});
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', handlebars.engine);
app.set('view engine', '.hbs');

// serve static files
app.use(express.static(path.join(__dirname, '../images')));
app.use(express.static(path.join(__dirname, 'public')));

// disable logging for static content requests
app.use(logger('dev'));

// parse bodies of incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// create a session middleware
app.use(session({
	resave: false,
	saveUninitialized: false,
	secret: '257083C0-B863-40E9-96C3-2E28D7C5D5DC',
}));

// define routes
app.use('/', require('./routes/app'));
app.use('/auth', require('./routes/auth'));
app.use('/loyalty', require('./routes/loyalty'));
app.use('/ts', require('./routes/ts-api'));

// set error handlers
app.use(function(error, req, res, next) {
	res.status(error.status || 500);
	res.render('error', {
		// only display stacktraces in development
		error: app.get('env') === 'development' ? error : {},
		message: error.message,
	});
});

module.exports = app;
