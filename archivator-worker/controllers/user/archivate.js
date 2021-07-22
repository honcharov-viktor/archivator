const logger = require('../../helpers/logger');

async function archivate(task) {
  logger.debug('got task', task);
}

module.exports = archivate;
