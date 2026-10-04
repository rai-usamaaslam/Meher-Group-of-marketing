(function () {
  'use strict';

  var form = document.getElementById('contact-form');

  if (!form) return;

  var fields = {
    name: {
      input: form.elements.name,
      message: 'Please enter your full name.'
    },
    email: {
      input: form.elements.email,
      message: 'Please enter a valid email address.'
    },
    phone: {
      input: form.elements.phone,
      message: 'Please enter a valid phone number.'
    },
    subject: {
      input: form.elements.subject,
      message: 'Please choose what you need help with.'
    },
    message: {
      input: form.elements.message,
      message: 'Please enter a message.'
    }
  };

  function validate(name) {
    var field = fields[name];

    if (!field || !field.input) {
      return true;
    }

    var input = field.input;
    var value = input.value.trim();
    var valid = value.length > 0;

    if (name === 'name') {
      valid = value.length >= 2;
    }

    if (name === 'email') {
      valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    if (name === 'phone') {
      valid = /^[+\d][\d\s().-]{6,}$/.test(value);
    }

    if (name === 'subject') {
      valid = value.length > 0;
    }

    if (name === 'message') {
      valid = value.length > 0;
    }

    input.setAttribute('aria-invalid', String(!valid));

    var error = form.querySelector(
      '[data-error="' + name + '"]'
    );

    if (error) {
      error.textContent = valid ? '' : field.message;
    }

    return valid;
  }

  Object.keys(fields).forEach(function (name) {
    var input = fields[name].input;

    if (!input) return;

    input.addEventListener('blur', function () {
      validate(name);
    });

    input.addEventListener('input', function () {
      if (input.getAttribute('aria-invalid') === 'true') {
        validate(name);
      }
    });
  });

  form.addEventListener('submit', function (event) {
    var valid = Object.keys(fields)
      .map(function (name) {
        return validate(name);
      })
      .every(Boolean);

    var status = form.querySelector('.form-status');

    if (!valid) {
      event.preventDefault();

      if (status) {
        status.textContent =
          'Please correct the highlighted fields and try again.';
        status.classList.add('is-error');
      }

      var firstInvalid = form.querySelector(
        '[aria-invalid="true"]'
      );

      if (firstInvalid) {
        firstInvalid.focus();
      }

      return;
    }

    if (status) {
      status.classList.remove('is-error');
      status.textContent = 'Sending your message…';
    }

    var button = form.querySelector(
      'button[type="submit"]'
    );

    if (button) {
      button.disabled = true;

      var label = button.querySelector('.submit-label');

      if (label) {
        label.textContent = 'Sending…';
      }
    }
  });

  Object.keys(fields).forEach(function (name) {
    var input = fields[name].input;

    if (!input) return;

    input.setAttribute('aria-invalid', 'false');
  });

}());