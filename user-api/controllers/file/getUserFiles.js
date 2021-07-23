const { s3 } = require('../../db/s3Client');
const config = require('../../config');

async function getUserFiles(req, res) {
  const userId = req.params.userId;

  const filesList = [];
  let continuationToken;
  while (1) {
    // get files list by prefix
    const { files, nextContinuationToken } = await getFilesListByPrefix(userId, continuationToken);
    filesList.push(...files);
    if (!nextContinuationToken) {
      break;
    }
    continuationToken = nextContinuationToken;
  }

  return res.json({ filesList });
}

async function getFilesListByPrefix(prefix, continuationToken) {
  const list = await s3.listObjects({
    Bucket: config.s3.userFilesBucket,
    Prefix: `${prefix}/`,
    ContinuationToken: continuationToken,
    Delimiter: '/',
  }).promise();
  const files = list.Contents.map(file => file.Key);

  return {
    files,
    nextContinuationToken: list.NextContinuationToken,
  }
}

module.exports = (req, res, next) => getUserFiles(req, res).catch(next);
