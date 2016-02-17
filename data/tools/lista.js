$(function() {
  init();
});

var terminal;
var saludo = '<i><b>Vivaverbo cards: ¡¡¡CUIDADO CON LOS GÉNEROS!!!</b></i>';
var ayuda = 'Comandos disponibles: help, clear, select, next, prev, show, merge, revo, piv, rae, es, eo, addcat, delcat';
var langs = ['es', 'en', 'it', 'fr', 'pt', 'ca', 'gl'];
var db, idbAdapter, cards, selection, current, dupes = [];

function init() {
  loadDB();
  var options = {
    welcome: saludo,
    theme: 'white'
  }
  terminal = new Terminal('consola', options, { execute: execCommand });
}

function execCommand(command, args) {
  var arg = args.join(' ');
  var result = '';
  try {
    switch (command) {
      case 'help':
        return ayuda;
      case 'clear':
        terminal.clear();
        return saludo;
      case 'sel':
      case 'select':
        var q = {};
        if (arg[0] !== '{') {
          q.categorias = { $contains: args[0] };
        } else {
          q = JSON.parse(arg);
        }
        var tmp = cards.chain().find(q).simplesort('freq').data();
        if (0 === tmp.length) {
          result = htmlError('La consulta no ha devuelto resultados.');
        } else {
          selection = tmp;
          irA(0);
          result = '<b>Num. de tarjetas:</b> ' + selection.length + '<br/>';
          result += mostrarTarjeta();
        }
        return result;
      case 'show':
        return mostrarTarjeta();
      case 'next':
        if (selection.length - 1 === current) {
          result = htmlError('¡Ya estás en la última tarjeta!');
        } else {
          irA(current + 1);
          result = mostrarTarjeta();
        }
        return result;
      case 'prev':
        if (0 === current) {
          result = htmlError('¡Ya estás en la primera tarjeta!');
        } else {
          irA(current - 1);
          result = mostrarTarjeta();
        }
        return result;
      case 'merge':
        if (0 === dupes.length) {
          return htmlError('¡No hay duplicados que fusionar!');
        }
        fusionarTarjetas();
        return mostrarTarjeta();
      case 'revo':
        var word = args[0] || selection[current].respuesta.trim();
        var url = 'http://www.simplavortaro.org/api/v1/vorto/' + word;
        $.getJSON(url, function(data) {
          $('#info').html(htmlReVo(data));
        }).fail(function(jqxhr, textStatus, err) {
          window.alert(jqxhr.status + ', ' + err);
        });
        return '';
      case 'rae':
        var word = args[0] || selection[current].pregunta.trim();
        var url = 'http://dle.rae.es/srv/search?w=' + word + '&m=form';
        $.get(url, function(data) {
          $('#info').html(data);
        }).fail(function(jqxhr, textStatus, err) {
          window.alert(jqxhr.status + ', ' + err);
        });
        return '';
      case 'piv':
        var word = args[0] || selection[current].respuesta.trim();
        var url = 'http://vortaro.net/#' + word;
        $("<a>").attr("href", url).attr("target", "_blank")[0].click();
        return '';
      case 'es':
        if (arg.trim() && setField(arg, 'pregunta', 'sinP')) {
          return mostrarTarjeta();
        }
        return htmlError('No se puede añadir esa pregunta.');
      case 'eo':
        if (arg.trim() && setField(arg, 'respuesta', 'sinR')) {
          return mostrarTarjeta();
        }
        return htmlError('No se puede añadir esa respuesta.');
      case 'fres':
        selection[current].frasePregunta = arg;
        saveDB();
        return mostrarTarjeta();
      case 'freo':
        selection[current].fraseRespuesta = arg;
        saveDB();
        return mostrarTarjeta();
      case 'addcat':
        selection[current].categorias.push(args[0]);
        saveDB();
        return mostrarTarjeta();
      case 'delcat':
        _.pull(selection[current].categorias, args[0]);
        saveDB();
        return mostrarTarjeta();
      default:
        return false;
    }
  } catch (e) {
    return htmlError('ERROR: ' + e.message);
  }
}

function setField(value, field, fieldSin) {
  var card = selection[current];
  var words = value.split(/;/).map(function(word) { return word.trim(); });
  var word = words.shift();

  card[field] = word;
  if (words.length > 0) {
    card[fieldSin] = words;
  } else {
    delete card[fieldSin];
  }
  saveDB();
  return true;
}

function htmlError(msg) {
  return '<b class="error">' + msg + '</b>';
}

function htmlReVo(data) {
  var html = '<h1>ReVo: ' + data.vorto + '</h1>';
  var difinoj = data.difinoj.map(function(dif) {
    var result = '<li>';
    result += dif.difino;
    if (dif.ekzemploj.length > 0) {
      result += '<ul class="ekzemploj">';
      dif.ekzemploj.forEach(function(ekz) {
        var fnt;
        switch (ekz.fonto) {
          case 'Proverbaro esperanta': fnt = '[PrV]'; break;
          case 'Zamenhof': fnt = '[Z]'; break;
          case null: fnt = '[?]'; break;
          default: fnt = '';
        };
        if (_.startsWith(ekz.fonto, 'Fundamento de Esperanto')) {
          fnt = '[Fund]';
        }
        result += '<li title="' + ekz.fonto + '">' + ekz.ekzemplo + ' <i class="fnt">' + fnt + '</i></li>';
      });
      result += '</ul>'
    }
    dif.tradukoj.forEach(function(trad) {
      if (_.contains(langs, trad.kodo)) {
        result += ' <b>' + trad.kodo + ':</b> ' + trad.traduko + ';';
      }
    });
    result += '</li>';
    return result;
  });
  html += '<ul class="difinoj">' + difinoj.join('\n') + '</ul>';
  return html;
}

