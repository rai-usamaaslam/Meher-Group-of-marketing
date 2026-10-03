(function () {
  'use strict';

  var slider = document.querySelector('.latest-news-slider');
  var track = document.querySelector('.latest-news-track');
  var cards = track ? Array.prototype.slice.call(track.querySelectorAll('.latest-news-card')) : [];
  var previousButton = document.querySelector('.latest-news-prev');
  var nextButton = document.querySelector('.latest-news-next');
  var pagination = document.querySelector('.latest-news-pagination');

  if (!slider || !track || !cards.length || !previousButton || !nextButton || !pagination) return;

  var currentIndex = 0;
  var resizeTimer;
  var touchStartX = 0;

  function getCardsPerView() {
    if (window.innerWidth <= 767) return 1;
    if (window.innerWidth <= 991) return 2;
    return 3;
  }

  function getTotalSlides() {
    return Math.max(1, cards.length - getCardsPerView() + 1);
  }

  function updatePagination() {
    Array.prototype.forEach.call(pagination.querySelectorAll('.latest-news-dot'), function (dot, index) {
      var active = index === currentIndex;
      dot.classList.toggle('active', active);
      dot.setAttribute('aria-current', active ? 'page' : 'false');
    });
  }

  function updateButtons() {
    var lastIndex = getTotalSlides() - 1;
    previousButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex >= lastIndex;
  }

  function updateSlider() {
    var cardWidth = cards[0].getBoundingClientRect().width;
    var gap = parseFloat(window.getComputedStyle(track).gap) || 0;
    var distance = (cardWidth + gap) * currentIndex;
    track.style.transform = 'translateX(-' + distance + 'px)';
    updateButtons();
    updatePagination();
  }

  function createPagination() {
    pagination.replaceChildren();

    for (var index = 0; index < getTotalSlides(); index++) {
      var dot = document.createElement('button');
      dot.className = 'latest-news-dot';
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Go to slide ' + (index + 1));
      dot.addEventListener('click', function () {
        currentIndex = Number(this.dataset.slideIndex);
        updateSlider();
      });
      dot.dataset.slideIndex = String(index);
      pagination.appendChild(dot);
    }

    updatePagination();
  }

  previousButton.addEventListener('click', function () {
    if (currentIndex === 0) return;
    currentIndex--;
    updateSlider();
  });

  nextButton.addEventListener('click', function () {
    if (currentIndex >= getTotalSlides() - 1) return;
    currentIndex++;
    updateSlider();
  });

  window.addEventListener('resize', function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      currentIndex = Math.min(currentIndex, getTotalSlides() - 1);
      createPagination();
      updateSlider();
    }, 150);
  });

  slider.addEventListener('touchstart', function (event) {
    touchStartX = event.changedTouches[0].screenX;
  }, { passive: true });

  slider.addEventListener('touchend', function (event) {
    var swipeDistance = touchStartX - event.changedTouches[0].screenX;
    if (Math.abs(swipeDistance) < 50) return;
    if (swipeDistance > 0) nextButton.click();
    else previousButton.click();
  }, { passive: true });

  slider.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowRight') nextButton.click();
    if (event.key === 'ArrowLeft') previousButton.click();
  });

  createPagination();
  updateSlider();
}());
