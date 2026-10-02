function requireAdmin(req, res, next) {
  if (req.session && req.session.adminId) return next();
  req.session.returnTo = req.originalUrl;
  req.session.flash = { type: 'error', text: 'Please sign in to access the dashboard.' };
  return res.redirect('/admin/login');
}

function redirectIfAuthenticated(req, res, next) {
  if (req.session && req.session.adminId) return res.redirect('/admin');
  return next();
}

module.exports = { requireAdmin, redirectIfAuthenticated };
