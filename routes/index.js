const express = require('express');
const Project = require('../models/Project');
const Announcement = require('../models/Announcement');
const { categoryLabels, publicProjectDetails } = require('../controllers/projectController');
const { submitInquiry, subjects } = require('../controllers/inquiryController');
const router = express.Router();

function sharedContent() {
  return {
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
    const announcements = await Announcement.find().sort({ startDate: -1, createdAt: -1 }).limit(6).lean();
    return res.render('home', Object.assign({
      title: 'MGM | Real Estate Projects & Properties in Islamabad',
      page: 'home',
      announcements,
      description: 'MGM offers trusted real estate guidance, projects, properties for sale, and rental opportunities in Islamabad, Pakistan.'
    }, sharedContent()));
  } catch (error) { return next(error); }
});

router.get('/about', (req, res) => res.render('about', Object.assign({
  title: 'About MGM | Islamabad Real Estate Guidance', page: 'about',
  description: 'Learn about MGM, an Islamabad-based real estate company focused on clear property guidance and long-term client relationships.'
}, sharedContent())));

router.get('/services', (req, res) => res.render('services', Object.assign({
  title: 'Real Estate Services in Islamabad | MGM', page: 'services',
  description: 'Explore MGM real estate guidance, property marketing, project marketing, and investment support in Islamabad, Pakistan.'
}, sharedContent())));

router.get('/contact', (req, res) => res.render('contact', {
  title: 'Contact MGM | Real Estate in Islamabad', page: 'contact', inquirySubjects: subjects,
  description: 'Contact MGM in Islamabad for real estate projects, properties, rentals, and property guidance.'
}));

router.post('/contact', submitInquiry);
router.get('/announcements', async (req, res, next) => {
  try {
    const announcements = await Announcement.find().sort({ startDate: -1, createdAt: -1 }).lean();
    return res.render('announcements', { title: 'Real Estate News & Updates | MGM Islamabad', page: 'announcements', announcements, description: 'Read MGM announcements, project updates, and real estate news from Islamabad, Pakistan.' });
  } catch (error) { return next(error); }
});
router.get('/announcements/:slug', async (req, res, next) => {
  try {
    const announcement = await Announcement.findOne({ slug: req.params.slug }).lean();
    if (!announcement) return res.status(404).render('error', { message: 'This announcement could not be found.', error: {} });
    return res.render('announcement-details', {
      title: `${announcement.title} | MGM`,
      page: 'announcements',
      announcement,
      description: announcement.description.slice(0, 160)
    });
  } catch (error) { return next(error); }
});
router.get('/projects', async (req, res, next) => {
  try {
    const projects = await Project.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    const projectGroups = {
      ongoing: projects.filter((project) => project.category === 'ongoing'),
      completed: projects.filter((project) => project.category === 'completed'),
      sale: projects.filter((project) => ['sale', 'commercial', 'other'].includes(project.category)),
      rental: projects.filter((project) => project.category === 'rental')
    };
    return res.render('projects/index', { title: 'Real Estate Projects & Properties in Islamabad | MGM', page: 'projects', projectGroups, categoryLabels, description: 'Explore MGM ongoing and completed real estate projects, properties for sale, and properties for rent in Islamabad.' });
  } catch (error) { return next(error); }
});
router.get('/projects/:slug', publicProjectDetails);

router.get('/sitemap.xml', async (req, res, next) => {
  try {
    const baseUrl = res.locals.siteUrl.replace(/\/$/, '');
    const [projects, announcements] = await Promise.all([
      Project.find({ isActive: true }).select('slug updatedAt').lean(),
      Announcement.find().select('slug updatedAt').lean()
    ]);
    const staticPaths = ['/', '/about', '/services', '/contact', '/projects', '/announcements'];
    const urls = staticPaths.map((pathname) => ({ loc: `${baseUrl}${pathname}` }))
      .concat(projects.map((project) => ({ loc: `${baseUrl}/projects/${project.slug}`, lastmod: project.updatedAt })))
      .concat(announcements.map((announcement) => ({ loc: `${baseUrl}/announcements/${announcement.slug}`, lastmod: announcement.updatedAt })));
    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>${url.loc}</loc>${url.lastmod ? `<lastmod>${new Date(url.lastmod).toISOString()}</lastmod>` : ''}</url>`).join('')}</urlset>`);
  } catch (error) { next(error); }
});

module.exports = router;
