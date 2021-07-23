const amqp = require('amqplib');

const { amqpUrl, workerQueue, queuePrefetchCount } = require('../config');
const logger = require('../helpers/logger');

const handleTask = require('../handleTask');

// if the connection is closed or fails to be established at all, we will reconnect
let amqpConn = null;

let isConnected = false;

function processMsg(channel) {
  return async (msg) => {
    const task = JSON.parse(msg.content.toString());
    logger.info(`[Worker] new task`, task);
    try {
      await handleTask(task);
      logger.info(`[Worker] done task`, task);
      channel.ack(msg);
    } catch (error) {
      // TODO: fix this error handler
      error.task = task;
      console.error(`[Worker] fail task`, error);
      // logger.error(`[Worker] fail task`, error);
      channel.reject(msg, false);
    }
  }
}

async function connect() {
  const connection = await amqp.connect(`${amqpUrl}?heartbeat=60`);
  logger.info('[AMQP] connected');
  isConnected = true;
  amqpConn = connection;

  const channel = await connection.createChannel();
  channel.prefetch(queuePrefetchCount);
  logger.info('[AMQP] createChannel');

  await channel.assertQueue(workerQueue, { durable: true });
  logger.info('[AMQP] assertQueue');

  return {channel, connection};
}

async function start() {
  while (true) {
    try {
      const {channel, connection} = await connect();
      channel.consume(workerQueue, processMsg(channel), { noAck: false });
      logger.info('[Worker] started and waiting for tasks');
      await new Promise((resolve, reject) => {
        connection.on('error', reject);
        connection.on('close', reject);
        channel.on('error', reject);
        channel.on('close', reject);
      });
    } catch (error) {
      closeOnErr(error);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      continue;
    }  
  }
}

function closeOnErr(err) {
  if (!err) return false;
  logger.error('[AMQP] error', err);
  amqpConn && amqpConn.close();
  return true;
}

function disconnect() {
  return new Promise(resolve => {
    reconnectOnClose = false;
    return amqpConn
      ? amqpConn.close(() => {
        logger.info("[AMQP] closed");
        resolve(true);
      })
      : resolve(true);
  })
}

module.exports = {
  start,
  isConnected: () => {
    if(isConnected) return Promise.resolve('RabbitMQ connected');
    return Promise.reject(new Error('RabbitMQ not connected'));
  },
  disconnect
};
