'use strict';

const router = require('express').Router();

router.post('/user/:userId/archivate', require('./controllers/user/archivate'));

module.exports = router;
