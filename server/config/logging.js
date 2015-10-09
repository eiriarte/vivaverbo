/**
 * Logging
 */

'use strict';

var morgan = require('morgan');
var _ = require('lodash');

var logFormat = ':remote-addr ":vv-user" [:date[iso]] ":method :url" :status :response-time :res[content-length] ":referrer" ":user-agent"';

module.exports = function(app, env) {

  if ('production' === env) {
    morgan.token('vv-user', function(req, res) {
      var user = '<anon>';
      if (req.user && _.isString(req.user.email)) {
        user = req.user.email.split('@')[0] || '<sin email>';
      }
      return user;
    });

    app.use(morgan(logFormat));
  } else {
    app.use(morgan('dev'));
  }

}
