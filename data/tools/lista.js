$(function() {
  init();
});

var terminal;
var saludo = '<i><b>Vivaverbo cards: ¡¡¡CUIDADO CON LOS GÉNEROS!!!</b></i>';
var ayuda = 'Comandos disponibles: help, clear, select, next, prev, show, merge, split, revo, piv, rae, diego, tex, ssv, clearinfo, es, eo, addcat, delcat, freq, goto, deleteCard, addCard';
var langs = ['es', 'en', 'it', 'fr', 'pt', 'ca', 'gl'];
var db, dbTex, idbAdapter, cards, ssv, selection = [], selQuery = '-', current = 0, dupes = [];
var tekstaro, previousWord = { word: '', offset: 0 }, teksPageSize = 25;
var $info, $state, changed;

function init() {
  $state = $('#toolbar .state');
  $info = $('#info');
  $info.click(infoClick);
  changed = new Set();
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
      case 'clearinfo':
        $info.html('<h1>#info</h1>');
        return '';
      case 'sel':
      case 'select':
        var q = {};
        selQuery = arg;
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
          irA(1);
          result = '<b>Num. de tarjetas:</b> ' + selection.length + '<br/>';
          result += mostrarTarjeta();
          updateInfoCategory();
          if (selection.length < 10000) {
            var lista = selection.map(function(card, index) {
              return (index+1) + ' ' + card.respuesta;
            });
            console.log(lista.join('\n'));
          }
        }
        return result;
      case 'show':
        if (arg) {
          var card = cards.find({ respuesta: arg })[0];
          if (!card) {
            result = htmlError('No se encuentra la tarjeta "' + arg + '".');
          } else {
            result = mostrarTarjeta(card);
          }
        } else {
          result = mostrarTarjeta();
        }
        return result;
      case 'next':
        if (selection.length - 1 === current) {
          result = htmlError('¡Ya estás en la última tarjeta!');
        } else {
          irA(current + 1 + 1);
          result = mostrarTarjeta();
        }
        return result;
      case 'prev':
        if (0 === current) {
          result = htmlError('¡Ya estás en la primera tarjeta!');
        } else {
          irA(current + 1 - 1);
          result = mostrarTarjeta();
        }
        return result;
      case 'goto':
        if (irA(arg)) {
          result = mostrarTarjeta();
        } else {
          result = htmlError('No existe la tarjeta "' + arg + '" en esta selección.');
        }
        return result;
      case 'merge':
        if (0 === dupes.length) {
          return htmlError('¡No hay duplicados que fusionar!');
        }
        fusionarTarjetas();
        updateInfoCategory();
        return mostrarTarjeta();
      case 'split':
        duplicarTarjeta();
        updateInfoCategory();
        findDuplicates(selection[current]);
        return mostrarTarjeta();
      case 'revo':
        var word = args[0] || selection[current].respuesta.trim();
        var url = 'http://www.simplavortaro.org/api/v1/vorto/' + word;
        $.getJSON(url, function(data) {
          addInfo(htmlReVo(data));
        }).fail(function(jqxhr, textStatus, err) {
          console.log(jqxhr.status + ', ' + err);
          $info.effect('shake');
        });
        return '';
      case 'rae':
        var word = args[0] || selection[current].pregunta.trim();
        var url = 'http://dle.rae.es/srv/search?w=' + word + '&m=form';
        $.get(url, function(data) {
          addInfo(htmlRAE(data));
        }).fail(function(jqxhr, textStatus, err) {
          console.log(jqxhr.status + ', ' + err);
          $info.effect('shake');
        });
        return '';
      case 'piv':
        var word = args[0] || selection[current].respuesta.trim();
        var url = 'http://vortaro.net/#' + word;
        $("<a>").attr("href", url).attr("target", "_blank")[0].click();
        return '';
      case 'tex':
        var word = args[0] || selection[current].respuesta.trim();
        var work = args[1] || 'any';
        addInfo(htmlTekstaro(word, work));
        return '';
      case 'ssv':
        var word = args[0] || selection[current].respuesta.trim();
        addInfo(htmlSSV(word));
        return '';
      case 'diego':
        var word = args[0] || selection[current].pregunta.trim();
        var url = 'http://www.esperanto.es:8080/diccionario/inicio.jsp?que=' + word;
        $.get(url, function(data) {
          var $html = $(data);
          var titulo = '<h1>Diego: ' + word + '<i class="close">✕</i></h1>';
          addInfo(titulo + '<table>' + $html.find('table').html() + '</table>');
        }).fail(function(jqxhr, textStatus, err) {
          window.alert(jqxhr.status + ', ' + err);
        });
        return '';
      case 'es':
        if (arg.trim() && setField(arg, 'pregunta', 'sinP')) {
          return mostrarTarjeta();
        }
        return htmlError('No se puede añadir esa pregunta.');
      case 'eo':
        if (arg.trim() && setField(arg, 'respuesta', 'sinR')) {
          findDuplicates(selection[current]);
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
      case 'freq':
        selection[current].freq = parseInt(arg);
        saveDB();
        return mostrarTarjeta();
      case 'addcat':
        arg.split(',').forEach(function(cat) {
          selection[current].categorias.push(cat.trim());
        });
        saveDB();
        return mostrarTarjeta();
      case 'delcat':
        arg.split(',').forEach(function(cat) {
          _.pull(selection[current].categorias, cat.trim());
        });
        saveDB();
        return mostrarTarjeta();
      case 'deleteCard':
        cards.remove(selection[current]);
        selection.splice(current, 1);
        updateInfoCategory();
        saveDB();
        return mostrarTarjeta();
      case 'addCard':
        var card = {
          pregunta: 'nueva palabra',
          respuesta: 'nova vorto',
          freq: maxFreq() + 1,
          categorias: [ arg ]
        };
        card = cards.insert(card);
        selection.splice(current, 0, card);
        saveDB();
        updateInfoCategory();
        return mostrarTarjeta();
      default:
        return false;
    }
  } catch (e) {
    return htmlError('ERROR: ' + e.message);
  }
}

