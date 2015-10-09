/**
 * Express configuration
 */

'use strict';

var express = require('express');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var compression = require('compression');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var path = require('path');
var config = require('./environment');
var passport = require('passport');
var winston = require('winston');
var i18next = require('i18next');
var _ = require('lodash');
var errors = require('../components/errors');

module.exports = function(app) {
  var env = app.get('env');

  app.set('views', config.root + '/server/views');
  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');
  app.use(compression());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(methodOverride());
  app.use(cookieParser());
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

  // Medidas de seguridad
  require('./security')(app);

  if ('production' === env) {
    app.use(favicon(path.join(config.root, 'client', 'favicon.ico')));
    app.use(express.static(path.join(config.root, 'client'), { setHeaders: ieHeader }));
    app.set('appPath', path.join(config.root, 'client'));

    morgan.token('vv-user', function(req, res) {
      var user = '<anon>';
      if (req.user && _.isString(req.user.email)) {
        user = req.user.email.split('@')[0] || '<sin email>';
      }
      return user;
    });
    app.use(morgan(':remote-addr ":vv-user" [:date[iso]] ":method :url" :status :response-time :res[content-length] ":referrer" ":user-agent"'));

    require('../routes')(app, config);
    app.use(errors[500]);
  }

  if ('development' === env || 'test' === env) {
    // Nivel de log: debug
    winston.default.transports.console.level = 'debug';

    app.use(require('connect-livereload')());
    app.use(express.static(path.join(config.root, '.tmp'), { setHeaders: ieHeader, index: false }));
    app.use(express.static(path.join(config.root, 'client'), { setHeaders: ieHeader, index: false }));
    app.set('appPath', path.join(config.root, 'client'));
    app.use(morgan('dev'));
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
