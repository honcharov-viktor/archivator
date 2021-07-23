'use strict';

const config = require('../config');

const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  endpoint: config.s3.endpoint,
  credentials: {
    accessKeyId: config.s3.accessKey,
    secretAccessKey: config.s3.secretKey,
  },
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

function testConnection() {
  return new Promise((resolve, reject) => {
    s3.listBuckets((err, buckets) => {
      if (err) return reject(err);
      resolve(true);
    });
  });
}

module.exports = {
  s3,
  isConnected: testConnection
};
