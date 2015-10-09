/**
 * Logging
 */

'use strict';

var parser = require('ua-parser-js');
var winston = require('winston');
var morgan = require('morgan');
var _ = require('lodash');

var logFormat = '{ "ip": ":remote-addr", "user": :vv-user, "date": ":date[iso]", "method": ":method", "url": ":url", "status": ":status", "responseTime": ":response-time", "size": ":res[content-length]", "referrer": ":referrer", "browser": :vv-ua }';

module.exports = function(app, env) {
  winston.default.transports.console.json = true;

  if ('production' === env) {
    morgan.token('vv-user', getUser);
    morgan.token('vv-ua', getBrowser);
    app.use(morgan(logFormat));
  } else {
    winston.default.transports.console.level = 'debug';
    app.use(morgan('dev'));
  }
}

// Devuelve el usuario logado ('user' en 'user@example.com')
function getUser(req, res) {
  var user = '<anon>';
  if (req.user && _.isString(req.user.email)) {
    user = req.user.email.split('@')[0] || '<sin email>';
  }
  return JSON.stringify(user);
}

// Devuelve el navegador y sistema operativo del usuario
function getBrowser(req, res) {
  var browser, browserVersion, osName, osVersion;
  var ua = parser(req.get('user-agent'));
  var browserName = ua.browser.name;
  if (browserName) {
    browserVersion = ua.browser.major ? '/' + ua.browser.major : '';
    osName = ua.os.name || '-';
    osVersion = ua.os.version ? '/' + ua.os.version : '';
    browser =  browserName + browserVersion + '(' + osName + osVersion + ')';
  } else {
    browser =  'USER-AGENT: ' + req.get('user-agent');
  }
  return JSON.stringify(browser);
}
