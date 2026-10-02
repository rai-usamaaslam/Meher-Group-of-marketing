(function () {
  'use strict';

  var header = document.getElementById('site-header');
  var menuButton = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');
  var projectsDropdown = document.querySelector('.nav-dropdown');
  var projectsToggle = document.querySelector('.nav-dropdown-toggle');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function updateHeader() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuButton && nav) {
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
  }

  var revealItems = document.querySelectorAll('.reveal');
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

  var statsSection = document.querySelector('.stats-section');
  var statsStarted = false;
  function animateStats() {
    if (statsStarted || !statsSection) return;
    statsStarted = true;
    statsSection.querySelectorAll('[data-count]').forEach(function (el) {
      var original = el.getAttribute('data-count');
      var numeric = parseFloat(original.replace(/[^\d.]/g, ''));
      var suffix = original.replace(/[\d.]/g, '');
      if (!Number.isFinite(numeric)) return;
      if (reducedMotion) { el.textContent = original; return; }
      var start = performance.now();
      var duration = 1200;
      function frame(now) {
        var progress = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = Math.round(numeric * eased);
        el.textContent = value.toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  }
  if ('IntersectionObserver' in window && statsSection) {
    var statsObserver = new IntersectionObserver(function (entries) {
      if (entries.some(function (entry) { return entry.isIntersecting; })) {
        animateStats();
        statsObserver.disconnect();
      }
    }, { threshold: 0.25 });
    statsObserver.observe(statsSection);
  } else animateStats();

  document.querySelectorAll('[data-scroll-carousel]').forEach(function (button) {
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

  var slides = Array.prototype.slice.call(document.querySelectorAll('.testimonial-slide'));
  var count = document.querySelector('.carousel-count b');
  var slideIndex = 0;
  function showSlide(index) {
    if (!slides.length) return;
    slideIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === slideIndex);
      slide.setAttribute('aria-hidden', String(i !== slideIndex));
    });
    if (count) count.textContent = String(slideIndex + 1).padStart(2, '0');
  }
  document.querySelectorAll('[data-carousel]').forEach(function (button) {
    button.addEventListener('click', function () { showSlide(slideIndex + (button.dataset.carousel === 'next' ? 1 : -1)); });
  });

  var form = document.getElementById('contact-form');
  if (form) {
    var fields = {
      name: { input: form.elements.name, message: 'Please enter your full name.' },
      email: { input: form.elements.email, message: 'Please enter a valid email address.' },
      phone: { input: form.elements.phone, message: 'Please enter a valid phone number.' },
      subject: { input: form.elements.subject, message: 'Please choose what you need help with.' },
      message: { input: form.elements.message, message: 'Please enter a message of at least 10 characters.' }
    };
    function validate(name) {
      var field = fields[name];
      var value = field.input.value.trim();
      var valid = value.length > 0;
      if (name === 'name') valid = value.length >= 2;
      if (name === 'email') valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (name === 'phone') valid = /^[+\d][\d\s().-]{6,}$/.test(value);
      if (name === 'subject') valid = value.length > 0;
      if (name === 'message') valid = value.length >= 10;
      field.input.setAttribute('aria-invalid', String(!valid));
      var error = form.querySelector('[data-error="' + name + '"]');
      if (error) error.textContent = valid ? '' : field.message;
      return valid;
    }
    Object.keys(fields).forEach(function (name) {
      fields[name].input.addEventListener('blur', function () { validate(name); });
      fields[name].input.addEventListener('input', function () {
        if (fields[name].input.getAttribute('aria-invalid') === 'true') validate(name);
      });
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var valid = Object.keys(fields).map(validate).every(Boolean);
      var status = form.querySelector('.form-status');
      if (!valid) {
        status.textContent = 'Please correct the highlighted fields and try again.';
        status.classList.add('is-error');
        var firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      var button = form.querySelector('button[type="submit"]');
      var label = button.querySelector('.submit-label');
      button.disabled = true;
      label.textContent = 'Sending…';
      status.classList.remove('is-error');
      status.textContent = 'Sending your message…';
      window.fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (response) { return response.json().then(function (data) { return { response: response, data: data }; }); })
        .then(function (result) {
          if (!result.response.ok) {
            Object.keys(result.data.errors || {}).forEach(function (name) {
              if (fields[name]) {
                fields[name].input.setAttribute('aria-invalid', 'true');
                var fieldError = form.querySelector('[data-error="' + name + '"]');
                if (fieldError) fieldError.textContent = result.data.errors[name];
              }
            });
            throw new Error(result.data.message || 'Please check your details and try again.');
          }
          form.reset();
          Object.keys(fields).forEach(function (name) { fields[name].input.setAttribute('aria-invalid', 'false'); });
          status.textContent = result.data.message;
        })
        .catch(function (error) {
          status.textContent = error.message || 'We could not send your message. Please try again.';
          status.classList.add('is-error');
        })
        .then(function () { label.textContent = 'Send Message'; button.disabled = false; });
    });
  }

  var projectFilters = document.querySelectorAll('[data-project-filter]');
  var projectCards = document.querySelectorAll('[data-project-category]');
  var emptyProjects = document.querySelector('.project-empty:not(.is-static)');
  projectFilters.forEach(function (filter) {
    filter.addEventListener('click', function () {
      var category = filter.dataset.projectFilter;
      var shown = 0;
      projectFilters.forEach(function (item) { item.classList.toggle('is-active', item === filter); });
      projectCards.forEach(function (card) {
        var matches = category === 'all' || card.dataset.projectCategory === category;
        card.hidden = !matches;
        if (matches) shown += 1;
      });
      if (emptyProjects) emptyProjects.hidden = shown > 0;
    });
  });
}());
