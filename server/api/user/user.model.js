'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var uuid = require('node-uuid');
var authTypes = ['facebook', 'google'];

var UserSchema = new Schema({
  trackId: { type: String, default: function() { return uuid.v4(); } },
  name: String,
  email: { type: String, lowercase: true },
  prefs: {
    tarjetasPorRepaso: { type: Number, default: 15 },
    nuevasPorRepaso: { type: Number, default: 5 },
    maxFallosPorRound: { type: Number, default: 4 }
  },
  reviews: [{
    category: String,
    fecha: Date,
    finalizado: Boolean,
    totalTarjetas: Number,
    totalAprendidas: Number,
    tarjetaActual: Number,
    numFallos: Number,
    tarjetas: [{
      cardId: Schema.Types.ObjectId,
      firstTry: Boolean,
      learned: Boolean
    }]
  }],
  role: { type: String, default: 'user' },
  hashedPassword: String,
  salt: String,
  forgot: [{
    token: String,
    date: Date
  }],
  provider: String,
  facebook: {},
  google: {},
  updated: { type: Date, default: Date.now },
  since: { type: Date, default: Date.now }
});

/**
 * Virtuals
 */
UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

// Public profile information
UserSchema
  .virtual('profile')
  .get(function() {
    return {
      'name': this.name,
      'role': this.role
    };
  });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function() {
    return {
      '_id': this._id,
      'role': this.role
    };
  });

/**
 * Validations
 */

// Validate empty name
UserSchema
  .path('name')
  .validate(function(name) {
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return name.length;
  }, 'Hmm… ¿Cómo debo llamarte?');

// Validate empty email
UserSchema
  .path('email')
  .validate(function(email) {
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return email.length;
  }, 'Necesito un email válido.');

// Validate empty password
UserSchema
  .path('hashedPassword')
  .validate(function(hashedPassword) {
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return hashedPassword.length;
  }, 'Por favor, inventa una contraseña.');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({email: value}, function(err, user) {
      if(err) throw err;
      if(user) {
        if(self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
}, 'Ya existe una cuenta con ese email.');

var validatePresenceOf = function(value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function(next) {
    if (!this.isNew) return next();

    if (!validatePresenceOf(this.hashedPassword) && authTypes.indexOf(this.provider) === -1)
      next(new Error('Invalid password'));
    else
      next();
  });

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function(password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha1').toString('base64');
  }
};

module.exports = mongoose.model('User', UserSchema);
