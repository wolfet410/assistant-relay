const createError = require('http-errors');
const cron = require("node-cron");
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const {initializeServer, isUpdateAvailable} = require('./helpers/server');

const serverRouter = require('./routes/server');
const indexRouter = require('./routes/index');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, './views')));

global.assistants = {};

cron.schedule("0 1 * * *", function() {
  if(isUpdateAvailable) console.log(`An update is available. Please visit https://github.com/greghesp/assistant-relay/releases`);
});

(async function () {
  try {
    await initializeServer();
  } catch (e) {
    console.error(e)
  }
})();


app.use('/server', serverRouter);
app.use('/', indexRouter);
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  console.log(req.body, req.query)
  console.log(err)
});

module.exports = app;
