const express = require('express');
const Project = require('../models/Project');
const Announcement = require('../models/Announcement');
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
    testimonials: [
      { quote: 'The team made everything much easier to understand and were always available when we had questions.', name: 'Ahmed R.', detail: 'Property client' },
      { quote: 'The team listened carefully and helped us understand each step with confidence.', name: 'Client Name', detail: 'Investment client' },
      { quote: 'A thoughtful, responsive team that made a complex decision feel manageable.', name: 'Client Name', detail: 'Development partner' }
    ],
    inquirySubjects: subjects
  };
}

router.get('/', async (req, res, next) => {
  try {
    const [projects, announcements] = await Promise.all([
      Project.find({ isActive: true }).sort({ isFeatured: -1, createdAt: -1 }).lean(),
      Announcement.find({ active: true }).sort({ featured: -1, startDate: -1 }).limit(3).lean()
    ]);
    return res.render('index', Object.assign({
      title: 'MGM | Meher Group of Marketing', page: 'home', projects, announcements, categoryLabels
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
    const announcements = await Announcement.find({ active: true }).sort({ featured: -1, startDate: -1 }).lean();
    return res.render('announcements', { title: 'Announcements | MGM', page: 'announcements', announcements });
  } catch (error) { return next(error); }
});
router.get('/projects/:slug', publicProjectDetails);

module.exports = router;
