'use strict';

var _ = require('lodash');
var async = require('async');
var winston = require('winston');
var Memory = require('./memory.model');

// Get list of memories
exports.index = function(req, res) {
  var userID = req.user && req.user._id && req.user._id.toString();
  var fromDate = new Date(req.query.fromDate);
  if (isNaN(fromDate.getTime())) {
    winston.error('memory.controller::index() Fecha incorrecta');
    return res.status(400).json({ message: 'Invalid fromDate' });
  }
  Memory.find({
    user: userID,
    date: { $gt: fromDate }
  }).then(function (memories) {
    winston.debug('memory.controller::index() Devolviendo memories');
    return res.status(200).json(memories);
  }).then(null, function(err) {
    winston.error('memory.controller::index() Error en Memory.find()');
    return handleError(res, err);
  });
};

// Crea/actualiza memories en la BD. Envía al cliente los datos modificados en
// la base de datos, junto con datos de la base de datos no sincronizados con
// el cliente (si los hay).
exports.add = function(req, res) {
  var userID = req.user && req.user._id && req.user._id.toString();
  var fromDate = new Date(req.body.fromDate); // Última sincronización
  var memories = req.body.changes, validData = true, promise;

  if (isNaN(fromDate.getTime())) {
    return res.status(400).json({ message: 'Invalid fromDate' });
  } else if (!_.isArray(memories)) {
    return res.status(400).json({ message: 'Expected array of memories' });
  }

  // Añadimos (o machacamos) el campo 'user' con el _id del usuario actual
  _.forEach(memories, function(memory) {
    _.assign(memory, { user: userID });
    // Comprobamos que contiene los campos exigidos
    if (!memory.card || !memory.recallProbability ||
        !_.isArray(memory.recalls)) {
      return (validData = false);
    } else {
      validData = _.every(memory.recalls, function(rec) {
        return _.isFinite(rec.recall) && rec.recall >= 0 && rec.recall <=1;
      });
      return validData;
    }
  });

  if (!validData) {
    winston.error('memory.controller::add() no validData: %j', memories, {});
    res.status(400).json({ message: 'Expected array of valid memories' });
  }

  // Buscamos memorias no sincronizadas
  promise = Memory.find({ user: userID, date: { $gt: fromDate } }).exec();
  promise.then(function(unsynced) {
    updateMemories(memories, userID, unsynced, res);
  }).then(null, function(err) {
    winston.error('memory.controller::add() Error en Memory.find()');
    res.status(500).json({ message: 'Could not syncronize memories' });
  });
};

// Auxiliar de add()
// Inserta/actualiza memorias, mezclando con memorias del servidor
// no sincronizadas, si procede
function updateMemories(memories, userID, unsynced, res) {
  var result = [];

  async.eachSeries(memories, function(mem, done) {
    updateMemory(mem, userID, result, unsynced, done);
  // callback final de async.eachSeries()
  }, function(err) {
    if (err) { // <=== Alguna de las actualizaciones falló
      return res.status(500).json({
        message: 'An error ocurred updating the memories'
      });
    }
    result = unsynced.concat(result);
    res.status(201).json(result);
  });
}

// Auxiliar de updateMemories()
// Inserta/actualiza una memoria individual
function updateMemory(mem, userID, result, unsynced, done) {
  var options = { new: true, upsert: true }, update = {}, conditions, promise;

  update.$set = {
    card: mem.card,
    recallProbability: mem.recallProbability,
    date: new Date()
  };
  update.$push = {
    recalls: { $each: _.map(_.reject(mem.recalls, '_id'), function(rec) {
      return _.assign(rec, { date: new Date() });
    }) }
  };
  if (true === mem.removed) {
    update.removed = true;
  }
  conditions = mem._id ? { _id: mem._id } : { card: mem.card };
  conditions.user = userID;

  promise = Memory.findOneAndUpdate(conditions, update, options).exec();
  promise.then(function(mem) {
    var i = _.findIndex(unsynced, 'id', mem.id);
    if (i !== -1) {
      unsynced[i] = mem;
    } else {
      result.push(mem);
    }
    done();
  }).then(null, function(err) {
    done(err); // ===> Alguna de las actualizaciones falló
  });
}

// Get a single memory
exports.show = function(req, res) {
  Memory.findById(req.params.id, function (err, memory) {
    if(err) { return handleError(res, err); }
    if(!memory) { return res.sendStatus(404); }
    return res.json(memory);
  });
};

// Updates an existing memory in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Memory.findById(req.params.id, function (err, memory) {
    if (err) { return handleError(res, err); }
    if(!memory) { return res.sendStatus(404); }
    var updated = _.merge(memory, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(memory);
    });
  });
};

// Deletes a memory from the DB.
exports.destroy = function(req, res) {
  Memory.findById(req.params.id, function (err, memory) {
    if(err) { return handleError(res, err); }
    if(!memory) { return res.sendStatus(404); }
    memory.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.sendStatus(204);
    });
  });
};

function handleError(res, err) {
  winston.error('memory.controller: Error inesperado: %j', err, {});
  return res.status(500).send(err);
}
