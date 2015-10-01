/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');
var winston = require('winston');
var config = require('./config/environment');

var app = express();

// Connect to database
mongoose.set('debug', config.mongo.debug);
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function(err) {
  winston.error('Error de conexión a MongoDB: ' + err);
  app.set('down', true);
});

mongoose.connection.on('disconnected', function() {
  winston.error('MongoDB desconectado.');
  app.set('down', true);
});

// Setup server
var server = require('http').createServer(app);
require('./config/express')(app);

// Start server
server.listen(config.port, config.ip, function () {
  winston.info('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

process.on('SIGTERM', function() {
  winston.info('Recibida SIGTERM: Terminando proceso…');
  server.close(function() {
    process.exit(0);
  });
});

// Expose app
exports = module.exports = app;
