{% set hasExcerpt = !is_post() && post.excerpt %}
{% set titleLength = post.title.length %}
{% if titleLength > 30 %}
  {% set fontSize = "small" %}
{% elseif titleLength > 10 %}
  {% set fontSize = "medium" %}
{% else %}
  {% set fontSize = "large" %}
{% endif %}
<article class="post {{ type }} actions mdl-shadow--2dp">
  <header class="post-header">
    {% if lazyload %}
      <img data-src="{{ url_for(post.path + post.featured_image) }}" alt="{{ page.alt_image }}" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" onload="lzld(this)">
    {% else %}
      <img src="{{ url_for(post.path + post.featured_image) }}" alt="{{ page.alt_image }}">
    {% endif %}
    {% if is_post() %}
      <h1 class="post-title {{ fontSize }}">{{ post.title }}</h1>
      <a role="button" href="#" class="btn icon-btn post-menu-btn"><i class="zmdi zmdi-more-vert"></i></a>
      <nav class="dropdown-menu" role="menu">
        <ul>
          <li role="menuitem"><a href="#" onclick="javascript:return vivaverbo.share('facebook', '{{ config.url + '/' + post.path }}', '{{ post.description }}', '{{ post.title }}');"><i class="zmdi zmdi-facebook zmdi-hc-fw"></i>Compartir en Facebook</a></li>
          <li role="menuitem"><a href="#" onclick="javascript:return vivaverbo.share('twitter', '{{ config.url + '/' + post.path }}', '{{ post.title }}');"><i class="zmdi zmdi-twitter zmdi-hc-fw"></i>Compartir en Twitter</a></li>
          <li role="menuitem"><a href="#" onclick="javascript:return vivaverbo.share('google', '{{ config.url + '/' + post.path }}', '{{ post.title }}');"><i class="zmdi zmdi-google-plus zmdi-hc-fw"></i>Compartir en Google+</a></li>
          <li role="menuitem"><a href="whatsapp://send?text={{ encodeURIComponent(post.title + ' — ' + config.url + '/' + post.path) }}" data-action="share/whatsapp/share"><i class="zmdi zmdi-whatsapp zmdi-hc-fw"></i>Enviar por Whatsapp</a></li>
        </ul>
      </nav>
    {% else %}
      {% include "_post-info.swig" %}
      <h1 class="post-title {{ fontSize }}"><a href="{{ url_for(post.path) }}">{{ post.title }}</a></h1>
    {% endif %}
    {% if post.author_image %}
      <div class="author-image">{{ post.author_image }}</div>
    {% endif %}
  </header>
  <div class="post-content">
    {% if hasExcerpt %}
      {{ post.excerpt }}
    {% else %}
      {{ post.content }}
    {% endif %}
  </div>
  {% if is_post() %}
    {% include "_post-info.swig" %}
  {% endif %}
  <div class="post-actions">
    <button aria-label="Compartir en Facebook" class="btn icon-btn social-btn" onclick="javascript:return vivaverbo.share('facebook', '{{ config.url + '/' + post.path }}', '{{ post.description }}', '{{ post.title }}');"><i class="zmdi zmdi-facebook"></i></button>
    <button aria-label="Compartir en Twitter" class="btn icon-btn social-btn" onclick="javascript:return vivaverbo.share('twitter', '{{ config.url + '/' + post.path }}', '{{ post.title }}');"><i class="zmdi zmdi-twitter"></i></button>
    <button aria-label="Compartir en Google+" class="btn icon-btn social-btn" onclick="javascript:return vivaverbo.share('google', '{{ config.url + '/' + post.path }}', '{{ post.title }}');"><i class="zmdi zmdi-google-plus"></i></button>
    <a aria-label="Enviar por Whatsapp" class="btn icon-btn social-btn" href="whatsapp://send?text={{ encodeURIComponent(post.title + ' — ' + config.url + '/' + post.path) }}" data-action="share/whatsapp/share"><i class="zmdi zmdi-whatsapp"></i></a>
    {% if hasExcerpt %}
      <a class="btn accent right" href="{{ url_for(post.path) }}">Leer más…</a>
    {% endif %}
  </div>
  {% if is_post() %}
    <aside class="toolbar-social mdl-shadow--4dp">
      <a aria-label="Compartir en Facebook" class="btn icon-btn social-btn" role="button" onclick="javascript:return vivaverbo.share('facebook', '{{ config.url + '/' + post.path }}', '{{ post.description }}', '{{ post.title }}');"><i class="zmdi zmdi-facebook"></i></a>
      <a aria-label="Compartir en Twitter" class="btn icon-btn social-btn" role="button" onclick="javascript:return vivaverbo.share('twitter', '{{ config.url + '/' + post.path }}', '{{ post.title }}');"><i class="zmdi zmdi-twitter"></i></a>
      <a aria-label="Compartir en Google+" class="btn icon-btn social-btn" role="button" onclick="javascript:return vivaverbo.share('google', '{{ config.url + '/' + post.path }}', '{{ post.title }}');"><i class="zmdi zmdi-google-plus"></i></a>
      <a aria-label="Enviar por Whatsapp" class="btn icon-btn social-btn" role="button" href="whatsapp://send?text={{ encodeURIComponent(post.title + ' — ' + config.url + '/' + post.path) }}" data-action="share/whatsapp/share"><i class="zmdi zmdi-whatsapp"></i></a>
    </aside>
  {% endif %}
</article>
{% if is_post() %}
  {% include "_disqus.swig" %}
{% endif %}
