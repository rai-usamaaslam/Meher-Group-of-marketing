const Testimonial = require('../models/Testimonial');

function values(body) {
  const name = (body.name || '').trim();
  const message = (body.message || '').trim();
  const date = body.date ? new Date(body.date) : new Date();
  if (!name || !message || Number.isNaN(date.getTime())) {
    throw new Error('Enter a name, message, and valid date.');
  }
  return { name, message, date, isActive: body.isActive === 'on' };
}

function renderForm(req, res, editing, testimonial) {
  const formError = req.session.formError;
  const formData = req.session.formData;
  delete req.session.formError;
  delete req.session.formData;
  const formValues = Object.assign({}, testimonial, formData || {});
  if (formData) formValues.isActive = formData.isActive === 'on';
  return res.render('admin/testimonial-form', {
    title: `${editing ? 'Edit' : 'Add'} Testimonial | MGM Admin`,
    page: 'testimonials',
    testimonial: formValues,
    editing,
    formError
  });
}

async function list(req, res, next) {
  try {
    const testimonials = await Testimonial.find().sort({ date: -1 }).lean();
    return res.render('admin/testimonials', {
      title: 'Testimonials | MGM Admin', page: 'testimonials', testimonials
    });
  } catch (error) { return next(error); }
}

function createForm(req, res) {
  return renderForm(req, res, false, { date: new Date(), isActive: true });
}

async function editForm(req, res, next) {
  try {
    const testimonial = await Testimonial.findById(req.params.id).lean();
    if (!testimonial) return res.status(404).render('error', { message: 'Testimonial not found.', error: {} });
    return renderForm(req, res, true, testimonial);
  } catch (error) { return next(error); }
}

async function create(req, res) {
  try {
    const testimonialData = values(req.body);
    testimonialData.image = req.file ? `/uploads/${req.file.filename}` : (req.body.imageUrl || '').trim();
    const testimonial = await Testimonial.create(testimonialData);
    req.session.flash = { type: 'success', text: `${testimonial.name}'s testimonial was added.` };
    return res.redirect('/admin/testimonials');
  } catch (error) {
    req.session.formError = error.message;
    req.session.formData = Object.assign({}, req.body);
    if (req.session.formData.date && Number.isNaN(new Date(req.session.formData.date).getTime())) {
      delete req.session.formData.date;
    }
    return res.redirect('/admin/testimonials/create');
  }
}

async function update(req, res, next) {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) return res.status(404).render('error', { message: 'Testimonial not found.', error: {} });
    Object.assign(testimonial, values(req.body));
    if (req.file) testimonial.image = `/uploads/${req.file.filename}`;
    else if ((req.body.imageUrl || '').trim()) testimonial.image = req.body.imageUrl.trim();
    else if (req.body.removeImage === 'on') testimonial.image = '';
    await testimonial.save();
    req.session.flash = { type: 'success', text: 'Testimonial updated.' };
    return res.redirect('/admin/testimonials');
  } catch (error) {
    req.session.formError = error.message;
    return res.redirect(`/admin/testimonials/edit/${req.params.id}`);
  }
}

async function remove(req, res, next) {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    req.session.flash = {
      type: 'success',
      text: testimonial ? 'Testimonial deleted.' : 'Testimonial already removed.'
    };
    return res.redirect('/admin/testimonials');
  } catch (error) { return next(error); }
}

async function toggle(req, res, next) {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) return res.status(404).render('error', { message: 'Testimonial not found.', error: {} });
    testimonial.isActive = !testimonial.isActive;
    await testimonial.save();
    req.session.flash = {
      type: 'success',
      text: `Testimonial ${testimonial.isActive ? 'published' : 'unpublished'}.`
    };
    return res.redirect('/admin/testimonials');
  } catch (error) { return next(error); }
}

module.exports = { list, createForm, editForm, create, update, remove, toggle };
