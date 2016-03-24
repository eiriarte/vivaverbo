var db, cards;

$(function() {
  init();
});

function init() {
  $('#doFilter').click(function() {
    filtrar();
  });

  $('#doAdd').click(function() {
    addCategory();
  });

  $('#doReset').click(function() {
    reset();
  });

  db = new loki('cards.db');
  db.loadDatabase();
}

function addCategory() {
  var tag = $('#tag').val().trim();
  var input = $('#in').val().trim().split('\n');
  var theCards = getCards();
  var nuevas = [], total = 0;
  var result = '';

  if ($('#in').val().trim() === '' || tag === '') {
    alert('Los campos etiqueta y lista de entrada son obligatorios');
    return;
  }

  input.forEach(function(respuesta) {
    if (respuesta.trim() === '') { return false; }
    var card = theCards.findOne({ respuesta: respuesta });
    if (!card) {
      card = theCards.insert({ respuesta: respuesta, categorias: [] });
      nuevas.push(respuesta);
    }
    if (card.categorias.indexOf(tag) === -1) {
      card.categorias.push(tag);
    }
    total++;
  });

  db.saveDatabase();
  theCards.find().forEach(function(card) {
    result += JSON.stringify(_.pick(card, 'respuesta', 'categorias')) + '\n';
  });
  $('#out1').val(result);
  $('#out2').val('Total: ' + total + '\nNuevas: ' + nuevas.length + '\n\n' + nuevas.join('\n'));

  $('#tag').val('');
  $('#in').val('');
}

function reset() {
  if (cards) {
    cards.removeDataOnly();
    db.saveDatabase();
    alert('¡BORRADO!');
  } else {
    alert('Nada que borrar');
  }
}

function getCards() {
  if (!cards) {
    cards = db.getCollection('cards') || db.addCollection('cards');
  }
  return cards;
}

function filtrar() {
  var out1 = [];
  var out2 = [];
  var input = $('#in').val().split('\n');
  var re = getRegexp();

  input.forEach(function(line) {
    if (re.test(line)) {
      out1.push(line);
    } else {
      out2.push(line);
    }
  });

  $('#out1').val(out1.join('\n'));
  $('#out2').val(out2.join('\n'));
}

function getRegexp() {
  var filter = $('#filter').val();
  return new RegExp(filter);
}
