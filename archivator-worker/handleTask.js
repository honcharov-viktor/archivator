const taskCONST = require('./constants');
const archivate = require('./controllers/user/archivate');

async function handleTask(task) {
  switch (task.type) {
    case taskCONST.taskTypes.ARCHIVATE:
      await archivate(task);
      break;
    default:
      throw new Error(`not supported task type ${task.type}`);
  }
}

module.exports = handleTask;
