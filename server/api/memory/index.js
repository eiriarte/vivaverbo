'use strict';

var express = require('express');
var controller = require('./memory.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
//router.get('/:id', controller.show);
router.post('/', auth.isAuthenticated(), controller.add);
//router.put('/:id', controller.update);
//router.patch('/:id', controller.update);
//router.delete('/:id', controller.destroy);

module.exports = router;
