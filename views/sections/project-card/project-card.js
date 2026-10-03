(function () {
  'use strict';

  function announce(button, message) {
    var status = button.closest('.property-card').querySelector('[data-property-card-status]');
    if (status) status.textContent = message;
  }

  document.querySelectorAll('[data-project-favorite]').forEach(function (button) {
    button.addEventListener('click', function () {
      var isFavorite = button.getAttribute('aria-pressed') !== 'true';
      var title = button.dataset.projectTitle;
      button.setAttribute('aria-pressed', String(isFavorite));
      button.setAttribute('aria-label', (isFavorite ? 'Remove ' : 'Save ') + title + (isFavorite ? ' from' : ' to') + ' favorites');
      announce(button, isFavorite ? 'Added to favorites.' : 'Removed from favorites.');
    });
  });

  document.querySelectorAll('[data-project-share]').forEach(function (button) {
    button.addEventListener('click', async function () {
      var url = new URL(button.dataset.shareUrl, window.location.origin).href;
      var title = button.dataset.projectTitle;

      try {
        if (navigator.share) {
          await navigator.share({ title: title, url: url });
          announce(button, 'Project shared.');
        } else if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(url);
          announce(button, 'Project link copied to clipboard.');
        } else {
          announce(button, 'Sharing is not available in this browser.');
        }
      } catch (error) {
        if (error && error.name === 'AbortError') return;
        announce(button, 'The project link could not be shared. Please try again.');
      }
    });
  });
}());
