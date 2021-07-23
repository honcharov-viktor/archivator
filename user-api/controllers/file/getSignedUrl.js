const { s3 } = require('../../db/s3Client');
const config = require('../../config');

// TODO: throw SignatureDoesNotMatch fix url to minio
async function getSignedUrl(req, res) {
  const userId = req.params.userId;
  const filename = req.query.filename;

  const signedUrl = s3.getSignedUrl('putObject', {
    Bucket: config.s3.userFilesBucket,
    Key: `${userId}/${filename}`, //filename
    Expires: 100, //time to expire in seconds
    ContentType: 'application/octet-stream',
    ACL: 'public-read',
  });
  return res.json({ signedUrl });
}

module.exports = (req, res, next) => getSignedUrl(req, res).catch(next);
