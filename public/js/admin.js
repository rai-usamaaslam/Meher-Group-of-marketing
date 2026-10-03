(function () {
  'use strict';
  document.querySelectorAll('form[data-confirm]').forEach(function (form) { form.addEventListener('submit', function (event) { if (!window.confirm(form.dataset.confirm)) event.preventDefault(); }); });

  var input = document.querySelector('[data-gallery-input]');
  var preview = document.querySelector('[data-gallery-preview]');
  if (!input || !preview) return;

  function render() {
    preview.replaceChildren();
    var files = Array.prototype.slice.call(input.files || []);
    if (files.length > 5) {
      input.value = '';
      preview.textContent = 'Select no more than five gallery images.';
      return;
    }
    files.forEach(function (file) {
      var item = document.createElement('div');
      item.className = 'gallery-preview-item';
      var image = document.createElement('img');
      image.src = URL.createObjectURL(file);
      image.alt = 'Selected gallery image preview';
      image.onload = function () { URL.revokeObjectURL(image.src); };
      var remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Remove';
      remove.addEventListener('click', function () {
        var transfer = new DataTransfer();
        Array.prototype.slice.call(input.files).forEach(function (selected, selectedIndex) { if (selectedIndex !== files.indexOf(file)) transfer.items.add(selected); });
        input.files = transfer.files;
        render();
      });
      item.appendChild(image);
      item.appendChild(remove);
      preview.appendChild(item);
    });
  }
  input.addEventListener('change', render);
}());
