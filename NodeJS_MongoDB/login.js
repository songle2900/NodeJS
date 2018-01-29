// Calling basic Express modules
var express = require('express')
    , http = require('http')
    , path = require('path');

// Calling Express middlewares
var bodyParser = require('body-parser')
    , cookieParser = require('cookie-parser')
    , static = require('serve-static')
    , errorHandler = require('errorhandler');

// Using error-handler module
var expressErrorHandler = require('express-error-handler');

// Calling session middleware
var expressSession = require('express-session');

// Create express object
var app = express();

// Setting basic property(port)
app.set('port', process.env.PORT || 3000);

// Using body-parser to parsing "application/x-www-form-urlencoded"
app.use(bodyParser.urlencoded({extended: false}));

// Using body-parser to parsing application/json
app.use(bodyParser.json());

// Open "/public" folder as static
app.use('/public', static(path.join(__dirname, 'public')));

// Setting cookie-parser
app.use(cookieParser());

// Setting session
app.use(expressSession({
    secret: 'my key',
    resave: true,
    saveUninitialized: true
}));

// Using mongodb module
var MongoClient = require('mongodb').MongoClient;

// Declare a varaible for database object
var database;

// Connecting database
function connectDB() {
    // Database connection information
    var databaseUrl = 'mongodb://localhost:27017/local';

    // Connect database
    MongoClient.connect(databaseUrl, function(err, db) {
        if (err) throw err;

        console.log('Database Connected. : ' + databaseUrl);

        // Assign to database variable
        database = db;
        
    });
}

// Refer routing object
var router = express.Router();

// Login routing function - compare the database information
router.route('/process/login').post(function(req, res) {
    console.log('/process/login called.');

    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;

    console.log('Requesting Parameters : ' + paramId + ', ' + paramPassword);

    if(database) {
        authUser(database, paramId, paramPassword, function(err, docs) {
            if(err) {throw err;}

            if(docs) {
                console.dir(docs);
                var username = docs[0].name;
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h1>Log-in succeed.</h1>');
                res.write('<div><p>User ID : ' + paramId + '</p></div>');
                res.write('<div><p>User Name : ' + username + '</p></div>');
                res.write("<br><br><a href='/public/login.html'>Sign in again.</a>");
                res.end();
            }
        });
    } else {
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
        res.write('<h2>Database connection failed.</h2>');
        res.write('<div><p>Failed to connect to database.</p></div>');
        res.end();
    }
});

// Register router object
app.use('/', router);

// Function to authenticate users
var authUser = function(database, id, password, callback) {
    console.log('authUser called.');

    // See the users collection
    var users = database.collection('users');

    // Search using ID and password
    users.find({"id" : id, "password" : password}).toArray(function(err, docs) {
        if(err) {
            callback(err, null);
            return;
        }

        if(docs.length > 0) {
            console.log('Find a user whose ID [%s] and Password [%s] match.');
            callback(null, docs);
        } else {
            console.log("No matching users found.");
            callback(null, null);
        }
    });
}

// 404 Error page
var errorHandler = expressErrorHandler({
    static: {
        '404': './public/404.html'
    }
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

// Starts the server
http.createServer(app).listen(app.get('port'), function() {
    console.log('Server Started. PORT : ' + app.get('port'));

    connectDB();
});