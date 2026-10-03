const Project = require('../models/Project');
const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');

const categoryLabels = {
  ongoing: 'Ongoing Projects',
  rental: 'Properties for Rent',
  completed: 'Completed Projects',
  sale: 'Properties for Sale',
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
    location: string(body.location),
    propertyType: string(body.propertyType), bedrooms: number(body.bedrooms), bathrooms: number(body.bathrooms),
    area: number(body.area), areaUnit: string(body.areaUnit) || 'sq ft', features: list(body.features),
  };
}

function uploadedPaths(files, name) {
  return (files && files[name] ? files[name] : []).map((file) => `/uploads/${file.filename}`);
}

async function ensureUniqueSlug(slug, currentProjectId) {
  const filter = { slug };
  if (currentProjectId) filter._id = { $ne: currentProjectId };
  if (await Project.exists(filter)) {
    const error = new Error('That project URL slug is already in use.');
    error.code = 11000;
    throw error;
  }
}

async function optimizeImages(files) {
  const allFiles = Object.values(files || {}).flat();
  await Promise.all(allFiles.map(async (file) => {
    const outputName = `${path.parse(file.filename).name}.webp`;
    const outputPath = path.join(path.dirname(file.path), outputName);
    await sharp(file.path).rotate().resize({ width: 2000, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toFile(outputPath);
    await fs.unlink(file.path);
    file.filename = outputName;
    file.path = outputPath;
  }));
}

function removeGalleryPaths(project, values) {
  const requested = Array.isArray(values) ? values : [values];
  return project.gallery.filter((image) => image && !requested.includes(image));
}

async function publicProjectDetails(req, res, next) {
  try {
    const project = await Project.findOne({ slug: req.params.slug, isActive: true }).lean();
    if (!project) return res.status(404).render('error', { message: 'This project could not be found.', error: {} });
    return res.render('projects/details', { title: `${project.title} | MGM Islamabad`, page: 'projects', project, categoryLabels, description: project.shortDescription });
  } catch (error) { return next(error); }
}

async function createProject(req, res, next) {
  try {
    const projectData = cleanProjectInput(req.body);
    await ensureUniqueSlug(projectData.slug);
    await optimizeImages(req.files);
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
    const projectData = cleanProjectInput(req.body);
    await ensureUniqueSlug(projectData.slug, project._id);
    await optimizeImages(req.files);
    Object.assign(project, projectData);
    const featured = uploadedPaths(req.files, 'featuredImage');
    const gallery = uploadedPaths(req.files, 'gallery');
    if (featured[0]) project.featuredImage = featured[0];
    else if ((req.body.featuredImageUrl || '').trim()) project.featuredImage = req.body.featuredImageUrl.trim();
    const retainedGallery = removeGalleryPaths(project, req.body.removeGallery);
    if (retainedGallery.length + gallery.length > 5) throw new Error('A project can have up to five gallery images.');
    project.gallery = retainedGallery.concat(gallery);
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

module.exports = { categoryLabels, publicProjectDetails, cleanProjectInput, ensureUniqueSlug, createProject, updateProject, deleteProject, toggleProject };