function infoClick(event) {
  $clicked = $(event.toElement);
  if ($clicked.hasClass('close')) {
    $clicked.closest('section').remove();
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

function maxFreq() {
  return cards.chain().simplesort('freq', true).data()[0].freq;
}

function htmlError(msg) {
  return '<b class="error">' + msg + '</b>';
}

function addInfo(html) {
  if (html) {
    $info.prepend('<section>' + html + '</section>');
  }
}

function updateInfoCategory() {
  $('#toolbar .category').text(selQuery + ' (' + selection.length + ')');
}

function htmlSSV(word) {
  var results = ssv.find({ word: { $regex: new RegExp(word, 'i') } });
  html = '<h1>SSV: ' + word + '<i class="close">✕</i></h1>';
  html += '<ul class="tekstaro">';
  results.forEach(function(res) {
    html += '<li class="ssv"><b>' + res.word + '</b> ' + res.alt + '</li>';
  });
  html += '</ul>';

  return html;
}

function htmlTekstaro(word, work) {
  var theWord, search, query, results, html;

  // Construimos la expresión regular para la palabra
  if (_.endsWith(word, 'a') || _.endsWith(word, 'o')) {
    theWord = word + 'j?n?';
  } else if (_.endsWith(word, 'i')) {
    theWord = word.slice(0, -1) + '(i|u|as|is|os)';
  } else {
    theWord = word;
  }
  theWord = '\\b' + theWord + '\\b';
  search = new RegExp(theWord, 'i');

  // Construimos la query a la BD y la ejecutamos
  if (word === previousWord.word) {
    previousWord.offset += teksPageSize;
  } else {
    previousWord.word = word;
    previousWord.offset = 0;
  }
  query = { sentence: { $regex: search } };
  if ('any' !== work) {
    query.work = work;
  }
  results = tekstaro.chain().find(query).simplesort('length').
    offset(previousWord.offset).limit(teksPageSize).data();

  // Construimos el HTML a partir de los resultados
  html = '<h1>Tekstaro: ' + word + '<i class="close">✕</i></h1>';
  html += '<ul class="tekstaro">';
  results.forEach(function(res) {
    html += '<li title="' + res.work + '">' + res.sentence;
    html += ' <i class="fnt">(' + res.date + ')</i>';
    html += '</li>';
  });
  html += '</ul>';

  return html;
}

function htmlRAE(data) {
  var $html = $(data);
  var $art = $html.find('article');
  if ($art.length > 0) {
    // ¡Encontrado el artículo!
    $art.find('header').append('<i class="close">✕</i>');
    return $art.html();
  } else {
    // No encontrado: debe de ser una lista de enlaces de desambiguación
    var $links = $html.find('a');
    var url;
    if (0 === $links.length) {
      return data;
    }
    $links.each(function() {
      var $link = $(this);
      // Suponemos que la palabra buscada no es un verbo
      if (!_.endsWith($link.text(), 'r.')) {
        url = 'http://dle.rae.es/srv/' + $link.attr('href');
        return false;
      }
    });
    if (url) {
      $.get(url, function(data) {
        var $html = $(data);
        var $art = $html.find('article');
        $art.find('header').append('<i class="close">✕</i>');
        addInfo('&gt;&gt;&gt;' + $art.html());
      }).fail(function(jqxhr, textStatus, err) {
        console.log(jqxhr.status + ', ' + err);
        $info.effect('shake');
      });
    }
    return false;
  }

}

function htmlReVo(data) {
  var html = '<h1>ReVo: ' + data.vorto + '<i class="close">✕</i></h1>';
  var difinoj = htmlReVoDifs(data.difinoj);
  html += '<ul class="difinoj">' + difinoj.join('\n') + '</ul>';
  return html;
}

function htmlReVoDifs(difinoj) {
  return difinoj.map(function(dif) {
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
    if (dif.tradukoj) {
      dif.tradukoj.forEach(function(trad) {
        if (_.contains(langs, trad.kodo)) {
          result += ' <b>' + trad.kodo + ':</b> ' + trad.traduko + ';';
        }
      });
    }
    if (dif.pludifinoj && dif.pludifinoj.length > 0) {
      result += '<ul class="pludifinoj">' + htmlReVoDifs(dif.pludifinoj).join('\n') + '</ul>';
    }
    result += '</li>';
    return result;
  });
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
    dbTex = new loki();
    tekstaro = dbTex.addCollection('tekstaro');
    tekstaro.insert(sentences); // sentences => definido en tekstaro.js

    var dbSSV = new loki();
    ssv = dbTex.addCollection('ssv');
    ssv.insert(dataSSV); // dataSSV => definido en ssv.js

    $state.removeClass('warning');
    $state.text('✓');
  });
}

