const Announcement = require('../models/Announcement');

function values(body) {
  const text = (value) => (value || '').trim();
  const slug = text(body.slug) || text(body.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const image = text(body.imageUrl);
  if (!/^https?:\/\/.+/i.test(image)) throw new Error('Enter a valid image URL starting with http:// or https://.');
  return { title: text(body.title), slug, description: text(body.description), image, startDate: body.startDate || new Date() };
}
async function ensureUniqueSlug(slug, currentAnnouncementId) {
  const filter = { slug };
  if (currentAnnouncementId) filter._id = { $ne: currentAnnouncementId };
  if (await Announcement.exists(filter)) {
    const error = new Error('That announcement URL slug is already in use.');
    error.code = 11000;
    throw error;
  }
}
function form(req, res, editing, announcement) { const formError = req.session.formError; delete req.session.formError; return res.render('admin/announcement-form', { title: `${editing ? 'Edit' : 'Add'} Announcement | MGM Admin`, page: 'announcements', announcement: announcement || {}, editing, formError }); }
async function listAnnouncements(req, res, next) { try { const announcements = await Announcement.find().sort({ startDate: -1 }).lean(); return res.render('admin/announcements', { title: 'Announcements | MGM Admin', page: 'announcements', announcements }); } catch (error) { return next(error); } }
function createForm(req, res) { return form(req, res, false); }
async function editForm(req, res, next) { try { const announcement = await Announcement.findById(req.params.id).lean(); if (!announcement) return res.status(404).render('error', { message: 'Announcement not found.', error: {} }); return form(req, res, true, announcement); } catch (error) { return next(error); } }
async function create(req, res) { try { const announcementData = values(req.body); await ensureUniqueSlug(announcementData.slug); const announcement = await Announcement.create(announcementData); req.session.flash = { type: 'success', text: `${announcement.title} has been created.` }; return res.redirect('/admin/announcements'); } catch (error) { req.session.formError = error.code === 11000 ? 'That announcement URL slug is already in use.' : error.message; return res.redirect('/admin/announcements/create'); } }
async function update(req, res, next) { try { const announcement = await Announcement.findById(req.params.id); if (!announcement) return res.status(404).render('error', { message: 'Announcement not found.', error: {} }); const announcementData = values(req.body); await ensureUniqueSlug(announcementData.slug, announcement._id); Object.assign(announcement, announcementData); await announcement.save(); req.session.flash = { type: 'success', text: 'Announcement updated.' }; return res.redirect('/admin/announcements'); } catch (error) { req.session.formError = error.code === 11000 ? 'That announcement URL slug is already in use.' : error.message; return res.redirect(`/admin/announcements/edit/${req.params.id}`); } }
async function remove(req, res, next) { try { const announcement = await Announcement.findByIdAndDelete(req.params.id); req.session.flash = { type: 'success', text: announcement ? 'Announcement deleted.' : 'Announcement already removed.' }; return res.redirect('/admin/announcements'); } catch (error) { return next(error); } }
module.exports = { listAnnouncements, createForm, editForm, create, update, remove, ensureUniqueSlug };
