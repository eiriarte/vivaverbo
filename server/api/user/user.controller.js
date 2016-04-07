'use strict';

var crypto = require('crypto');
var passport = require('passport');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var winston = require('winston');
var User = require('./user.model');
var config = require('../../config/environment');
var mail = require('../../components/mail/mail.js');

var validationError = function(res, err) {
  winston.error('user.controller::validationError: %s --- %j', err.message, err, {});
  return res.status(422).json(err);
};

/**
 * Actualiza el estado del usuario actual
 */
exports.update = function (req, res) {
  winston.debug('user.controller::update() iniciando actualización…');

  req.user.prefs = req.body.prefs;
  req.user.reviews = req.body.reviews;
  req.user.updated = new Date(req.body.updated);
  req.user.save().then(function(user, numAffected) {
    winston.debug('user.controller::update() req.user.save completado');
    if (0 === numAffected) {
      return res.status(400).json({ message: 'Unknown user' });
    } else {
      return res.json(user);
    }
  }).then(null, function(err) {
    winston.error('user.controller::update() Error en req.user.save: %s --- %j', err.message, err, {});
    res.status(500).json({ message: 'Error updating the user state' });
  });
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if(err) return res.status(500).send(err);
    res.status(200).json(users);
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);
    var token = jwt.sign({_id: user._id }, config.secrets.session,
      { expiresIn: config.tokenDuration.session });
    winston.info('Registrado nuevo usuario con email/pwd…');
    res.json({ token: token });
  });
};

/**
 * Contraseña olvidada:
 * Añade un nuevo token de recuperación de contraseña y lo envía por email
 */
exports.recover = function (req, res, next) {
  winston.debug('user.controller::recover() Añadiendo token de recuperación…');

  var email = String(req.body.email).trim();

  User.findOne({ email: email }, function (err, user) {
    if (err) return next(err);
    if (!user) {
      return res.status(404).json({ message: 'Usuario desconocido' });
    }

    var timestamp = Date.now();
    var hmac = crypto.createHmac('sha256', config.secrets.session);
    hmac.update(timestamp + email);
    var token = hmac.digest('base64');
    var url = process.env.DOMAIN + '/login/new';
    url += '?token=' + encodeURIComponent(token);
    url += '&email=' + encodeURIComponent(email);
    url += '&ts=' + timestamp;

    user.forgot.push({ token: token, date: new Date(timestamp) });
    user.save(function(err) {
      if (err) return validationError(res, err);
      winston.debug('user.controller::recover() save() completado. Enviando email con url: %s', url);
      mail.sendRecoverEmail(email, url, res, function(err, json) {
        if (err) {
          winston.error('user.controller::recover() Error enviando email %s --- %j', err.message, err, {});
          return res.status(500).json({ message: 'Error enviando email' });
        }
        winston.debug('user.controller::recover() email enviado a %s. Resultado: %s', email, json.message);
        res.json({ message: 'OK' });
      });
    });
  });
};


/**
 * Contraseña olvidada:
 * Sustituye la password actual por la nueva
 */
exports.recoverPassword = function (req, res, next) {
  winston.debug('user.controller::recoverPassword() Modificando contraseña…');

  var email = decodeURIComponent(String(req.body.email).trim());
  var userToken = decodeURIComponent(String(req.body.token).trim());
  var timestamp = new Date(parseInt(req.body.ts));
  var password = String(req.body.password).trim();
  var daysAgo = (Date.now() - timestamp.getTime()) / (1000 * 3600 * 24);

  if (daysAgo > 30) {
    return res.status(410).json({ message: 'Enlace caducado' });
  }

  var hmac = crypto.createHmac('sha256', config.secrets.session);
  hmac.update(timestamp.getTime() + email);
  var token = hmac.digest('base64');

  if (userToken !== token) {
    winston.debug(userToken + " !== " + token)
    return res.status(401).json({ message: 'Enlace corrupto' });
  }

  User.findOne({ email: email }, function (err, user) {
    if (err) return next(err);
    if (!user) {
      return res.status(404).json({ message: 'Usuario desconocido' });
    }
    if (!_.find(user.forgot, { token: token, date: timestamp })) {
      return res.status(410).json({ message: 'Enlace usado' });
    }
    user.forgot.splice(0, user.forgot.length);
    user.password = password;
    user.save(function(err) {
      if (err) return validationError(res, err);
      winston.debug('user.controller::recoverPassword() Contraseña modificada.');
      res.json({ message: 'OK' });
    });
  });
};
/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.status(404).send('Unauthorized');
    res.json(user.profile);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.status(500).send(err);
    return res.status(204).send('No Content');
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.status(200).send('OK');
      });
    } else {
      res.status(403).send('Forbidden');
    }
  });
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');
    res.json(user);
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};
