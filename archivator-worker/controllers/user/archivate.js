const Stream = require('stream');
const archiver = require('archiver');
const { Z_BEST_COMPRESSION } = require('zlib').constants;

const { s3 } = require('../../db/s3Client');
const logger = require('../../helpers/logger');
const userApiService = require('../../api/userApiService');

async function archivate(task) {
  logger.debug('got task', task);
  const userFiles = await userApiService.getUserFiles(task.userId);
  logger.debug('userFiles', {userFiles});
  await archivateFiles(task.userId, userFiles.filesList);
  logger.debug('done task', task);
}

const archivateFiles = async (userId, userFiles) => new Promise((resolve, reject) => {
  logger.debug(`${userId} start archivate files`);
  const archive = archiver('tar', { gzip: true, gzipOptions: { level: Z_BEST_COMPRESSION } });
  archive.on('error', reject);
  archive.on('warning', reject);

  let newFiles = []; // contain files array with modified 'exist' property

  const uploadStream = new Stream.PassThrough;

  const uploader = s3.upload({
    Bucket: archiveBucket,
    Key: `${userId}/files.tar.gz`,
    Body: uploadStream,
  });
  uploader
    .promise()
    .then(() => resolve(newFiles)) 
    .catch((error) => {
      error.key = `${userId}/files.tar.gz`;
      reject(error);
    });

  archive.pipe(uploadStream);

  streamFilesToArchive(archive, userFiles)
    .then(() => archive.finalize())
    .catch(reject);
});

/**
 * stream files to archive one by one and throw error if one of files is failed
 * @param {archiver} archive 
 * @param {*} userFiles 
 */
 async function streamFilesToArchive(archive, userFiles) {
  for (let file of userFiles) {
    await streamFileToArchive(archive, file);
  }
}

/**
 * stream files to archive one by one and throw error if one of files is failed
 * @param {archiver} archive 
 * @param {*} projectFiles 
 */
async function streamFileToArchive(archive, file) {
  const from = `/${file}`;
  const to = `/${file}`;
  await new Promise((resolve, reject) => {
    // check file exist then pipe it to archive
    s3.getFileStream(from)
      .then(({ stream, headObject }) => {
        // we need mimic stream as a stream from file system to make archiver/tar work as with stream and not as with buffer. stats.size is required
        archive.append(stream, { name: to, stats: { size: headObject.ContentLength }, });
        stream.on('end', resolve); // go to next file
      })
      .catch((error) => {
        error.file = file;
        // if file unexist in storage mark this in file info and save with structure
        if (error.code === 'NotFound') {
          logger.debug('NotFound' , { from });
          return resolve(); // go to next file
        }
        reject(error);
      });
  });
  return file;
}

module.exports = archivate;
