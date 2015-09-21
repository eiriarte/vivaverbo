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
  var error = { code: err.code, message: err.message, stack: err.stack };

  winston.error('error500: %j', error, {});

  if (err.code === 'EBADCSRFTOKEN') {
    result.status = 403;
    result.message = 'Your session has been corrupted. Please, try signing in again.';
  } else if (401 === err.status) {
    result.status = err.status;
    result.message = 'Session has expired. Please, try signing in again.';
  } else {
    result.status = 500;
    result.message = 'An unexpected error ocurred in the server. Please, try again later.';
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
};
