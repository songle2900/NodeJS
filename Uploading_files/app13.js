// Loading basic Express module
var express = require('express')
    , http = require('http')
    , path = require('path');

// Loading Express middleware
var bodyParser = require('body-parser')
    , cookieParser = require('cookie-parser')
    , static = require('serve-static');
    // , errorHandler = require('errorhandler');
    
// Using error-handler module
var expressErrorHandler = require('express-error-handler');

// Loading Session middleware
var expressSession = require("express-session");

// Middleware for File-upload
var multer = require('multer');
var fs = require('fs');

// Supporting CORS(Multiple server connection), when "ajax" requested from the Client
var cors = require('cors');

// Create Express object
var app = express();

// Configure the basic port
app.set('port', process.env.PORT || 3000);

// Using body-parser to parsing "application/x-www-form-urlencoded"
app.use(bodyParser.urlencoded({ extended: false }))

// Using body-parser parsing application/json
app.use(bodyParser.json())

// Open public folder and uploads folder
app.use('/public', static(path.join(__dirname, 'public')));
app.use('/uploads', static(path.join(__dirname, 'uploads')));

// cookie-parser setting
app.use(cookieParser());

// Session setting
app.use(expressSession({
    secret:'my key',
    resave: true,
    saveUninitialized: true
}));

// Supporting CORS(Multiple server connection), when "ajax" requested from the Client
app.use(cors());

// Using multer middleware: in order of using middlesware, body-parser -> multer -> router
// Limited the file number and size
var storage = multer.diskStorage({
    /* multer Methods
        destination: 업로드한 파일이 저장될 폴더를 지정
        filename: 업로드한 파일의 이름을 바꿈
        limits: 파일 크기나 파일 개수 등의 제한 속성을 설정하는 객체 */  
    destination: function (req, file, callback) {
        callback(null, 'uploads')
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname + Date.now())
    }
});

var upload = multer({
    storage: storage,
    limits: {
        files: 10,
        fileSize: 1024 * 1024 * 1024
    }
});

// Router Object
var router = express.Router();

// File upload routing function - After log in, save session
router.route('/process/photo').post(upload.array('photo', 1), function(req, res) {
    console.log('/process/photo called.');

    try {
        var files = req.files;

        console.dir("#===== First Uploaded file's information =====#");
        console.dir(req.files[0]);
        console.dir('#=====#');

        // Declare variable that can save current file information
        var originalname = '',
            filename = '',
            mimetype = '',
            size = 0;

            if (Array.isArray(files)) {
                console.log("Number of file that inside of Array : %d", files.length);

                for (var index = 0; index < files.length; index++) {
                    originalname = files[index].originalname;
                    filename = files[index].filename;
                    mimetype = files[index].mimetype;
                    size = files[index].size;
                }
            } else {
                console.log("File # : 1 ");

                originalname = files[index].originalname;
                filename = files[index].name;
                mimetype = files[index].mimetype;
                size = files[index].size;
            }

            console.log("Current File's information : " + originalname + ', '
                        + filename + ', ' + mimetype + ', ' + size);
            
            // Send respond to client
            res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
            res.write('<h3>File upload success</h3>');
            res.write('<hr/>');
            res.write('<p>Original File Name: : ' + originalname + 
                      ' -> Saved File name : ' + filename + '</p>');
            res.write('<p>MIME TYPE : ' + mimetype + '</p>');
            res.write('<p>Size of File : ' + size + '</p>');
            res.end();
    } catch(err) {
        console.dir(err.stack);
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