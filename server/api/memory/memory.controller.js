'use strict';

var _ = require('lodash');
var winston = require('winston');
var mongoose = require('mongoose');
var Memory = require('./memory.model');

/**
 * Middleware que responde con la lista de memories con fecha de modificación
 * posterior a la indicada.
 */
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
    return res.status(500).send({ message: 'Error finding memories' });
  });
};

/**
 * Middleware que crea/actualiza memories en la BD. Responde con los datos
 * modificados, junto con el resto de datos no sincronizados con el cliente (si
 * los hay)
 */
exports.sync = function(req, res) {
  var userID = req.user && req.user._id && req.user._id.toString();
  var fromDate = new Date(req.body.date); // Última sincronización
  var memories = req.body.docs;
  var updates;

  if (isNaN(fromDate.getTime())) {
    return res.status(400).json({ message: 'Invalid timestamp' });
  } else if (!_.isArray(memories)) {
    return res.status(400).json({ message: 'Expected array of memories' });
  }

  // Array de operaciones a enviar a MongoDB
  updates = getBulkUpdates(memories, userID);
  if (0 === updates.length) {
    winston.error('memory.controller::sync() no validData: %j', memories, {});
    return res.status(400).json({ message: 'Expected array of valid memories' });
  }

  Memory.collection.bulkWrite(updates, { ordered: false }, function(err, r) {
    if (err) {
      winston.error('memory.controller::sync() - bulkWrite: %s', err.message);
      return res.status(500).json({ message: 'Error updating the database' });
    }

    var promise = Memory.find({ user: userID, date: { $gt: fromDate } }).exec();
    promise.then(function(unsynced) {
      var lastMemory = _.last(_.sortBy(unsynced, 'date'));
      var date = lastMemory ? new Date(lastMemory.date) : fromDate;
      var result = { docs: unsynced, date: date };
      res.status(201).json(result);
    }).then(null, function(err) {
      winston.error('memory.controller::sync() - find: %s', err.message);
      res.status(500).json({ message: 'Error finding unsynced memories' });
    });
  });
};

/**
 * Genera un array de operaciones write de "memories" para MongoDB (bulkWrite())
 * @param {array} memories - Array de objetos memory a actualizar/insertar
 * @param {ObjectId} userID - Id del usuario actual
 * @returns {array} Array de operaciones upsert correspondiente a memories
 */
function getBulkUpdates(memories, userID) {
  if (!_.all(memories, validateMemory)) {
    return [];
  }

  userID = mongoose.Types.ObjectId(userID);

  return memories.map(function(memory) {
    var filter, upd;
    var cardId = mongoose.Types.ObjectId(memory.card);

    if (memory._id) {
      filter = { _id: mongoose.Types.ObjectId(memory._id), user: userID };
      upd = { card: cardId };
    } else {
      filter = { user: userID, card: cardId };
      upd = {};
    }

    upd.date = new Date();
    upd.recallProbability = memory.recallProbability;
    upd.card = cardId;
    upd.recalls = [];

    if (true === memory.remove) {
      upd.remove = true;
    }

    memory.recalls.forEach(function(rec) {
      upd.recalls.push({
        recall: rec.recall,
        date: rec.date ? new Date(rec.date) : new Date()
      });
    });

    return { updateOne: {
      filter: filter,
      update: { $set: upd },
      upsert: true
    }};
  });
}

/**
 * Auxiliar de getBulkUpdates()
 * Comprueba que el memory es un objeto y contiene los campos exigidos
 * @param {object} memory - Objeto memory a validar
 * @returns {boolean} true si el objeto proporcionado es válido, false en cc.
 */
function validateMemory(memory) {
  if ('object' !== typeof memory ||
      !_.isString(memory.card) ||
      !_.isFinite(memory.recallProbability) ||
      !_.isArray(memory.recalls)) {
    return false;
  } else if ('undefined' !== typeof memory._id && !_.isString(memory._id)) {
    return false;
  } else {
    return _.every(memory.recalls, function(rec) {
      var okRec, okDate, okRecall;
      okRec = 'object' === typeof rec;
      if (okRec) {
        okDate = _.isUndefined(rec.date) || !isNaN((new Date(rec.date)).getTime());
        okRecall = _.isFinite(rec.recall) && rec.recall >= 0 && rec.recall <=1;
      }
      return okRec && okDate && okRecall;
    });
  }
}
