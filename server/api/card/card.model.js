'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CardSchema = new Schema({
  pregunta: String,
  frasePregunta: String,
  respuesta: String,
  fraseRespuesta: String,
  freq: Number
});

module.exports = mongoose.model('Card', CardSchema);
