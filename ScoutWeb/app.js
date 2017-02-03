var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer  = require('multer')
var Parse = require('parse/node').Parse;
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var index = require('./routes/index');
var register = require('./routes/register');
var dashboard = require('./routes/dashboard');
var rewards = require('./routes/rewards');
var logout = require('./routes/logout');
var heatmap = require('./routes/heatmap');
var profile = require('./routes/profile');
var app = express();

Parse.initialize('DiEded8eK6muPcH8cdHGj8iqYUny65Mva143CpQ3','unused');
Parse.serverURL = 'https://scoutparseserver.herokuapp.com/parse';

// app.post('/',function(req,res){
//     sess = req.session;
//     res.end('done');
// });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.post('/', function(req, res){
//   req.session = req.session;
//   res.redirect('/');
// });

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(multer({
    inMemory: true,
    limits: {
        fieldNameSize: 256,
        files: 2,
        fileSize: 10000000
    }
}))

app.use(session({
    cookie: { maxAge: 1000 * 60 * 1 }, //1 hour (in milliseconds)
    secret: 'scoutSessionSecret',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
        url: 'mongodb://scoutuser:scoutpass@ds033259.mlab.com:33259/scoutdb',
        collection: 'ScoutSessions'
    })
}));

// app.use(session({ store: new RedisStore({
//   client: client,
//   host:'127.0.0.1',
//   port:6379,
//   prefix:'sess',
//   ttl: 30 * 60 // 30 minutes (Session store time)
//   }),
//     secret: 'scoutSessionSecret',
//     resave: false,
//     saveUninitialized: true,
// }));

app.use(express.static(path.join(__dirname, 'public')));

// app.use(function(req, res, next) {
//     if (req.session) {
//         // sess = req.session;
//         // console.log('Session changed ' + sess);
//         // res.redirect('/dashboard');
//     }
//     else {
//         res.render('index', { title: 'Scout', filename: 'index' });
//     }
// });

// auth checking
function authChecker(req, res, next) {
    if ((req.session != null) || req.path === '/'){
        // if (req.path === '/')
        // {
        //     res.redirect('/dashboard');
        // }
        // else
        // {
            next();
        // }
    }
    else {
        res.redirect('/');
    }
}
app.use(authChecker);

// url routing
app.use('/', index);
app.use('/register', register);
app.use('/dashboard', dashboard);
app.use('/rewards', rewards);
app.use('/logout', logout);
app.use('/heatmap', heatmap);
app.use('/profile', profile);

// app.post('/', function(req, res, next) {
//     sess = req.session;
// });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        console.log(err);
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

var port = process.env.PORT || 3000;

var server = app.listen(port, function () {
    console.log('listening on http://localhost:%d', port);
});
