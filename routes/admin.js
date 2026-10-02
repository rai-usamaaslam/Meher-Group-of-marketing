const crypto = require('crypto');
const express = require('express');
const multer = require('multer');
const path = require('path');
const admin = require('../controllers/adminController');
const project = require('../controllers/projectController');
const inquiry = require('../controllers/inquiryController');
const announcement = require('../controllers/announcementController');
const testimonial = require('../controllers/testimonialController');
const { requireAdmin, redirectIfAuthenticated } = require('../middleware/auth');

const router = express.Router();
const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'public', 'uploads'),
  filename: (req, file, callback) => callback(null, `${Date.now()}-${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 9 },
  fileFilter: (req, file, callback) => {
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) return callback(new Error('Only JPEG, PNG, WebP, and GIF image files are allowed.'));
    return callback(null, true);
  }
});
const projectUpload = upload.fields([{ name: 'featuredImage', maxCount: 1 }, { name: 'gallery', maxCount: 8 }]);
const announcementUpload = upload.single('image');
const testimonialUpload = upload.single('image');

router.get('/login', redirectIfAuthenticated, admin.loginForm);
router.post('/login', redirectIfAuthenticated, admin.login);
router.post('/setup', redirectIfAuthenticated, admin.setup);
router.post('/logout', requireAdmin, admin.logout);
router.get('/settings', requireAdmin, admin.settingsForm);
router.post('/settings/username', requireAdmin, admin.updateUsername);
router.post('/settings/password', requireAdmin, admin.updatePassword);

router.get('/', requireAdmin, admin.dashboard);
router.get('/projects', requireAdmin, admin.listProjects);
router.get('/projects/create', requireAdmin, admin.createProjectForm);
router.post('/projects/create', requireAdmin, projectUpload, project.createProject);
router.get('/projects/edit/:id', requireAdmin, admin.editProjectForm);
router.post('/projects/edit/:id', requireAdmin, projectUpload, project.updateProject);
router.post('/projects/delete/:id', requireAdmin, project.deleteProject);
router.post('/projects/toggle/:id', requireAdmin, project.toggleProject);

router.get('/announcements', requireAdmin, announcement.listAnnouncements);
router.get('/announcements/create', requireAdmin, announcement.createForm);
router.post('/announcements/create', requireAdmin, announcementUpload, announcement.create);
router.get('/announcements/edit/:id', requireAdmin, announcement.editForm);
router.post('/announcements/edit/:id', requireAdmin, announcementUpload, announcement.update);
router.post('/announcements/delete/:id', requireAdmin, announcement.remove);
router.post('/announcements/toggle/:id', requireAdmin, announcement.toggle);

router.get('/testimonials', requireAdmin, testimonial.list);
router.get('/testimonials/create', requireAdmin, testimonial.createForm);
router.post('/testimonials/create', requireAdmin, testimonialUpload, testimonial.create);
router.get('/testimonials/edit/:id', requireAdmin, testimonial.editForm);
router.post('/testimonials/edit/:id', requireAdmin, testimonialUpload, testimonial.update);
router.post('/testimonials/delete/:id', requireAdmin, testimonial.remove);
router.post('/testimonials/toggle/:id', requireAdmin, testimonial.toggle);

router.get('/inquiries', requireAdmin, inquiry.listInquiries);
router.get('/inquiries/:id', requireAdmin, inquiry.inquiryDetails);
router.post('/inquiries/:id/status', requireAdmin, inquiry.updateInquiry);
router.post('/inquiries/:id/delete', requireAdmin, inquiry.deleteInquiry);

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError || error.message === 'Only JPEG, PNG, WebP, and GIF image files are allowed.') {
    req.session.formError = error.code === 'LIMIT_FILE_SIZE' ? 'Images must be 5MB or smaller.' : 'Please upload valid image files.';
    return res.redirect(req.get('referer') || '/admin/projects');
  }
  return next(error);
});

module.exports = router;
