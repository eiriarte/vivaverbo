var express = require('express');
var router = express.Router();
var config = require('../config/environment');
var errors = require('../components/errors');
var newrelic;

if ('production' === process.env.NODE_ENV) {
  newrelic = require('newrelic');
}

router.get('/', function (req, res) {
  var locals = getLocals(req);
  render('login', locals, req, res);
});

router.get('/forgot', function (req, res) {
  var locals = getLocals(req);
  render('forgeso', locals, req, res);
});

router.get('/new', function (req, res) {
  var locals = getLocals(req);
  locals.token = req.query.token;
  locals.email = req.query.email;
  locals.ts = req.query.ts;

  render('nova', locals, req, res);
});

function getLocals(req) {
  var locals = {};

  locals.csrfToken = req.csrfToken ? req.csrfToken() : '';
  locals.analytics = config.analytics;
  locals.debugON = config.debug;
  locals.newrelic = newrelic ||
    { getBrowserTimingHeader: function() { return ''; } };

  return locals;
}

function render(view, locals, req, res) {
  res.header('X-UA-Compatible', 'IE=Edge');
  res.render(view, locals, function (err, html) {
    if (err) { errors[500](err, req, res); }
    res.send(html);
  });
}

module.exports = router;
