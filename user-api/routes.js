'use strict';

const router = require('express').Router();

router.get('/user/:userId/files/getSignedUrl', require('./controllers/file/getSignedUrl'));
router.put('/user/:userId/files/uploadFile', require('./controllers/file/uploadFile'));
router.get('/user/:userId/files', require('./controllers/file/getUserFiles'));

module.exports = router;
