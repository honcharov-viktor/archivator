'use strict';

const router = require('express').Router();

router.post('/user/:id/archivate', require('./controllers/user/archivate'));

module.exports = router;
