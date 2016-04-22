'use strict';

var _ = require('lodash');
var Category = require('./category.model');

// Get list of categories
exports.index = function(req, res) {
  Category.find(function (err, categories) {
    if (err) {
      winston.error('category.controller::index() Error en Category.find()');
      return res.status(500).send({ message: 'Error finding categories' });
    }
    return res.status(200).json(categories);
  });
};
