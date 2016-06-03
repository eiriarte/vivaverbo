{% if is_tag() %}
  {% set title = 'Vivaverbo – Artículos sobre el esperanto: ' + page.tag %}
{% elseif is_category() %}
  {% set title = 'Vivaverbo – Artículos sobre el esperanto: ' + page.category %}
{% else %}
  {% set title = page.meta_title || page.title || 'Vivaverbo – Blog' %}
{% endif %}
<title>{{ title }}</title>
