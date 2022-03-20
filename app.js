const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');
const app = express();
const DB = require('./db/dbModule');
// setting up DB
DB.setUpDB().then(() => console.log("DB stared successfully")).catch(err => console.log(err));
// setting middlewares
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true,
    sourceMap: true
}));
// setting up file server for images hosting
app.use(express.static(path.join(__dirname, 'public', 'images')));
// setting routers
app.use('/', indexRouter);
app.use('/api', apiRouter);

module.exports = app;