function loadDB() {
  idbAdapter = new LokiIndexedAdapter('vivaverbo');
  db = new loki('Cards_1.0', { adapter: idbAdapter });
  db.loadDatabase({}, function() {
    cards = db.getCollection('cards');
    if (!cards) {
      cards = db.addCollection('cards');
      cards.insert(cardsArray); // cardsArray => definido en cards.js
      saveDB();
    }
  });
}

function saveDB() {
  try {
    db.saveDatabase();
  } catch(e) {
    window.alert('Ooops! No se puede guardar la BD ¿No hay espacio?');
  }
}

function fusionarTarjetas() {
  var newCard = { freq: 9999999, sinP: [], sinR: [], categorias: [] };
  var card = selection[current];

  dupes.unshift(card);
  dupes.forEach(function(dupe) {
    newCard.freq = _.min([dupe.freq, newCard.freq]);
    newCard.sinP = newCard.sinP.concat(dupe.pregunta && dupe.pregunta.split(/[|;,]/), dupe.sinP);
    newCard.sinR = newCard.sinR.concat(dupe.respuesta.split(/[|;,]/), dupe.sinR);
    newCard.categorias = newCard.categorias.concat(dupe.categorias);
  });
  newCard.sinP = newCard.sinP.map(function(word) { return word && word.trim(); });
  newCard.sinR = newCard.sinR.map(function(word) { return word && word.trim(); });

  newCard.sinP = _.compact(_.uniq(newCard.sinP));
  newCard.pregunta = newCard.sinP.shift();
  if ('undefined' === typeof newCard.pregunta) delete newCard.pregunta;
  if (0 === newCard.sinP.length) delete newCard.sinP;

  newCard.sinR = _.compact(_.uniq(newCard.sinR));
  newCard.respuesta = newCard.sinR.shift();
  if (0 === newCard.sinR.length) delete newCard.sinR;

  newCard.categorias = _.compact(_.uniq(newCard.categorias));
  _.assign(card, newCard);
  dupes.slice(1).forEach(function(dupe) { cards.remove(dupe); });
  _.remove(selection, function(sCard) { return _.includes(dupes, sCard, 1); });
  dupes = [];
  saveDB();
}

function mostrarTarjeta() {
  var result = '';
  var pos = '(' + (current + 1) + '/' + selection.length + ')';
  if (dupes.length > 0) {
    result += htmlError('Encontradas ' + dupes.length + ' redundancias' +
                        ' (fusionar con <code>merge</code>):');
  }
  result += '<table class="tarjetas"><tr>';
  result += '<td class="tarjeta">' + htmlTarjeta(selection[current], pos) + '</td>';
  dupes.forEach(function(card) {
    result += '<td>' + htmlTarjeta(card) + '</td>';
  });
  result += '</tr></table>';
  return result;
}

function htmlTarjeta(card, pos) {
  var result = pos ? '<span class="pos">' + pos + '</span>': '';
  result += '<b>Pregunta:</b> ' + (card.pregunta || '');
  result += card.sinP ? ' ' + JSON.stringify(card.sinP) + '<br/>' : '<br/>';
  result += '<b>Respuesta:</b> ' + card.respuesta;
  result += card.sinR ? ' ' + JSON.stringify(card.sinR) : '';
  result += ' <i>(' + card.freq + ')</i><br/>';
  result += '<b>Categorías:</b> ' + card.categorias.join(', ');
  if (card.frasePregunta) {
    result += '<br/><b>Frase (es):</b> ' + card.frasePregunta;
  }
  if (card.fraseRespuesta) {
    result += '<br/><b>Frase (eo):</b> ' + card.fraseRespuesta;
  }
  return result;
}

function irA(index) {
  normalizeFields(selection[index]);
  findDuplicates(selection[index]);

  current = index;
}

function normalizeFields(card) {
  if (card.norm) { return; }
  var respuestas = card.respuesta.split(/[|;,]/);
  var preguntas = card.pregunta || '';
  preguntas = preguntas.split(/[|;,]/);

  function sinonimos(lista, primera, field) {
    var result = [];
    if (lista.length > 1) {
      result = lista.slice(1).map(function(word) {
        word = word.trim();
        return (word === primera) ? '' : word;
      });
      result = _.uniq(_.compact(result));
      if (result.length > 0) {
        card[field] = result;
      }
    }
  }

  card.pregunta = preguntas[0].trim();
  card.respuesta = respuestas[0].trim();

  sinonimos(preguntas, card.pregunta, 'sinP');
  sinonimos(respuestas, card.respuesta, 'sinR');

  card.norm = true;
  saveDB();
}

function findDuplicates(card) {
  var words = card.respuesta.split(',');
  dupes = [];
  var re;

  words.forEach(function(word) {
    re = new RegExp('(,\\s*|^)' + word.trim() + '(\\s*,|$)');
    cards.find({ respuesta: { $regex: re }}).forEach(function(dup) {
      if (dup.$loki !== card.$loki) {
        dupes.push(dup);
      }
    });
  });
}
