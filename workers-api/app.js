
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const routes = require('./routes');

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '1Mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/api', routes);

//TODO: implement app.use(errorHandler);

module.exports = app;
