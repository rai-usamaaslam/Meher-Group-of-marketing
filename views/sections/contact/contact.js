(function () {
  'use strict';

  var form = document.getElementById('contact-form');
  if (!form) return;

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
      if (status) {
        status.textContent = 'Please correct the highlighted fields and try again.';
        status.classList.add('is-error');
      }
      var firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    var button = form.querySelector('button[type="submit"]');
    var label = button && button.querySelector('.submit-label');
    if (!button || !label || !status) return;

    button.disabled = true;
    label.textContent = 'Sending…';
    status.classList.remove('is-error');
    status.textContent = 'Sending your message…';

    window.fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    })
      .then(function (response) {
        return response.json().then(function (data) { return { response: response, data: data }; });
      })
      .then(function (result) {
        if (!result.response.ok) {
          Object.keys(result.data.errors || {}).forEach(function (name) {
            if (!fields[name]) return;
            fields[name].input.setAttribute('aria-invalid', 'true');
            var fieldError = form.querySelector('[data-error="' + name + '"]');
            if (fieldError) fieldError.textContent = result.data.errors[name];
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
      .then(function () {
        label.textContent = 'Send Message';
        button.disabled = false;
      });
  });
}());
