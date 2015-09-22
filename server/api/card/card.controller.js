'use strict';

var _ = require('lodash');
var winston = require('winston');
var Card = require('./card.model');

// Get list of cards
exports.index = function(req, res) {
  Card.find(function (err, cards) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(cards);
  });
};

// Get a single card
exports.show = function(req, res) {
  Card.findById(req.params.id, function (err, card) {
    if(err) { return handleError(res, err); }
    if(!card) { return res.sendStatus(404); }
    return res.json(card);
  });
};

// Creates a new card in the DB.
exports.create = function(req, res) {
  Card.create(req.body, function(err, card) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(card);
  });
};

// Updates an existing card in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Card.findById(req.params.id, function (err, card) {
    if (err) { return handleError(res, err); }
    if(!card) { return res.sendStatus(404); }
    var updated = _.merge(card, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(card);
    });
  });
};

// Deletes a card from the DB.
exports.destroy = function(req, res) {
  Card.findById(req.params.id, function (err, card) {
    if(err) { return handleError(res, err); }
    if(!card) { return res.sendStatus(404); }
    card.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.sendStatus(204);
    });
  });
};

function handleError(res, err) {
  winston.error('card.controller: Error inesperado: %j', err, {});
  return res.status(500).send(err);
}
