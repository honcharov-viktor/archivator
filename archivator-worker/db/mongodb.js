const mongoose = require('mongoose');

const config = require('../config');
const logger = require('../helpers/logger');

let isConnected = false; // Readiness status

mongoose.set('debug', config.mongooseDebug);

function connect() {
  return new Promise((resolve, reject) => {
    if (isConnected) return resolve();

    mongoose.connect(config.mongodbUrl, config.mongodbOptions);

    mongoose.connection.on('connected', () => {
      isConnected = true;
      logger.info('mongoose connected with pid', process.pid);
      return resolve();
    });
    mongoose.connection.on('error', (err) => {
      isConnected = false;
      logger.error('mongoose connection error:', err);
      return reject();
    });
    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      logger.info('mongoose disconnected');
      return reject();
    });
  });
}

function testConnection() {
  return new Promise((resolve, reject) => {
    if (!isConnected) return reject('not connected');

    mongoose.connection.db.admin()
      .ping((err, result) => ((err || !result) ? reject('no ping result') : resolve(true)));
  });
}

function disconnect() {
  return new Promise((resolve) => {
    mongoose.connection.close(() => {
      logger.info('mongoose disconnected through app termination pid', process.pid);
      resolve();
    });
  });
}

module.exports.isConnected = testConnection;
module.exports.disconnect = disconnect;
module.exports.connect = connect;
