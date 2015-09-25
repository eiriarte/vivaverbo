/**
 * Main application routes
 */

'use strict';

var path = require('path');
var winston = require('winston');
var _ = require('lodash');
var errors = require('./components/errors');
var auth = require('./auth/auth.service');

module.exports = function(app, config) {

  // Insert routes below
  app.use('/api/memory', require('./api/memory'));
  app.use('/api/cards', require('./api/card'));
  app.use('/api/users', require('./api/user'));

  app.use('/auth', require('./auth'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(auth.getUser(), function(req, res) {
      var props = ['prefs', 'review', 'updated', 'email', 'name', 'provider'];
      var view, locals;

      if (req.user) {
        winston.debug('Usuario registrado. Sirviendo index.html');
        view = 'index';
        locals = { user: _.pick(req.user, props) };
      } else {
        winston.debug('Usuario anónimo. Sirviendo landing.html');
        view = 'landing';
        locals = { csrfToken: req.csrfToken ? req.csrfToken() : '' };
      }

      locals.analytics = config.analytics;
      locals.debugON = config.debug;
      res.header('X-UA-Compatible', 'IE=Edge');
      winston.debug('user = %j', req.user, {});

      res.render(view, locals, function (err, html) {
        if (err) { errors[500](err, req, res); }
        res.send(html);
      });
    });
};
