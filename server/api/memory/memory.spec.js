'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');

describe('GET /api/memory', function() {

  var authToken = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NWYwMDBjZTQ0NzMxY2RlMGZjY2U4ZmYiLCJyb2xlIjoidXNlciIsImlhdCI6MTQ0MjQ5NTgzN30.quIF_kIMsST99z2jO4Jj7G163Jro247aTvQSboAwjuE';

  it('debe devolver un array de memories', function(done) {
    request(app)
      .get('/api/memory?fromDate=1970-01-01T00:00:00.000Z')
      .set('Accept', 'application/json')
      .set('Authorization', authToken)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        res.body.should.matchEach(function (memory) {
          memory.should.have.properties('_id', 'user', 'card', 'recalls', 'recallProbability', 'date');
        });
        done();
      });
  });

  it('debe filtrar por fecha', function(done) {
    var dateISO = '2015-09-17T12:14:04.963Z';
    var date = new Date(dateISO);
    request(app)
      .get('/api/memory?fromDate=' + dateISO)
      .set('Accept', 'application/json')
      .set('Authorization', authToken)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        res.body.should.matchEach(function (memory) {
          var memDate = new Date(memory.date);
          memDate.should.be.above(date);
        });
        done();
      });
  });

  it('debe exigir un campo fromDate', function(done) {
    request(app)
      .get('/api/memory')
      .set('Accept', 'application/json')
      .set('Authorization', authToken)
      .expect(400)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.message.should.be.exactly('Invalid fromDate');
        done();
      });
  });

  it('debe exigir un campo fromDate válido', function(done) {
    request(app)
      .get('/api/memory?fromDate=2015-99-17T13:56:30.517Z')
      .set('Accept', 'application/json')
      .set('Authorization', authToken)
      .expect(400)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.message.should.be.exactly('Invalid fromDate');
        done();
      });
  });

  it('debe exigir fecha válida para sincronizar', function(done) {
    request(app)
      .post('/api/memory')
      .set('Accept', 'application/json')
      .set('Authorization', authToken)
      .send({ changes: [], fromDate: '2015-99-17T12:14:04.963Z' })
      .expect(400)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.message.should.be.exactly('Invalid fromDate');
        done();
      });
  });

  it('debe exigir un array de memories', function(done) {
    request(app)
      .post('/api/memory')
      .set('Accept', 'application/json')
      .set('Authorization', authToken)
      .send({ changes: {}, fromDate: '2015-09-17T12:14:04.963Z' })
      .expect(400)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.message.should.be.exactly('Expected array of memories');
        done();
      });
  });

  it('debe exigir un array de memories con datos válidos', function(done) {
    request(app)
      .post('/api/memory')
      .set('Accept', 'application/json')
      .set('Authorization', authToken)
      .send({ changes: [{ bad: true }], fromDate: '2015-09-17T12:14:04.963Z' })
      .expect(400)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.message.should.be.exactly('Expected array of valid memories');
        done();
      });
  });

  var then, length;

  it('debe devolver el array, con sus _id y date\'s', function(done) {
    var changes = [{
      card: '55f2f2a144cdb68ec2438a3d',
      recallProbability: 0,
      recalls: [ { recall: 0 } ]
    }];
    var now = new Date();

    request(app)
      .post('/api/memory')
      .set('Accept', 'application/json')
      .set('Authorization', authToken)
      .send({ changes: changes, fromDate: now.toISOString() })
      .expect(201)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        res.body.length.should.be.exactly(1);
        res.body[0].should.have.properties([
          '_id', 'card', 'user', 'recallProbability', 'recalls', 'date'
        ]);
        res.body[0].recalls.should.matchEach(function(rec) {
          rec.should.have.properties([ '_id', 'recall', 'date' ]);
        });
        then = new Date(res.body[0].date);
        length = res.body[0].recalls.length;
        done();
      });
  });

  it('debe devolver las memory no sincronizadas, actualizadas', function(done) {
    var changes = [{
      card: '55f2f2a144cdb68ec2438a3c',
      recallProbability: 0.5,
      recalls: [ { recall: 1 } ]
    },{
      card: '55f2f2a144cdb68ec2438a3d',
      recallProbability: 0.5,
      recalls: [ { recall: 1 } ]
    }];
    var beforeThen = new Date(then);
    beforeThen.setMinutes(beforeThen.getMinutes() - 1);

    request(app)
      .post('/api/memory')
      .set('Accept', 'application/json')
      .set('Authorization', authToken)
      .send({ changes: changes, fromDate: beforeThen.toISOString() })
      .expect(201)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        res.body.length.should.be.exactly(2);
        res.body[0].card.should.be.exactly('55f2f2a144cdb68ec2438a3d');
        res.body[0].recalls.length.should.be.exactly(length + 1);
        res.body[1].card.should.be.exactly('55f2f2a144cdb68ec2438a3c');
        done();
      });
  });
});
