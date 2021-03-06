/**
 * Express configuration
 */

'use strict';

var express = require('express');
var favicon = require('serve-favicon');
var compression = require('compression');
var methodOverride = require('method-override');
var errorHandler = require('errorhandler');
var path = require('path');
var config = require('./environment');
var passport = require('passport');
var winston = require('winston');
var i18next = require('i18next');
var errors = require('../components/errors');

module.exports = function(app) {
  var env = app.get('env');

  // Medidas de seguridad
  require('./security')(app);

  // Configuración para generar los log vía morgan
  require('./logging')(app, env);

  app.set('views', config.root + '/server/views');
  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');
  app.use(compression());
  app.use(methodOverride());
  app.use(passport.initialize());


  // Idioma
  i18next.init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'eo'],
    cookieName: 'lang',
    debug: ('development' === env || 'test' === env)
  });
  app.use(i18next.handle);
  i18next.registerAppHelper(app);

  if ('production' === env) {
    app.use(favicon(path.join(config.root, 'client', 'favicon.ico')));
    app.use(express.static(path.join(config.root, 'client'), { setHeaders: ieHeader }));
    app.set('appPath', path.join(config.root, 'client'));

    require('../routes')(app, config);
    app.use(errors[500]);
  }

  if ('development' === env || 'test' === env) {
    app.use(require('connect-livereload')());
    app.use(express.static(path.join(config.root, '.tmp'), { setHeaders: ieHeader }));
    app.use(express.static(path.join(config.root, 'client'), { setHeaders: ieHeader }));
    app.set('appPath', path.join(config.root, 'client'));

    require('../routes')(app, config);
    if ('development' === env) {
      app.use(errorHandler());
    } else {
      app.use(errors[500]);
    }
  }
};

function ieHeader(res, path, stat) {
  if (path.slice(-5) === '.html') {
    winston.debug('Sirviendo fichero estático %s', path);
    res.header('X-UA-Compatible', 'IE=Edge');
  }
}
