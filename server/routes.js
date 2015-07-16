/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
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
    .get(function(req, res) {
      winston.debug('Sirviendo fichero estático /index.html');
      res.header('X-UA-Compatible', 'IE=Edge');
      res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });
};
