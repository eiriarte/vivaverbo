/**
 * Opciones de seguridad
 */

'use strict';

var cookieParser = require('cookie-parser');
var contentLength = require('express-content-length-validator');
var hpp = require('hpp');
var csrf = require('csurf');
var helmet = require('helmet');
var crossdomain = require('helmet-crossdomain');
var express_enforces_ssl = require('express-enforces-ssl');

// Lista negra de clientes a bloquear
var badIPs = [/(^38\.99\.82\.)/];
var badRefs = ['http://best-seo-report.com'];

module.exports = function(app) {
  var env = app.get('env');

  // Rechazar spammers conocidos, bots maleducados, etc.
  app.use(function(req, res, next) {
    if (blacklisted(req)) {
      console.log('{ "level": "info", "message": "Blocked: %s - %s (%s %s)" }',
        req.ip,
        req.get('referer'),
        req.method,
        req.originalUrl || req.url);
      return res.status(403).end();
    }
    next();
  });

  // Protección contra ataques DoS por inundación (large payloads)
  app.use(contentLength.validateMax({ max: 9999 }));

  // Protección contra ataques de polución de parámetros
  app.use(hpp());

  app.use(cookieParser());

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
      'https://linkhelp.clients.google.com',
      'https://ajax.googleapis.com',
      'https://www.google-analytics.com'
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

// Devuelve true si el cliente está en la lista negra
function blacklisted(req) {
  var ip, referrer;

  referrer = req.get('referer');
  for (var i = 0, len = badRefs.length; i < len; i++) {
    if (badRefs[i] === referrer) { return true; }
  }

  ip = req.ip || (req.connection && req.connection.remoteAddress) || '';
  for (var i = 0, len = badIPs.length; i < len; i++) {
    if (badIPs[i].test(ip)) { return true; }
  }

  return false;
}
