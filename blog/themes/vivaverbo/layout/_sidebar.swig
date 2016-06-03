<nav role="menu" class="sidebar mdl-shadow--4dp hidden">
  <button aria-label="Cerrar menú" class="btn icon-btn close"><i class="zmdi zmdi-close"></i></button>
  <ul class="primary">
    <li role="menuitem"><a href="/"><i class="zmdi zmdi-home zmdi-hc-fw"></i>Vivaverbo</a></li>
    <li role="menuitem"><a href="{{ url_for() }}"><i class="zmdi zmdi-comment-outline zmdi-hc-fw"></i>Blog</a>
      <ul class="sections">
    		{% for item in theme.menu %}
          {% if item.text === page.category %}
            {% set classes = ' class="selected"' %}
          {% else %}
            {% set classes = '' %}
          {% endif %}
          {% if item.slug %}
            {% set url = url_for('/' + config.category_dir + '/' + item.slug) %}
          {% else %}
            {% set url = url_for('/proximamente?q=' + item.text) %}
          {% endif %}
    			<li{{ classes }} role="menuitem"><a href="{{ url }}"><i class="zmdi zmdi-collection-text zmdi-hc-fw"></i>{{ item.text }}</a></li>
    		{% endfor %}
      </ul>
    </li>
    <li><a href="#" class="no-close"><i class="zmdi zmdi-star-outline zmdi-hc-fw"></i>¿Me sigues?</a>
      <ul class="follow">
        <li role="menuitem"><a href="{{ theme.subscriptionURL }}" onclick="trackSubscription(); return false;"><i class="zmdi zmdi-notifications-none zmdi-hc-fw"></i>Suscripción</a></li>
        <li role="menuitem"><a href="https://www.facebook.com/vivaverbo/" target="_blank"><i class="zmdi zmdi-facebook zmdi-hc-fw"></i>Facebook</a></li>
        <li role="menuitem"><a href="https://twitter.com/vivaverbo" target="_blank"><i class="zmdi zmdi-twitter zmdi-hc-fw"></i>Twitter</a></li>
        <li role="menuitem"><a href="{{ theme.feed_url }}"><i class="zmdi zmdi-rss zmdi-hc-fw"></i>RSS</a></li>
      </ul>
    </li>
  </ul>
  <ul class="secondary">
    <li role="menuitem"><a href="{{ url_for('/prie') }}"><i class="zmdi zmdi-info-outline zmdi-hc-fw"></i>Acerca de</a></li>
    <li role="menuitem"><script>document.write([30, 67, 2, 74, 84, 71, 72, 31, 4, 79, 67, 75, 78, 86, 81, 28, 75, 80, 72, 81, 34, 88, 75, 88, 67, 88, 71, 84, 68, 81, 16, 69, 81, 79, 4, 32, 30, 75, 2, 69, 78, 67, 85, 85, 31, 4, 92, 79, 70, 75, 2, 92, 79, 70, 75, 15, 71, 79, 67, 75, 78, 2, 92, 79, 70, 75, 15, 74, 69, 15, 72, 89, 4, 32, 30, 17, 75, 32, 37, 81, 80, 86, 67, 69, 86, 81, 30, 17, 67, 32].map(function(c) { return String.fromCharCode(c + 30); }).join(''));</script></li>
    <li role="menuitem"><a href="{{ url_for('/private') }}"><i class="zmdi zmdi-lock-outline zmdi-hc-fw"></i>Aviso legal</a></li>
  </ul>
</nav>
<div class="mask-modal hidden"></div>
