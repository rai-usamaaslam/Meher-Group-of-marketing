(function () {
  'use strict';

  var carousel = document.getElementById('news-carousel');
  if (!carousel || !window.Swiper) return;

  var slides = carousel.querySelectorAll('.news-slide');
  if (slides.length < 2) return;

  var desktopSlides = Math.min(3, slides.length - 1);
  var tabletSlides = Math.min(2, slides.length - 1);
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var swiper = new window.Swiper(carousel, {
    loop: slides.length > desktopSlides,
    speed: reducedMotion ? 0 : 500,
    slidesPerView: 1,
    spaceBetween: 16,
    watchOverflow: true,
    keyboard: { enabled: true, onlyInViewport: true },
    autoplay: reducedMotion ? false : {
      delay: 3000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
      stopOnLastSlide: false
    },
    navigation: {
      nextEl: '.news-slider-next',
      prevEl: '.news-slider-previous'
    },
    pagination: {
      el: '.news-carousel-pagination',
      clickable: true
    },
    breakpoints: {
      768: { slidesPerView: tabletSlides, spaceBetween: 18 },
      1024: { slidesPerView: desktopSlides, spaceBetween: 18 }
    },
    a11y: {
      enabled: true,
      paginationBulletMessage: 'Go to news slide {{index}}'
    },
    on: {
      slideChangeTransitionEnd: function (instance) {
        if (!reducedMotion && instance.autoplay && !instance.autoplay.running) instance.autoplay.start();
      }
    }
  });

  [document.querySelector('.news-slider-next'), document.querySelector('.news-slider-previous'), document.querySelector('.news-carousel-pagination')].forEach(function (control) {
    if (!control) return;
    control.addEventListener('click', function () {
      window.setTimeout(function () {
        if (!reducedMotion && swiper.autoplay && !swiper.autoplay.running) swiper.autoplay.start();
      }, 0);
    });
  });
}());
