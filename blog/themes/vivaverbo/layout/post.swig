{% extends "_layout.swig" %}
{% block content %}
  {% set context = { post: page, type: "permalink", lazyload: false } %}
  {% include "_article.swig" with context %}
{% endblock %}
