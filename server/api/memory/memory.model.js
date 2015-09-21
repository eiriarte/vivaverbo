'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var MemorySchema = new Schema({
  user: Schema.Types.ObjectId,
  card: Schema.Types.ObjectId,
  recalls: [{
    recall: { type: Number, min: 0, max: 1 },
    date: { type: Date, default: Date.now }
  }],
  recallProbability: { type: Number, min: 0, max: 1 },
  date: { type: Date, default: Date.now },
  removed: Boolean
});

MemorySchema.virtual('id').get(function() {
  return this._id.toString();
});

module.exports = mongoose.model('Memory', MemorySchema);
