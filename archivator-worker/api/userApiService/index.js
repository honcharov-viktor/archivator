const serviceRequest = require('./serviceRequest');

module.exports.getUserFiles = (userId) => serviceRequest.request({
  method: 'get',
  url: `/api/user/${userId}/files`,
}).catch(serviceRequest.makePrettyError);;
