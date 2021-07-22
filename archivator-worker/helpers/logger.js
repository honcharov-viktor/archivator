function log(msg, additionalData) {
  console.log(JSON.stringify({msg, additionalData}));
}
// TODO: implement logger
module.exports = {
  debug: log,
  info: log,
  warning: log,
  error: log,
};
