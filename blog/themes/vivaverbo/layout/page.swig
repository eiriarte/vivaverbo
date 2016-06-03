{% extends "_layout.swig" %}
{% block content %}
  {% if page.path === 'busqueda.html' %}
    {% include '_busqueda.swig' %}
  {% elseif page.path === 'proximamente/index.html' %}
    {% include '_proximamente.swig' %}
  {% else %}
    <article class="post permalink page actions mdl-shadow--2dp">
      <header>
        <h1 class="post-title medium">{{ page.title }}</h1>
      </header>
      <div class="post-content">
        {{ page.content }}
      </div>
    </article>
  {% endif %}
{% endblock %}
