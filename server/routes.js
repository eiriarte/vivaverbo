/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var auth = require('./auth/auth.service');
var path = require('path');
var winston = require('winston');

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
        res.sendFile(path.resolve(app.get('appPath') + '/../server/views/index.html'));
      } else {
        winston.debug('Usuario anónimo. Sirviendo landing.html');
        res.render('landing', { csrfToken: req.csrfToken() }, function (err, html) {
          if (err) { errors[500](err, req, res); }
          res.send(html);
        });
      }
    });
};
