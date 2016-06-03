<aside role="complementary" id="disqus_thread"></aside>
<script>
var disqus_config = function () {
  this.page.url = '{{ config.url + '/' + post.path }}';
  this.page.identifier = '{{ post.path }}';
  this.page.title = '{{ post.title }}';
};
(function() {
var d = document, s = d.createElement('script');

s.src = 'https://vivaverbo.disqus.com/embed.js';

s.setAttribute('data-timestamp', +new Date());
(d.head || d.body).appendChild(s);
})();
</script>
<noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript" rel="nofollow">comments powered by Disqus.</a></noscript>
