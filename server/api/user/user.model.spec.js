'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var User = require('./user.model');

var user = new User({
  provider: 'local',
  name: 'Fake User',
  email: 'test@test.com',
  password: 'password'
});

describe('User Model', function() {
  it('debe actualizar el estado del usuario', function(done) {
    var prefs = {
      tarjetasPorRepaso: 22,
      nuevasPorRepaso: 11,
      maxFallosPorRound: 2
    }
    request(app)
      .post('/api/users/me')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NWYwMDBjZTQ0NzMxY2RlMGZjY2U4ZmYiLCJyb2xlIjoidXNlciIsImlhdCI6MTQ0MjQ5NTgzN30.quIF_kIMsST99z2jO4Jj7G163Jro247aTvQSboAwjuE')
      .send({ prefs: prefs, review: {}, updated: '2015-09-17T12:14:04.963Z' })
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.prefs.should.match(prefs);
        done();
      });
  });
  //before(function(done) {
  //  // Clear users before testing
  //  User.remove().exec().then(function() {
  //    done();
  //  });
  //});

  //afterEach(function(done) {
  //  User.remove().exec().then(function() {
  //    done();
  //  });
  //});

  //it('should begin with no users', function(done) {
  //  User.find({}, function(err, users) {
  //    users.should.have.length(0);
  //    done();
  //  });
  //});

  it('should fail when saving a duplicate user', function(done) {
    user.save(function() {
      var userDup = new User(user);
      userDup.save(function(err) {
        should.exist(err);
        done();
      });
    });
  });

  it('should fail when saving without an email', function(done) {
    user.email = '';
    user.save(function(err) {
      should.exist(err);
      done();
    });
  });

  it("should authenticate user if password is valid", function() {
    return user.authenticate('password').should.be.true;
  });

  it("should not authenticate user if password is invalid", function() {
    return user.authenticate('blah').should.not.be.true;
  });
});
