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

async function getFileStream (path) {
  const params = { Bucket: filesBucket, Key: path };
  const headObject = await s3.headObject(params).promise();
  return {
    stream: s3.getObject(params).createReadStream(),
    headObject,
  };
};

module.exports = {
  s3,
  isConnected: testConnection,
  getFileStream,
};
