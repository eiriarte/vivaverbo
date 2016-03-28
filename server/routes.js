/**
 * Main application routes
 */

'use strict';

var path = require('path');
var winston = require('winston');
var _ = require('lodash');
var errors = require('./components/errors');
var auth = require('./auth/auth.service');
var newrelic;

if ('production' === process.env.NODE_ENV) {
  newrelic = require('newrelic');
}

module.exports = function(app, config) {

  app.get('*', function(req, res, next) {
    if (_.includes(req.subdomains, 'www')) {
      winston.debug('En subdominio www. Redirigiendo (301)…');
      res.redirect(301, process.env.DOMAIN);
    } else {
      winston.debug('Sin subdominio www.');
      next();
    }
  });

  app.all('*', function(req, res, next) {
    if (app.get('down')) {
      winston.debug('El servidor está caído. Devolviendo 503…');
      res.status(503).send('Oops! Parece que el servidor está caído… :-(');
    } else {
      winston.debug('El servidor NO está caído. Seguimos…');
      next();
    }
  });

  // Insert routes below
  app.use('/api/categories', require('./api/category'));
  app.use('/api/memory', require('./api/memory'));
  app.use('/api/cards', require('./api/card'));
  app.use('/api/users', require('./api/user'));

  app.use('/auth', require('./auth'));

  app.route('/login').get(function(req, res) {
    var locals = {};
    locals.csrfToken = req.csrfToken ? req.csrfToken() : '';
    locals.analytics = config.analytics;
    locals.debugON = config.debug;
    locals.newrelic = newrelic ||
      { getBrowserTimingHeader: function() { return ''; } };
    res.header('X-UA-Compatible', 'IE=Edge');
    res.render('login', locals, function (err, html) {
      if (err) { errors[500](err, req, res); }
      res.send(html);
    });
  });

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(auth.getUser(), function(req, res) {
      var props = ['prefs', 'reviews', 'updated', 'email', 'name', 'provider'];
      var view, locals;

      if (req.user) {
        winston.debug('Usuario registrado. Sirviendo index.html');
        view = 'index';
        locals = { user: _.pick(req.user, props) };
        locals.versions = {
          cards: '2016-03-21T19:22:47.601Z',
          categories: '2016-03-27T23:55:47.601Z'
        };
      } else {
        winston.debug('Usuario anónimo. Sirviendo landing.html');
        view = 'landing';
        locals = { csrfToken: req.csrfToken ? req.csrfToken() : '' };
      }

      locals.analytics = config.analytics;
      locals.debugON = config.debug;
      locals.newrelic = newrelic ||
        { getBrowserTimingHeader: function() { return ''; } };
      res.header('X-UA-Compatible', 'IE=Edge');
      winston.debug('user = %j', req.user, {});

      res.render(view, locals, function (err, html) {
        if (err) { errors[500](err, req, res); }
        res.send(html);
      });
    });
};
