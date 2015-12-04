'use strict';

var express = require('express');
var controller = require('./memory.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.post('/', auth.isAuthenticated(), controller.sync);

module.exports = router;
