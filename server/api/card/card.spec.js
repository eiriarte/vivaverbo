'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');

describe('GET /api/cards', function() {

  it('debe responder con un array de 100 elementos', function(done) {
    request(app)
      .get('/api/cards')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NWYwMDBjZTQ0NzMxY2RlMGZjY2U4ZmYiLCJyb2xlIjoidXNlciIsImlhdCI6MTQ0MjQ5NTgzN30.quIF_kIMsST99z2jO4Jj7G163Jro247aTvQSboAwjuE')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        res.body.should.have.length(100);
        done();
      });
  });

  it('debe responder con un array de tarjetas', function(done) {
    request(app)
      .get('/api/cards')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NWYwMDBjZTQ0NzMxY2RlMGZjY2U4ZmYiLCJyb2xlIjoidXNlciIsImlhdCI6MTQ0MjQ5NTgzN30.quIF_kIMsST99z2jO4Jj7G163Jro247aTvQSboAwjuE')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        res.body.should.matchEach(function (card) {
          card.should.have.keys('pregunta', 'respuesta', 'frasePregunta', 'fraseRespuesta', 'freq', '_id', 'categorias');
        });
        done();
      });
  });

  it('debe rechazar un token manipulado', function(done) {
    request(app)
      .get('/api/cards')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NWYwMDBjZTQ0NzMxY2RlMGZjY2U4ZmYiLCJyb2xlIjoidXNldiIsImlhdCI6MTQ0MjQ5NTgzN30.quIF_kIMsST99z2jO4Jj7G163Jro247aTvQSboAwjuE')
      .expect(401, done);
  });

  it('debe rechazar un usuario inexistente', function(done) {
    request(app)
      .get('/api/cards')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiIyODliNzI4YjBmMzk0YmU1MmJhYTMxOGEiLCJyb2xlIjoidXNlciIsImlhdCI6MTQ0MjQ5NTgzN30.y46x9w8aWhGJFvzKmehlu07hB_nqs2ChNGyEnWtvSKA')
      .expect(401, done);
  });

  it('debe exigir un token', function(done) {
    request(app)
      .get('/api/cards')
      .set('Accept', 'application/json')
      .expect(401, done);
  });
});
