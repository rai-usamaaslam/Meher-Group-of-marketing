(function () {
  'use strict';

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
