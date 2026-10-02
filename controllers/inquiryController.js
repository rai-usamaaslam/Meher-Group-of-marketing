const Inquiry = require('../models/Inquiry');

const subjects = ['Buying a Property', 'Renting a Property', 'Selling a Property', 'Project Information', 'Investment Inquiry', 'General Question'];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+\d][\d\s().-]{6,}$/;

function validate(body) {
  const values = {
    name: (body.name || '').trim(), email: (body.email || '').trim().toLowerCase(),
    phone: (body.phone || '').trim(), subject: (body.subject || '').trim(), message: (body.message || '').trim()
  };
  const errors = {};
  if (values.name.length < 2) errors.name = 'Please enter your full name.';
  if (!emailPattern.test(values.email)) errors.email = 'Please enter a valid email address.';
  if (!phonePattern.test(values.phone)) errors.phone = 'Please enter a valid phone number.';
  if (!subjects.includes(values.subject)) errors.subject = 'Please select an inquiry type.';
  if (values.message.length < 10) errors.message = 'Please enter a message of at least 10 characters.';
  return { values, errors };
}

async function submitInquiry(req, res, next) {
  try {
    const { values, errors } = validate(req.body);
    if (Object.keys(errors).length) return res.status(422).json({ ok: false, errors });
    await Inquiry.create(values);
    return res.status(201).json({ ok: true, message: 'Thanks — your message has been received. We’ll be in touch soon.' });
  } catch (error) { return next(error); }
}

async function listInquiries(req, res, next) {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 }).lean();
    return res.render('admin/inquiries', { title: 'Inquiries | MGM Admin', page: 'inquiries', inquiries });
  } catch (error) { return next(error); }
}

async function inquiryDetails(req, res, next) {
  try {
    const inquiry = await Inquiry.findById(req.params.id).lean();
    if (!inquiry) return res.status(404).render('error', { message: 'This inquiry could not be found.', error: {} });
    return res.render('admin/inquiry-details', { title: 'Inquiry | MGM Admin', page: 'inquiries', inquiry });
  } catch (error) { return next(error); }
}

async function updateInquiry(req, res, next) {
  try {
    const status = req.body.status;
    if (!['New', 'Contacted', 'Closed'].includes(status)) throw new Error('Invalid inquiry status.');
    await Inquiry.findByIdAndUpdate(req.params.id, { status });
    req.session.flash = { type: 'success', text: 'Inquiry status updated.' };
    return res.redirect(`/admin/inquiries/${req.params.id}`);
  } catch (error) { return next(error); }
}

async function deleteInquiry(req, res, next) {
  try {
    await Inquiry.findByIdAndDelete(req.params.id);
    req.session.flash = { type: 'success', text: 'Inquiry deleted.' };
    return res.redirect('/admin/inquiries');
  } catch (error) { return next(error); }
}

module.exports = { subjects, submitInquiry, listInquiries, inquiryDetails, updateInquiry, deleteInquiry };
