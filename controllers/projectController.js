const Project = require('../models/Project');

const categoryLabels = {
  ongoing: 'Ongoing Projects',
  rental: 'For Rent',
  completed: 'Completed',
  sale: 'For Sale',
  commercial: 'Commercial',
  other: 'Other'
};

function cleanProjectInput(body) {
  const string = (value) => (value || '').trim();
  const number = (value) => value === '' || value === undefined ? undefined : Number(value);
  const list = (value) => string(value).split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
  const slug = string(body.slug) || string(body.title).toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return {
    title: string(body.title), slug, category: string(body.category), status: string(body.status),
    shortDescription: string(body.shortDescription), description: string(body.description),
    location: string(body.location), price: string(body.price), priceLabel: string(body.priceLabel),
    propertyType: string(body.propertyType), bedrooms: number(body.bedrooms), bathrooms: number(body.bathrooms),
    area: number(body.area), areaUnit: string(body.areaUnit) || 'sq ft', features: list(body.features),
    contactPhone: string(body.contactPhone), contactEmail: string(body.contactEmail),
    isFeatured: body.isFeatured === 'on', isActive: body.isActive === 'on'
  };
}

function uploadedPaths(files, name) {
  return (files && files[name] ? files[name] : []).map((file) => `/uploads/${file.filename}`);
}

async function publicProjectDetails(req, res, next) {
  try {
    const project = await Project.findOne({ slug: req.params.slug, isActive: true }).lean();
    if (!project) return res.status(404).render('error', { message: 'This project could not be found.', error: {} });
    return res.render('projects/details', { title: `${project.title} | MGM`, page: 'projects', project, categoryLabels });
  } catch (error) { return next(error); }
}

async function createProject(req, res, next) {
  try {
    const projectData = cleanProjectInput(req.body);
    const featured = uploadedPaths(req.files, 'featuredImage');
    const gallery = uploadedPaths(req.files, 'gallery');
    projectData.featuredImage = featured[0] || (req.body.featuredImageUrl || '').trim();
    projectData.gallery = gallery;
    const project = await Project.create(projectData);
    req.session.flash = { type: 'success', text: `${project.title} has been added.` };
    return res.redirect('/admin/projects');
  } catch (error) {
    if (error && error.code === 11000) error.message = 'That project URL slug is already in use.';
    req.session.formError = error.message || 'Please check the project form and try again.';
    req.session.formData = req.body;
    return res.redirect('/admin/projects/create');
  }
}

async function updateProject(req, res, next) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).render('error', { message: 'This project could not be found.', error: {} });
    Object.assign(project, cleanProjectInput(req.body));
    const featured = uploadedPaths(req.files, 'featuredImage');
    const gallery = uploadedPaths(req.files, 'gallery');
    if (featured[0]) project.featuredImage = featured[0];
    else if ((req.body.featuredImageUrl || '').trim()) project.featuredImage = req.body.featuredImageUrl.trim();
    const removeGallery = Array.isArray(req.body.removeGallery) ? req.body.removeGallery : [req.body.removeGallery];
    project.gallery = project.gallery.filter((image) => image && !removeGallery.includes(image)).concat(gallery);
    await project.save();
    req.session.flash = { type: 'success', text: `${project.title} has been updated.` };
    return res.redirect('/admin/projects');
  } catch (error) {
    if (error && error.code === 11000) error.message = 'That project URL slug is already in use.';
    req.session.formError = error.message || 'Please check the project form and try again.';
    return res.redirect(`/admin/projects/edit/${req.params.id}`);
  }
}

async function deleteProject(req, res, next) {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    req.session.flash = { type: 'success', text: project ? `${project.title} was deleted.` : 'Project already removed.' };
    return res.redirect('/admin/projects');
  } catch (error) { return next(error); }
}

async function toggleProject(req, res, next) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).render('error', { message: 'This project could not be found.', error: {} });
    project.isActive = !project.isActive;
    await project.save();
    req.session.flash = { type: 'success', text: `${project.title} is now ${project.isActive ? 'active' : 'inactive'}.` };
    return res.redirect('/admin/projects');
  } catch (error) { return next(error); }
}

module.exports = { categoryLabels, publicProjectDetails, cleanProjectInput, createProject, updateProject, deleteProject, toggleProject };
