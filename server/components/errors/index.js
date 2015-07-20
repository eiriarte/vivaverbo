/**
 * Error responses
 */

'use strict';

var winston = require('winston');
var _ = require('lodash');

// Error 404
module.exports[404] = function pageNotFound(req, res) {
  var viewFilePath = '404';
  var statusCode = 404;

  res.render(viewFilePath, function (err, html) {
    if (err) { return res.sendStatus(statusCode); }

    res.status(statusCode).send(html);
  });
};

// Error 500
module.exports[500] = function error500(err, req, res, next) {
  var viewFilePath = '500';
  var result = {};
  var type = req.accepts('html', 'json');
  var error = { message: err.message, stack: err.stack };

  if (err.code === 'EBADCSRFTOKEN') {
    result.status = 403;
    result.message = 'La sesión ha expirado o se ha corrompido. Por favor, vuelve a iniciar sesión.';
  } else {
    result.status = 500;
    result.message = 'Se ha producido un error en el servidor. Por favor, intenta más tarde.';
  }

  if ('json' === type) {
      return res.status(result.status).json(result);
  } else if ('html' === type) {
    res.render(viewFilePath, result, function (err, html) {
      if (err) { return res.status(result.status).json(result); }

      res.status(result.status).send(html);
    });
  } else {
    res.sendStatus(406); // Not acceptable
  }

  winston.error('error500: %j', error, {});
};
