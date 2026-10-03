(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-scroll-carousel="projects-carousel"]').forEach(function (button) {
    button.addEventListener('click', function () {
      var carousel = document.getElementById(button.dataset.scrollCarousel);
      if (!carousel) return;
      var card = carousel.querySelector(':scope > *');
      if (!card) return;
      var gap = parseFloat(window.getComputedStyle(carousel).columnGap) || 0;
      var direction = button.dataset.scrollDirection === 'next' ? 1 : -1;
      carousel.scrollBy({
        left: direction * (card.getBoundingClientRect().width + gap),
        behavior: reducedMotion ? 'auto' : 'smooth'
      });
    });
  });

  var filters = document.querySelectorAll('[data-project-filter]');
  var cards = document.querySelectorAll('[data-project-category]');
  var emptyState = document.querySelector('.project-empty:not(.is-static)');

  filters.forEach(function (filter) {
    filter.addEventListener('click', function () {
      var category = filter.dataset.projectFilter;
      var shown = 0;
      filters.forEach(function (item) { item.classList.toggle('is-active', item === filter); });
      cards.forEach(function (card) {
        var matches = category === 'all' || card.dataset.projectCategory === category;
        card.hidden = !matches;
        if (matches) shown++;
      });
      if (emptyState) emptyState.hidden = shown > 0;
    });
  });
}());
