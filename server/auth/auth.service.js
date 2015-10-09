'use strict';

var mongoose = require('mongoose');
var passport = require('passport');
var winston = require('winston');
var config = require('../config/environment');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var compose = require('composable-middleware');
var User = require('../api/user/user.model');
var validateJwt = expressJwt({
  secret: config.secrets.session
});
var validateJwtNoCreds = expressJwt({
  secret: config.secrets.session,
  credentialsRequired: false
});

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
function isAuthenticated() {
  return compose()
    // Validate jwt
    .use(function(req, res, next) {
      winston.debug('auth.service::isAuthenticated() Iniciando autenticación…');
      // allow access_token to be passed through query parameter as well
      if(req.query && req.query.hasOwnProperty('access_token')) {
        req.headers.authorization = 'Bearer ' + req.query.access_token;
      }
      validateJwt(req, res, next);
    })
    // Attach user to request
    .use(function(req, res, next) {
      User.findById(req.user._id, function (err, user) {
        if (err) {
          winston.error('auth.service::isAuthenticated() Error buscando usuario');
          return next(err);
        }
        if (!user) {
          winston.error('auth.service::isAuthenticated() Usuario %s no encontrado', req.user._id);
          return res.status(401).send('Unauthorized');
        }

        winston.debug('auth.service::isAuthenticated() Usuario validado');
        req.user = user;
        next();
      });
    });
}

/**
 * Attaches the user object to the request if authenticated
 * Otherwise user remains undefined
 */
function getUser() {
  return compose()
    // Validate jwt
    .use(function(req, res, next) {
      // allow access_token to be passed through query parameter as well
      if(req.query && req.query.hasOwnProperty('access_token')) {
        req.headers.authorization = 'Bearer ' + req.query.access_token;
      } else if (req.cookies && req.cookies.token) {
        req.headers.authorization = 'Bearer ' + req.cookies.token;
      }
      validateJwtNoCreds(req, res, next);
    })
    // Attach user to request
    .use(function(req, res, next) {
      if (!req.user) {
        winston.debug('Sin credenciales');
        return next();
      }
      winston.debug('Con credenciales: %s', req.user._id);
      User.findById(req.user._id, function (err, user) {
        if (err) return next(err);
        req.user = user;

        next();
      });
    });
}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
function hasRole(roleRequired) {
  if (!roleRequired) throw new Error('Required role needs to be set');

  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      if (config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf(roleRequired)) {
        next();
      }
      else {
        res.status(403).send('Forbidden');
      }
    });
}

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(id, role, expiresIn) {
  return jwt.sign({ _id: id, role: role }, config.secrets.session,
      { expiresIn: expiresIn });
}

/**
 * Set token cookie directly for oAuth strategies
 */
function setTokenCookie(req, res) {
  if (!req.user) {
    return res.status(404).json(
        { message: 'Something went wrong, please try again.' });
  }
  var token =
    signToken(req.user._id, req.user.role, config.tokenDuration.session);
  res.cookie('token', JSON.stringify(token));
  res.redirect('/');
}

exports.isAuthenticated = isAuthenticated;
exports.getUser = getUser;
exports.hasRole = hasRole;
exports.signToken = signToken;
exports.setTokenCookie = setTokenCookie;
