(function () {
  'use strict';

  var header = document.getElementById('site-header');
  var menuButton = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');
  var projectsDropdown = document.querySelector('.nav-dropdown');
  var projectsToggle = document.querySelector('.nav-dropdown-toggle');

  function updateHeader() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 24);
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (!menuButton || !nav || !header) return;

  function closeProjectsDropdown() {
    if (projectsToggle) projectsToggle.setAttribute('aria-expanded', 'false');
  }

  menuButton.addEventListener('click', function () {
    var isOpen = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    header.classList.toggle('menu-open', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
    if (!isOpen) closeProjectsDropdown();
  });

  if (projectsDropdown && projectsToggle) {
    projectsToggle.addEventListener('click', function () {
      var isOpen = projectsToggle.getAttribute('aria-expanded') !== 'true';
      projectsToggle.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', function (event) {
      if (!projectsDropdown.contains(event.target)) closeProjectsDropdown();
    });
  }

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      if (menuButton.getAttribute('aria-expanded') === 'true') {
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Open navigation');
        header.classList.remove('menu-open');
        document.body.classList.remove('menu-open');
      }
      closeProjectsDropdown();
    });
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeProjectsDropdown();
      if (menuButton.getAttribute('aria-expanded') === 'true') menuButton.click();
    }
  });
}());
