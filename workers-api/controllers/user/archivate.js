const { archivator } = require('../../db/amqp');
const taskCONST = require('../../constants');

async function archivate(req, res) {
  const userId = req.params.userId;
  archivator({type: taskCONST.taskTypes.ARCHIVATE, userId});
  return res.json({});
}

module.exports = (req, res, next) => archivate(req, res).catch(next);
