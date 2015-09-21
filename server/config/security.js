/**
 * Opciones de seguridad
 */

'use strict';

var contentLength = require('express-content-length-validator');
var hpp = require('hpp');
var csrf = require('csurf');
var helmet = require('helmet');
var crossdomain = require('helmet-crossdomain');
var express_enforces_ssl = require('express-enforces-ssl');

module.exports = function(app) {
  var env = app.get('env');

  // Protección contra ataques DoS por inundación (large payloads)
  app.use(contentLength.validateMax({ max: 9999 }));

  // Protección contra ataques de polución de parámetros
  app.use(hpp());

  // Protección contra ataques XSRF
  var fnCSRF = csrf({ cookie: true });
  app.use(function(req, res, next) {
    if (req.isRobot || 'test' === env) {
      next();
    } else {
      fnCSRF(req, res, next);
    }
  });
  app.use(function(req, res, next) {
    if (!req.isRobot && 'test' !== env) {
      res.cookie('XSRF-TOKEN', req.csrfToken());
    }
    next();
  });

  // Protección contra ataques XSS
  var csp = {
    defaultSrc: [ "'none'" ],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      'https://ajax.googleapis.com',
      'https://linkhelp.clients.google.com'
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      'https://fonts.googleapis.com'
    ],
    fontSrc: [
      'https://fonts.gstatic.com'
    ],
    connectSrc: [ "'self'" ],
    imgSrc: [ "'self'", 'data:' ]
  }
  if ('development' === env) {
    // Livereload
    csp.scriptSrc.push('http://localhost:35729');
    csp.connectSrc.push('ws://localhost:35729');
  }
  app.use(helmet.contentSecurityPolicy(csp));
  app.use(helmet.xssFilter());

  // Protección contra secuestros de click (Clickjacking)
  app.use(helmet.frameguard('deny'));

  // Cabecera HTTP Strict-Transport-Security
  app.use(helmet.hsts({
    maxAge: 10886400000,
    includeSubdomains: true,
    preload: true
  }));

  // Impedir que el navegador trate de "adivinar" el tipo MIME
  app.use(helmet.noSniff());
  // Impedir cargar recursos desde Adobe Flash, entre otros
  app.use(crossdomain());
  // Desactivar caché
  app.use(helmet.noCache());
  // Ocultar información del software del servidor
  app.use(helmet.hidePoweredBy());

  if ('production' === env) {
    // Forzar conexión segura en producción
    app.enable('trust proxy');
    app.use(express_enforces_ssl());
  }
};
