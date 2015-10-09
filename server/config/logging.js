/**
 * Logging
 */

'use strict';

var parser = require('ua-parser-js');
var morgan = require('morgan');
var _ = require('lodash');

var logFormat = ':remote-addr ":vv-user" [:date[iso]] ":method :url" :status :response-time ms :res[content-length] B ":referrer" ":vv-ua"';

module.exports = function(app, env) {
  if ('production' === env) {
    morgan.token('vv-user', getUser);
    morgan.token('vv-ua', getUserAgent);
    app.use(morgan(logFormat));
  } else {
    app.use(morgan('dev'));
  }
}

// Devuelve el usuario logado ('user' en 'user@example.com')
function getUser(req, res) {
  var user = '<anon>';
  if (req.user && _.isString(req.user.email)) {
    user = req.user.email.split('@')[0] || '<sin email>';
  }
  return user;
}

// Devuelve el navegador y sistema operativo del usuario
function getUserAgent(req, res) {
  var ua = parser(req.get('user-agent'));
  var browserName = ua.browser.name || '-';
  var browserVersion = ua.browser.major ? '/' + ua.browser.major : '';
  var osName = ua.os.name || '-';
  var osVersion = ua.os.version ? '/' + ua.os.version : '';
  return browserName + browserVersion + '(' + osName + osVersion + ')';
}
