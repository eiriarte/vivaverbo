/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var auth = require('./auth/auth.service');
var path = require('path');
var winston = require('winston');

// TODO: obtener los datos reales de los usuarios
var mockUser = {
  '_id': '55c06722591903e30543848a',
  'provider': 'local',
  'name': 'Jasmine Test User',
  'email': 'test@test.com',
  '__v': 0,
  'role': 'user',
  'prefs': {
    'tarjetasPorRepaso': 10,
    'nuevasPorRepaso': 5,
    'maxFallosPorRound': 4
  },
  'review': {},
  'updated': new Date() // fecha+hora en la que se updató x vez última
};

module.exports = function(app) {

  // Insert routes below
  app.use('/api/users', require('./api/user'));

  app.use('/auth', require('./auth'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(auth.getUser(), function(req, res) {
      res.header('X-UA-Compatible', 'IE=Edge');
      winston.debug('user = %j', req.user, {});
      if (req.user) {
        winston.debug('Usuario registrado. Sirviendo index.html');
        res.render('index', { user: mockUser }, function (err, html) {
          if (err) { errors[500](err, req, res); }
          res.send(html);
        });
      } else {
        winston.debug('Usuario anónimo. Sirviendo landing.html');
        res.render('landing', { csrfToken: req.csrfToken() }, function (err, html) {
          if (err) { errors[500](err, req, res); }
          res.send(html);
        });
      }
    });
};
