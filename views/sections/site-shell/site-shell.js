(function () {
  'use strict';

  window.MGMSections = window.MGMSections || {};
  window.MGMSections.reveal = function (section) {
    if (!section) return;
    var revealItems = section.querySelectorAll('.reveal');
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if ('IntersectionObserver' in window && !reducedMotion) {
      var revealObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      revealItems.forEach(function (item) { revealObserver.observe(item); });
    } else {
      revealItems.forEach(function (item) { item.classList.add('is-visible'); });
    }
  };
}());
