const Project = require('../models/Project');
const Inquiry = require('../models/Inquiry');
const User = require('../models/User');
const Announcement = require('../models/Announcement');
const { categoryLabels } = require('./projectController');

async function dashboard(req, res, next) {
  try {
    const [total, active, ongoing, rental, announcementCount, newInquiries, recentInquiries] = await Promise.all([
      Project.countDocuments(), Project.countDocuments({ isActive: true }),
      Project.countDocuments({ category: 'ongoing' }), Project.countDocuments({ category: 'rental' }),
      Announcement.countDocuments({ active: true }), Inquiry.countDocuments({ status: 'New' }),
      Inquiry.find().sort({ createdAt: -1 }).limit(5).lean()
    ]);
    return res.render('admin/dashboard', {
      title: 'Dashboard | MGM Admin', page: 'dashboard',
      stats: { total, active, ongoing, rental, announcementCount, newInquiries }, recentInquiries
    });
  } catch (error) { return next(error); }
}

async function listProjects(req, res, next) {
  try {
    const projects = await Project.find().sort({ createdAt: -1 }).lean();
    return res.render('admin/projects', { title: 'Projects | MGM Admin', page: 'projects', projects, categoryLabels });
  } catch (error) { return next(error); }
}

function createProjectForm(req, res) {
  const formData = req.session.formData || { category: 'ongoing', status: 'Available', areaUnit: 'sq ft', isActive: 'on' };
  const formError = req.session.formError;
  delete req.session.formData;
  delete req.session.formError;
  return res.render('admin/project-form', { title: 'Add Project | MGM Admin', page: 'projects', project: formData, formError, editing: false, categoryLabels });
}

async function editProjectForm(req, res, next) {
  try {
    const project = await Project.findById(req.params.id).lean();
    if (!project) return res.status(404).render('error', { message: 'This project could not be found.', error: {} });
    const formError = req.session.formError;
    delete req.session.formError;
    return res.render('admin/project-form', { title: `Edit ${project.title} | MGM Admin`, page: 'projects', project, formError, editing: true, categoryLabels });
  } catch (error) { return next(error); }
}

async function loginForm(req, res, next) {
  try {
    const hasAdmin = await User.exists({});
    const error = req.session.authError;
    delete req.session.authError;
    return res.render('admin/login', { title: 'Admin Sign In | MGM', page: 'login', setup: !hasAdmin, error });
  } catch (error) { return next(error); }
}

async function login(req, res, next) {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.verifyPassword(password))) {
      req.session.authError = 'Email or password was not recognized.';
      return res.redirect('/admin/login');
    }
    const returnTo = req.session.returnTo || '/admin';
    return req.session.regenerate((error) => {
      if (error) return next(error);
      req.session.adminId = user.id;
      req.session.adminName = user.name;
      return res.redirect(returnTo);
    });
  } catch (error) { return next(error); }
}

async function setup(req, res, next) {
  try {
    const existingAdmin = await User.exists({});
    if (existingAdmin) return res.status(403).render('error', { message: 'Administrator setup is already complete.', error: {} });
    const name = (req.body.name || '').trim();
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';
    if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
      req.session.authError = 'Enter a name, a valid email, and a password of at least 8 characters.';
      return res.redirect('/admin/login');
    }
    const user = await User.create({ name, email, password });
    return req.session.regenerate((error) => {
      if (error) return next(error);
      req.session.adminId = user.id;
      req.session.adminName = user.name;
      return res.redirect('/admin');
    });
  } catch (error) {
    if (error.code === 11000) {
      req.session.authError = 'That email is already in use.';
      return res.redirect('/admin/login');
    }
    return next(error);
  }
}

function logout(req, res, next) {
  return req.session.destroy((error) => error ? next(error) : res.redirect('/admin/login'));
}
async function settingsForm(req, res, next) {
  try { const user = await User.findById(req.session.adminId).lean(); return res.render('admin/settings', { title: 'Account Settings | MGM Admin', page: 'settings', user }); } catch (error) { return next(error); }
}
async function updateUsername(req, res, next) {
  try {
    const name = (req.body.name || '').trim(); const email = (req.body.email || '').trim().toLowerCase();
    if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email)) throw new Error('Enter a name and a valid email address.');
    const user = await User.findById(req.session.adminId); user.name = name; user.email = email; await user.save();
    req.session.adminName = user.name; req.session.flash = { type: 'success', text: 'Account details updated.' }; return res.redirect('/admin/settings');
  } catch (error) { req.session.flash = { type: 'error', text: error.code === 11000 ? 'That email is already in use.' : error.message }; return res.redirect('/admin/settings'); }
}
async function updatePassword(req, res, next) {
  try {
    const currentPassword = req.body.currentPassword || '', password = req.body.password || '', confirmation = req.body.confirmation || '';
    const user = await User.findById(req.session.adminId).select('+password');
    if (!(await user.verifyPassword(currentPassword))) throw new Error('Current password is incorrect.');
    if (password.length < 8) throw new Error('New password must be at least 8 characters.');
    if (password !== confirmation) throw new Error('New password confirmation does not match.');
    user.password = password; await user.save(); req.session.flash = { type: 'success', text: 'Password changed securely.' }; return res.redirect('/admin/settings');
  } catch (error) { req.session.flash = { type: 'error', text: error.message }; return res.redirect('/admin/settings'); }
}

module.exports = { dashboard, listProjects, createProjectForm, editProjectForm, loginForm, login, setup, logout, settingsForm, updateUsername, updatePassword };
