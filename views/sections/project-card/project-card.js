(function () {
  'use strict';

  function getFeedback(button) {
    var card = button.closest('.project-card');
    return card ? card.querySelector('[data-project-feedback]') : null;
  }

  function announce(button, message) {
    var feedback = getFeedback(button);
    if (feedback) feedback.textContent = message;
  }

  async function copyLink(url) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url);
      return;
    }

    var field = document.createElement('textarea');
    field.value = url;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();

    var copied;
    try {
      copied = document.execCommand('copy');
    } finally {
      document.body.removeChild(field);
    }
    if (!copied) throw new Error('Clipboard copy was not permitted.');
  }

  document.querySelectorAll('[data-project-favorite]').forEach(function (button) {
    button.addEventListener('click', function () {
      var isFavorite = button.getAttribute('aria-pressed') !== 'true';
      var title = button.dataset.projectTitle || 'Project';
      button.setAttribute('aria-pressed', String(isFavorite));
      button.setAttribute('aria-label', (isFavorite ? 'Remove ' : 'Add ') + title + (isFavorite ? ' from' : ' to') + ' favorites');
      button.classList.toggle('active', isFavorite);
      button.textContent = isFavorite ? '♥' : '♡';
      announce(button, isFavorite ? 'Added to favorites.' : 'Removed from favorites.');
    });
  });

  document.querySelectorAll('[data-project-share]').forEach(function (button) {
    button.addEventListener('click', async function () {
      var url = new URL(button.dataset.shareUrl, window.location.origin).href;
      var title = button.dataset.projectTitle || 'Project';

      try {
        if (navigator.share) {
          await navigator.share({ title: title, url: url });
          announce(button, 'Project shared.');
        } else {
          await copyLink(url);
          announce(button, 'Project link copied to clipboard.');
        }
      } catch (error) {
        if (error && error.name === 'AbortError') return;
        console.error('Unable to share project link.', error);
        announce(button, 'The project link could not be shared. Please try again.');
      }
    });
  });

  document.querySelectorAll('.projects-section').forEach(function (section) {
    var slider = section.querySelector('.projects-slider');
    var track = section.querySelector('.projects-track');
    var cards = track ? Array.prototype.slice.call(track.querySelectorAll('.project-card')) : [];
    var prevButton = section.querySelector('.projects-prev');
    var nextButton = section.querySelector('.projects-next');
    var pagination = section.querySelector('.projects-pagination');

    if (!slider || !track || cards.length === 0 || !pagination) return;

    var currentIndex = 0;
    var resizeTimer;

    function getCardsPerView() {
      if (window.innerWidth <= 767) return 1;
      if (window.innerWidth <= 991) return 2;
      return 3;
    }

    function getTotalSlides() {
      return Math.max(1, cards.length - getCardsPerView() + 1);
    }

    function updatePagination() {
      Array.prototype.forEach.call(pagination.querySelectorAll('.projects-dot'), function (dot, index) {
        var active = index === currentIndex;
        dot.classList.toggle('active', active);
        dot.setAttribute('aria-current', active ? 'true' : 'false');
      });
    }

    function updateSlider() {
      var cardWidth = cards[0].getBoundingClientRect().width;
      var gap = parseFloat(window.getComputedStyle(track).gap) || 0;
      track.style.transform = 'translateX(-' + ((cardWidth + gap) * currentIndex) + 'px)';

      if (prevButton) prevButton.disabled = currentIndex === 0;
      if (nextButton) nextButton.disabled = currentIndex >= getTotalSlides() - 1;
      updatePagination();
    }

    function createPagination() {
      pagination.innerHTML = '';

      for (var index = 0; index < getTotalSlides(); index++) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'projects-dot';
        dot.setAttribute('aria-label', 'Go to project slide ' + (index + 1));
        dot.addEventListener('click', function (event) {
          currentIndex = Number(event.currentTarget.getAttribute('data-slide-index'));
          updateSlider();
        });
        dot.setAttribute('data-slide-index', String(index));
        pagination.appendChild(dot);
      }

      updatePagination();
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        if (currentIndex < getTotalSlides() - 1) {
          currentIndex++;
          updateSlider();
        }
      });
    }

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        if (currentIndex > 0) {
          currentIndex--;
          updateSlider();
        }
      });
    }

    var touchStartX = 0;
    slider.addEventListener('touchstart', function (event) {
      touchStartX = event.changedTouches[0].screenX;
    }, { passive: true });

    slider.addEventListener('touchend', function (event) {
      var swipeDistance = touchStartX - event.changedTouches[0].screenX;
      if (Math.abs(swipeDistance) < 50) return;
      if (swipeDistance > 0 && nextButton) nextButton.click();
      if (swipeDistance < 0 && prevButton) prevButton.click();
    }, { passive: true });

    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        currentIndex = Math.min(currentIndex, getTotalSlides() - 1);
        createPagination();
        updateSlider();
      }, 150);
    });

    createPagination();
    updateSlider();
  });
}());
