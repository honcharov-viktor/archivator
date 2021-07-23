const Stream = require('stream');

const { s3 } = require('../../db/s3Client');
const config = require('../../config');

// TODO: fix url for getSignedUrl and remove this
async function uploadFile(req, res) {
  const userId = req.params.userId;
  const filename = req.query.filename;

  const passThroughStream = new Stream.PassThrough;
  req.pipe(passThroughStream);

  await s3.upload({
    Bucket: config.s3.userFilesBucket,
    Key: `${userId}/${filename}`, //filename
    Expires: 100, //time to expire in seconds
    ContentType: 'application/octet-stream',
    ACL: 'public-read',
    Body: passThroughStream,
  }).promise();
  return res.json({});
}

module.exports = (req, res, next) => uploadFile(req, res).catch(next);
