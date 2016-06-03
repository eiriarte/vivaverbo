'use strict';

hexo.extend.tag.register('div', function(args, content) {
  content = hexo.render.renderSync({ text: content, engine: 'markdown' });
  return '<div class="' + args.join(' ') + '">' + content + '</div>';
}, { ends: true });
