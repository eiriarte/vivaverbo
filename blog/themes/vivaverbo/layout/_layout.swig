<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  {% if page.sitemap === false || is_tag() %}
    <meta name="robots" content="noindex, follow">
  {% endif %}
  {% if page.featured_image %}
    {% set og_image = config.url + '/' + page.path + page.featured_image %}
  {% else %}
    {% set og_image = '' %}
  {% endif %}
  {{ open_graph({
    fb_app_id: theme.facebookID,
    twitter_site: '@vivaverbo',
    image: og_image
  }) }}
  {{ autoCanonical(config, page) }}
  {{ feed_tag(theme.feed_url) }}
  {% include "_meta_title.swig" %}
  {% if page.meta_keywords %}
    <meta name="keywords" content="{{ page.meta_keywords }}">
  {% endif %}
  <link href="https://cdnjs.cloudflare.com/ajax/libs/material-design-iconic-font/2.2.0/css/material-design-iconic-font.min.css" rel="stylesheet">
  <link href='https://fonts.googleapis.com/css?family=Roboto:400,500,700,400italic|Roboto+Slab:400&subset=latin,latin-ext' rel='stylesheet' type='text/css'>
  <link rel="stylesheet" href="{{ url_for('/css/styles.css') }}">
  <script>
  var trackSubscription = function() {
    var url = '{{ theme.subscriptionURL }}';
    ga('send', 'pageview', '/subscriptionForm', {
      'title': 'Formulario de suscripción',
      'transport': 'beacon',
      'hitCallback': function(){document.location = url;}
    });
  }
  </script>
  {% if page.posts && page.posts.length > 1 %}
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/lazyloadjs/3.2.2/lazyload.min.js"></script>
  {% endif %}
</head>
<body ontouchstart>
  <header role="banner" class="toolbar mdl-shadow--4dp">
    <a href="#main" class="skip">Saltar al contenido</a>
    <div class="centered">
      <button class="btn icon-btn search-btn right" aria-label="Ir a búsqueda"><i class="zmdi zmdi-search"></i></button>
      <nav class="secciones" role="navigation" aria-label="Secciones">
        <ul>
      		{% for item in theme.menu %}
            {% if item.text === page.category %}
              {% set classes = ' class="selected"' %}
              {% set dropdownText = item.text %}
            {% else %}
              {% set classes = '' %}
            {% endif %}
            {% if item.slug %}
              {% set url = url_for('/' + config.category_dir + '/' + item.slug) %}
            {% else %}
              {% set url = url_for('/proximamente?q=' + item.text) %}
            {% endif %}
      			<li{{ classes }}><a href="{{ url }}">{{ item.text }}</a></li>
      		{% endfor %}
        </ul>
      </nav>
      <button class="btn dropdown cat-dropdown right" aria-hidden="true">{{ dropdownText || 'Secciones' }} <i class="zmdi zmdi-caret-down"></i></button>
      <button class="btn icon-btn menu-btn" aria-label="Ir a menú"><i class="zmdi zmdi-menu"></i></button>
      <a href="{{ url_for('/') }}">
        <h1 class="logo"><span class="screen-reader-text">Vivaverbo</span></h1>
      </a>
      <form action="{{ url_for('/busqueda.html') }}" method="get" class="search" role="search">
        <input aria-label="Texto a buscar" class="textfield" placeholder="Búsqueda…" type="search" required name="q" id="q">
        <button class="btn mdl-shadow--2dp" type="submit">Buscar</button>
      </form>
      <button class="btn subscribe-btn color-primary mdl-shadow--2dp hidden">¿Te suscribes?</button>
    </div>
  </header>
  <main id="main" role="main">
    <div class="centered">
      {% block content %}{% endblock %}
    </div>
  </main>
  <footer role="contentinfo" class="site-footer mdl-shadow--2dp">
    <div class="footer">
      <section role="navigation" class="ft-vivaverbo">
        <h1>Vivaverbo</h1>
        <ul class="zmdi-hc-ul">
          <li><i class="zmdi-hc-li zmdi zmdi-home"></i><a href="/">Inicio</a></li>
          <li><i class="zmdi-hc-li zmdi zmdi-comment-outline"></i><a href="{{ url_for() }}">Blog</a></li>
          <li><i class="zmdi-hc-li zmdi zmdi-info-outline"></i><a href="{{ url_for('/prie') }}">Acerca de</a></li>
          <li><i class="zmdi-hc-li zmdi zmdi-email"></i><script>document.write([30, 67, 2, 74, 84, 71, 72, 31, 4, 79, 67, 75, 78, 86, 81, 28, 75, 80, 72, 81, 34, 88, 75, 88, 67, 88, 71, 84, 68, 81, 16, 69, 81, 79, 4, 32, 37, 81, 80, 86, 67, 69, 86, 81, 30, 17, 67, 32].map(function(c) { return String.fromCharCode(c + 30); }).join(''));</script></li>
          <li><i class="zmdi-hc-li zmdi zmdi-lock-outline"></i><a href="{{ url_for('/private') }}">Aviso legal</a></li>
        </ul>
      </section>
      <section role="navigation" class="ft-follow">
        <h1>¿Me sigues?</h1>
        <ul class="zmdi-hc-ul">
          <li><i class="zmdi-hc-li zmdi zmdi-notifications-none"></i><a href="{{ theme.subscriptionURL }}" onclick="trackSubscription(); return false;">Suscripción</a></li>
          <li><i class="zmdi-hc-li zmdi zmdi-facebook"></i><a href="https://www.facebook.com/vivaverbo/" target="_blank">Facebook</a></li>
          <li><i class="zmdi-hc-li zmdi zmdi-twitter"></i><a href="https://twitter.com/vivaverbo" target="_blank">Twitter</a></li>
          <li><i class="zmdi-hc-li zmdi zmdi-rss"></i><a href="{{ theme.feed_url }}">RSS</a></li>
        </ul>
      </section>
      <section class="ft-mission">
        <h1>Vivaverbo es...</h1>
        <p>
          Vivaverbo tiene como misión luchar contra el fenómeno
          de los <em>eternaj komencantoj</em>, proporcionando materiales
          de aprendizaje de calidad, y adaptados al siglo XXI.
        </p>
      </section>
    </div>
  </footer>
  {% include "_sidebar.swig" %}
  <script>
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

    ga('create', '{{ theme.analyticsID }}', 'auto');
    ga('send', 'pageview');
  </script>
  <script src="{{ url_for('/js/scripts.js') }}" async></script>
</body>
</html>
