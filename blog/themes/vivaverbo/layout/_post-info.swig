<div class="post-info">
  {% if is_post() %}
  Publicado el
  {% endif %}
  <time datetime="{{ post.date.format() }}">{{ date(post.date, 'D MMM YYYY') }}</time>
  {% if is_post() %}
  en
  {% else %}
  –
  {% endif %}
	{% for category in post.categories %}
		<a href="{{ url_for(category.path ) }}">{{ category.name }}</a>
	{% endfor %}
  {% if post.tags && post.tags.length %}
  	<div aria-label="Etiquetas" class="tags">
  		<i class="zmdi zmdi-label"></i>
  		{% for tag in post.tags %}
  			<a href="{{ url_for(tag.path) }}">{{ tag.name }}</a>
  		{% endfor %}
  	</div>
  {% endif %}
</div>