function saveDB() {
  try {
    $state.addClass('warning');
    $state.text('Guardando…');
    db.saveDatabase(function(err) {
      if (err) {
        window.alert('Ooops! No se puede guardar la BD ¿No hay espacio? – ' + err.message);
      } else {
        $state.removeClass('warning');
        $state.text('✓');
      }
    });
  } catch(e) {
    window.alert('Ooops! No se puede guardar la BD ¿No hay espacio? – ' + e.message);
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

function duplicarTarjeta() {
  var newCard = _.cloneDeep(selection[current]);
  delete newCard.$loki;
  delete newCard.meta;
  selection.splice(current + 1, 0, cards.insert(newCard));
  saveDB();
}

function mostrarTarjeta(card) {
  var result = '';
  var pos = !card ? '(' + (current + 1) + '/' + selection.length + ')' : '';
  if (!card && dupes.length > 0) {
    result += htmlError('Encontradas ' + dupes.length + ' redundancias' +
                        ' (fusionar con <code>merge</code>):');
  }
  result += '<table class="tarjetas"><tr>';
  result += '<td class="tarjeta">' + htmlTarjeta(card || selection[current], pos) + '</td>';
  if (!card) {
    dupes.forEach(function(card) {
      result += '<td>' + htmlTarjeta(card) + '</td>';
    });
  }
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

function irA(pos) {
  var index;

  if (isFinite(pos)) {
    index = pos - 1;
  } else {
    index = _.findIndex(selection, { 'respuesta': pos.trim() });
  }

  if ('undefined' === typeof selection[index]) {
    return false;
  }

  normalizeFields(selection[index]);
  findDuplicates(selection[index]);

  current = index;
  return true;
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
  changed.add(card);
  $('#toolbar .progress').text(changed.size);
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
