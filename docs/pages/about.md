---
layout: page
title: About
permalink: /about/
weight: 1
---

# **About Me**

Hi I am **{{ site.author.name }}** :wave:,<br>
Self-taught and highly motivated Mechanical Engineering graduate from KUET with a strong passion for software development. Developed solid programming fundamentals and a consistent track record of solving complex problems independently. Proven ability to continuously learn new technologies, adapt quickly, and tackle complex challenges.

___


<div class="row">
{% include about/skills.html title="Skills" source=site.data.other-skills %}
</div>

___


<h2 class="mb-3">Education</h2>
<div class="row">
{% include about/timeline.html %}
</div>

___


<p class="text-center">
{% include elements/button.html link="https://drive.google.com/file/d/1K777gzDwuqJJWsxw2CgE5rvvYaQ57QeR/view" text="View Résumé" %}
</p>

<footer class="mt-auto py-3 text-center">
  {% include social.html %}
</footer>
