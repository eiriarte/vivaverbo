'use strict';

var express = require('express');
var passport = require('passport');
var winston = require('winston');
var auth = require('../auth.service');

var router = express.Router();

router.post('/', function(req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    var error = err || info;
    if (err) {
      winston.error('passport.authenticate(local): Error: %s --- %j', err.message, err, {});
    }
    if (error) {
      winston.error('passport.authenticate(local): No autenticado: %j', info, {});
      return res.status(401).json(error);
    }
    if (!user) return res.status(404).json({
      message: '¡Algo ha fallado! Por favor, intenta más tarde.'
    });

    var token = auth.signToken(user._id, user.role);
    res.json({token: token});
  })(req, res, next)
});

module.exports = router;
