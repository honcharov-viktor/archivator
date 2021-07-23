const axios = require('axios');
const baseRequest = require('../baseRequest');

const config = require('../../config');

const baseURL = config.apiUrls.userApiService;

const serviceRequest = axios.create({
  ...baseRequest.defaults,
  baseURL,
});

serviceRequest.makePrettyError = (e) => {
  const error = new Error();
  if (e.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    error.data = e.response.data;
    error.status = e.response.status;
    error.headers = e.response.headers;
  } else {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    // Something happened in setting up the request that triggered an Error
    error.message = e.message;
  }

  error.config = {
    ...e.config,
  };
  delete error.config.transformRequest;
  delete error.config.transformResponse;
  delete error.config.validateStatus;
  delete error.config.adapter;
  throw error;
};

module.exports = serviceRequest;
