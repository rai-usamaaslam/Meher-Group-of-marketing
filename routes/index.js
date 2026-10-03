const express = require('express');
const Project = require('../models/Project');
const Announcement = require('../models/Announcement');
const Testimonial = require('../models/Testimonial');
const { categoryLabels, publicProjectDetails } = require('../controllers/projectController');
const { submitInquiry, subjects } = require('../controllers/inquiryController');
const router = express.Router();

function sharedContent() {
  return {
    stats: [
      { number: 'Clear', label: 'Property information' },
      { number: 'Local', label: 'Market understanding' },
      { number: 'Human', label: 'Guidance at every step' },
      { number: 'Open', label: 'Communication' }
    ],
    services: [
      { number: '01', title: 'Buying & Property Guidance', description: 'We help you understand your options and find properties that match your needs.', image: 'photo-1560520653-9e0e4c89eb11', alt: 'Property advisor helping clients explore a home' },
      { number: '02', title: 'Property Marketing', description: 'We help property owners and developers reach the right audience.', image: 'photo-1600585154340-be6161a56a0c', alt: 'Welcoming family home with a garden' },
      { number: '03', title: 'Project Marketing', description: 'We build awareness and interest around real-estate developments.', image: 'photo-1497366754035-f200968a6e72', alt: 'Light-filled space ready to welcome its next occupants' },
      { number: '04', title: 'Investment Opportunities', description: 'We help clients explore property opportunities with clear information.', image: 'photo-1564013799919-ab600027ffc6', alt: 'Modern home in a leafy neighborhood' }
    ],
    inquirySubjects: subjects
  };
}

router.get('/', async (req, res, next) => {
  try {
    const [projects, announcements, testimonials] = await Promise.all([
      Project.find({ isActive: true }).sort({ isFeatured: -1, createdAt: -1 }).lean(),
      Announcement.find({ active: true }).sort({ startDate: -1, createdAt: -1 }).limit(6).lean(),
      Testimonial.find({ isActive: true }).sort({ date: -1 }).lean()
    ]);
    return res.render('home', Object.assign({
      title: 'MGM | Meher Group of Marketing', page: 'home', projects, announcements, testimonials, categoryLabels
    }, sharedContent()));
  } catch (error) { return next(error); }
});

router.get('/about', (req, res) => res.render('about', Object.assign({
  title: 'About MGM | Meher Group of Marketing', page: 'about'
}, sharedContent())));

router.get('/services', (req, res) => res.render('services', Object.assign({
  title: 'Services | Meher Group of Marketing', page: 'services'
}, sharedContent())));

router.get('/contact', (req, res) => res.render('contact', {
  title: 'Contact MGM | Meher Group of Marketing', page: 'contact', inquirySubjects: subjects
}));

router.post('/contact', submitInquiry);
router.get('/announcements', async (req, res, next) => {
  try {
    const announcements = await Announcement.find({ active: true }).sort({ startDate: -1, createdAt: -1 }).lean();
    return res.render('announcements', { title: 'Announcements | MGM', page: 'announcements', announcements });
  } catch (error) { return next(error); }
});
router.get('/announcements/:slug', async (req, res, next) => {
  try {
    const announcement = await Announcement.findOne({ slug: req.params.slug, active: true }).lean();
    if (!announcement) return res.status(404).render('error', { message: 'This announcement could not be found.', error: {} });
    return res.render('announcement-details', {
      title: `${announcement.title} | MGM`,
      page: 'announcements',
      announcement
    });
  } catch (error) { return next(error); }
});
router.get('/projects', async (req, res, next) => {
  try {
    const projects = await Project.find({ isActive: true }).sort({ isFeatured: -1, createdAt: -1 }).lean();
    const projectGroups = {
      ongoing: projects.filter((project) => project.category === 'ongoing'),
      completed: projects.filter((project) => project.category === 'completed'),
      sale: projects.filter((project) => ['sale', 'commercial', 'other'].includes(project.category)),
      rental: projects.filter((project) => project.category === 'rental')
    };
    return res.render('projects/index', { title: 'Projects | MGM', page: 'projects', projectGroups, categoryLabels });
  } catch (error) { return next(error); }
});
router.get('/projects/:slug', publicProjectDetails);

module.exports = router;
