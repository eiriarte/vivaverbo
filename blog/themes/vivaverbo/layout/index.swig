{% extends "_layout.swig" %}
{% block content %}
  {% if is_tag() %}
    <h2 class="archive tag"><i class="zmdi zmdi-label"></i>{{ page.tag }}</h2>
  {% elseif is_category() %}
    <h2 class="archive category"><i class="zmdi zmdi-collection-text"></i>{{ page.category }}</h2>
  {% elseif is_month() %}
    <h2 class="archive month"><i class="zmdi zmdi-calendar"></i>{{ page.month }}/{{ page.year }}</h2>
  {% elseif is_year() %}
    <h2 class="archive year"><i class="zmdi zmdi-calendar"></i>{{ page.year }}</h2>
  {% endif %}
  {% set lazyload = false %}
  {% for post in page.posts %}
    {% set context = { post: post, type: "excerpt", lazyload: lazyload } %}
    {% include "_article.swig" with context %}
    {% set lazyload = true %}
  {% endfor %}
  <nav role="navigation" class="paginator" aria-label="Paginación">
    {{ paginator({ prev_text: 'Anterior', next_text: 'Siguiente' }) }}
  </nav>
{% endblock %}
