// Loading basic Express module
var express = require('express')
    , http = require('http')
    , path = require('path');

// Loading Express middleware
var bodyParser = require('body-parser')
    , static = require('serve-static')
    // Loading cookie-parser middleware
    , cookieParser = require('cookie-parser');
    // , errorHandler = require('errorhandler');
    
// Using error-handler module
var expressErrorHandler = require('express-error-handler');

// Loading Session middleware
var expressSession = require("express-session");

// Create Express object
var app = express();

// Configure the basic port
app.set('port', process.env.PORT || 3000);

// Using body-parser to parsing "application/x-www-form-urlencoded"
app.use(bodyParser.urlencoded({ extended: false }))

// Using body-parser parsing application/json
app.use(bodyParser.json())
app.use('/public', static(path.join(__dirname, 'public')));

// cookie-parser setting
app.use(cookieParser());

// Session setting
app.use(expressSession({
    secret:'my key',
    resave: true,
    saveUninitialized: true
}));

// Router Object
var router = express.Router();

// Routing function for product information
router.route('/process/product').get(function(req, res) {
    console.log('/process/product called.');

    if(req.session.user) {
        res.redirect('/public/product.html');
    } else {
        res.redirect('/public/login2.html');
    }
});

// Login Routing function - After login, session will save
router.route('/process/login').post(function(req, res) {
    console.log('/process/login called.');

    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;

    if (req.session.user) {
        // If already logged in,
        console.log('Already logged in. Move to product information page.');

        res.redirect('/public/product.html');
    } else {
        // Save session
        req.session.user = {
            id: paramId,
            name: 'Song',
            authorized: true
        };

        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
        res.write('<h1>Log in Success!</h1>');
        res.write('<div><p>Param id : ' + paramId + '</p></div>');
        res.write('<div><p>Param password : ' + paramPassword + '</p></div>');
        res.write("<br><br><a href='/process/product'>Move to the product information page.</a>");
        res.end();
    }
});

// After log out, session will be deleted.
router.route('/process/logout').get(function(req, res) {
    console.log('/process/logout 호출됨.');

    if (req.session.user) {
        // If already logged in,
        console.log('Logging out.');

        req.session.destroy(function(err) {
            if(err) {throw err;}

            console.log('Log out successed. Session will be delete.');
            res.redirect('/public/login2.html');
        });
    } else {
        // If not logged in,
        console.log('You are not log in yet.');

        res.redirect('/public/login2.html');
    }
});

// Adding Router object to app object
app.use('/', router);

// Error page for unregistered path
app.all('*', function(req, res) {
    res.status(404).send('<h1>ERROR - Could not find the page.</h1>');
});

// After routed, 404 error page handled.
var errorHandler = expressErrorHandler({
    static: {
        '404': './public/404.html'
    }
});

app.use( expressErrorHandler.httpError(404) );
app.use( errorHandler );

http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});