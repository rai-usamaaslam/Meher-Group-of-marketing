(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-scroll-carousel="testimonials-carousel"]').forEach(function (button) {
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
}());
