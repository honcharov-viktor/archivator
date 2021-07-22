'use strict';

const uuid = require('uuid');
const amqp = require('amqplib/callback_api');

const logger = require('../helpers/logger');
const { amqpUrl, queues } = require('../config');

const RECONNECTION_TIMEOUT = 1000;

// if the connection is closed or fails to be established at all, we will reconnect
let amqpConn = null;
let pubChannel = null;
let isConnected = false;
let reconnectOnClose = true;

createConnection();

function createConnection() {
  // create connection:
  amqp.connect(amqpUrl + '?heartbeat=60', (err, conn) => {
    if (err) {
      logger.error('[AMQP]', err.message);
      isConnected = false;
      return setTimeout(createConnection, RECONNECTION_TIMEOUT);
    }
    conn.on('error', (err) => {
      if (err.message !== 'Connection closing') {
        logger.error('[AMQP] conn error', err.message);
      }
    });
    conn.on('close', () => {
      if (!reconnectOnClose) return;
      logger.error('AMQP reconnecting');
      isConnected = false;
      return setTimeout(createConnection, RECONNECTION_TIMEOUT);
    });

    logger.info('AMQP connected');
    isConnected = true;
    amqpConn = conn;

    // create channel:
    amqpConn.createConfirmChannel((err, ch) => {
      if (closeOnErr(err)) return;
      ch.on('error', (err) => { logger.error('AMQP channel error', err.message); });
      ch.on('close', () => { logger.info('AMQP channel closed'); });
      pubChannel = ch;
    });
  });
}

function sendTask(queue, taskMsg) {
  try {
    taskMsg.taskId = taskMsg.taskId || uuid.v4(); // for identify it in worker

    const msgInBuffer = Buffer.from(JSON.stringify(taskMsg));
    const queueOptionsDefault = { persistent: true };

    pubChannel.publish('', queue, msgInBuffer, queueOptionsDefault, (err, ok) => {
      if (err) {
        logger.error('[AMQP] publish', err);
        return pubChannel.connection.close();
      }
      logger.info('[AMQP] task send', { ...taskMsg, queue });
    });
  } catch (err) {
    logger.error('[AMQP] publish', err.message);
  }
}

function disconnect() {
  return new Promise(resolve => {
    reconnectOnClose = false;
    return amqpConn
      ? amqpConn.close(() => {
        logger.info('[AMQP] closed');
        resolve(true)
      })
      : resolve(true);
  })
}

function closeOnErr(err) {
  if (!err) return false;
  logger.error('[AMQP] create channel error', err);
  amqpConn.close();
  return true;
}

module.exports = {
  archivator: sendTask.bind(null, queues.archivator),

  isConnected: () => isConnected,
  disconnect: disconnect,
};
