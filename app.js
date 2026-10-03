var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const expressSession = require('express-session');
require('dotenv').config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
const connectDB = require("./config/db");

var app = express();
app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET || 'change-this-session-secret-before-production',
    cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 1000 * 60 * 60 * 8 }
}));
connectDB();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const sectionAssets = new Set([
    'site-shell', 'navbar', 'hero', 'about', 'stats', 'services', 'projects',
    'project-card', 'gallery', 'testimonials', 'latest-news', 'contact', 'footer', 'team'
]);
app.get('/section-assets/:section/:asset', (req, res, next) => {
    const { section, asset } = req.params;
    if (!sectionAssets.has(section) || ![`${section}.css`, `${section}.js`].includes(asset)) return next();
    res.sendFile(path.join(__dirname, 'views', 'sections', section, asset), (error) => {
        if (error) next(error);
    });
});

app.use(function(req, res, next) {
    res.locals.adminName = req.session && req.session.adminName;
    res.locals.flash = req.session && req.session.flash;
    if (req.session) delete req.session.flash;
    res.locals.year = new Date().getFullYear();
    res.locals.siteUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
