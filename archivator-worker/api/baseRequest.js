'use strict';

const axios = require('axios');
const { name } = require('../package.json');

module.exports = axios.create({
  headers: {'User-Agent': name},
});
