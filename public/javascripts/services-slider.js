(function () {
  var slides = Array.from(document.querySelectorAll('.service-slide'));
  var dots = document.querySelector('.slider-dots');
  if (!slides.length || !dots) return;
  var current = 0;
  slides.forEach(function (slide, index) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'slider-dot';
    button.setAttribute('aria-label', 'Show image ' + (index + 1));
    button.addEventListener('click', function () { show(index); });
    dots.appendChild(button);
  });
  var indicators = Array.from(dots.children);
  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
      slide.setAttribute('aria-hidden', String(i !== current));
      indicators[i].classList.toggle('is-active', i === current);
      indicators[i].setAttribute('aria-current', i === current ? 'true' : 'false');
    });
  }
  document.querySelectorAll('.slider-arrow').forEach(function (button) {
    button.addEventListener('click', function () { show(current + Number(button.dataset.direction)); });
  });
  show(0);
}());
