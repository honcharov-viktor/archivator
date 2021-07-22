const { archivator } = require('../../db/amqp');
const taskCONST = require('../../constants');

async function archivate(req, res) {
  archivator({test: 'ok', type: taskCONST.taskTypes.ARCHIVATE});
  return res.json({test: 'ok'});
}

module.exports = (req, res, next) => archivate(req, res).catch(next);
