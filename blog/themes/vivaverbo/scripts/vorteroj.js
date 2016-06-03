'use strict';

var frazoj = /<code>(.*?)<\/code>/g;
var vortoj = /([a-z\-ĉĝĥĵŝŭĈĜĤĴŜŬ<>\/]+)·([a-z\-ĉĝĥĵŝŭĈĜĤĴŜŬ·\(\)<>\/]+)/gi;

hexo.extend.filter.register('after_post_render', function(data) {
  var content = data.content;
  var excerpt = data.excerpt;
  var more = data.more;

  data.content = processVortoj(content);

  if (excerpt) {
    data.excerpt = processVortoj(excerpt);
  }

  if (more) {
    data.more = processVortoj(more);
  }
});

function processVortoj(content) {
  return content.replace(frazoj, function(match, frazo) {
    frazo = frazo.replace(vortoj, function(match, first, rest) {
      return '<b>' + first + '<i>' + rest.split('·').join('</i><i>') + '</i></b>';
    });
    return '<span lang="eo">' + frazo + '</span>';
  });
}
