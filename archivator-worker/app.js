const express = require('express');

const app = express();

const rabbitConsumerStart = require('./db/amqp').start;

rabbitConsumerStart();

module.exports = app;
