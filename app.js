const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
const path = require('path');
const session = require('express-session');
const init = require('./authification');
const passport = require("passport");
const { authenticate } = require('./models/sequelize');






const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const fablabRouter = require('./routes/click-fablab');


const app = express();
const cookieSigningKey = "Mon secret";


app.locals.moment = require('moment');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser(cookieSigningKey));
app.use(
  session({ secret: cookieSigningKey, saveUninitialized: false, resave: false })
);
app.use(express.static(path.join(__dirname, 'public')));
// authentication setup
app.use(passport.initialize());
// pauseStream is needed because passport.deserializeUser uses async.
app.use(passport.session({ pauseStream: true }));
init.initialiser();


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/click-fablab', fablabRouter);



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
