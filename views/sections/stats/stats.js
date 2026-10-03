(function () {
  'use strict';

  var statsSection = document.querySelector('.stats-section');
  if (!statsSection) return;

  if (window.MGMSections) window.MGMSections.reveal(statsSection);
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var started = false;

  function animateStats() {
    if (started) return;
    started = true;

    statsSection.querySelectorAll('[data-count]').forEach(function (element) {
      var original = element.getAttribute('data-count');
      var numeric = parseFloat(original.replace(/[^\d.]/g, ''));
      var suffix = original.replace(/[\d.]/g, '');
      if (!Number.isFinite(numeric)) return;
      if (reducedMotion) {
        element.textContent = original;
        return;
      }

      var start = performance.now();
      var duration = 1200;
      function frame(now) {
        var progress = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = Math.round(numeric * eased).toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  }

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      if (entries.some(function (entry) { return entry.isIntersecting; })) {
        animateStats();
        observer.disconnect();
      }
    }, { threshold: 0.25 });
    observer.observe(statsSection);
  } else {
    animateStats();
  }
}());
