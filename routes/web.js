const express = require('express');
const router = express.Router();
const connectDB = require('../config/db');
const { ensureAuth, ensureGuest } = require('../middleware/auth');

const withDB = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (e) {
    console.error('DB:', e.message);
    res.status(503).send('Service temporarily unavailable');
  }
};

const pages = require('../controllers/pagesController');
const auth = require('../controllers/authController');
const dashboard = require('../controllers/dashboardController');
const postCtrl = require('../controllers/postController');
const categoryCtrl = require('../controllers/categoryController');
const galleryCtrl = require('../controllers/galleryController');
const galleryTagCtrl = require('../controllers/galleryTagController');
const testimonialCtrl = require('../controllers/testimonialController');
const roomCtrl = require('../controllers/roomController');
const roomInfoCtrl = require('../controllers/roomInfoController');
const staffCtrl = require('../controllers/staffController');
const staffCategoryCtrl = require('../controllers/staffCategoryController');
const siteSettingCtrl = require('../controllers/siteSettingController');

// ============================================
// PUBLIC ROUTES
// ============================================

// Static pages (no DB)
router.get('/about', pages.about);
router.get('/admission-criteria', pages.admission);
router.get('/facilities', pages.facilities);
router.get('/activities-and-events', pages.activities);
router.get('/principal-of-care', pages.principal);
router.get('/st-christophers', pages.st_christophers);
router.get('/staff-training', pages.staff_training);
router.get('/job-vacancy', pages.job_vacancy);
router.get('/privacy-policy', pages.privacy_policy);
router.get('/contact', pages.contact);
router.get('/sitemap', pages.sitemap);
router.get('/menu', withDB, pages.menu);

// Pages that need DB
router.get('/', withDB, pages.index);
router.get('/testimonial', withDB, pages.testimonial);
router.get('/cuisine', withDB, pages.cuisine);
router.get('/accommodation', withDB, pages.accommodation);
router.get('/bed-vacancies', withDB, pages.vacancy);
router.get('/team', withDB, pages.team);
router.get('/gallery', withDB, pages.gallery);
router.get('/gallery/:slug', withDB, pages.show_gallery);
router.get('/news', withDB, pages.blog);
router.get('/category-:postcategory', withDB, pages.postcategory);
router.get('/tag-:category/:slug', withDB, pages.show_post);
router.get('/projects', withDB, pages.room);
router.get('/room/:slug', withDB, pages.show_project);

// ============================================
// AUTH ROUTES
// ============================================
router.get('/login', ensureGuest, auth.showLogin);
router.post('/login', withDB, ensureGuest, auth.login);
router.get('/logout', auth.logout);

// ============================================
// ADMIN ROUTES (protected)
// ============================================

// Dashboard
router.get('/admin/dashboard', ensureAuth, withDB, dashboard.index);
router.get('/admin/profile', ensureAuth, withDB, dashboard.profile);
router.put('/admin/profile?_method=PUT', ensureAuth, withDB, dashboard.updateUser);

// Posts
router.get('/admin/posts', ensureAuth, withDB, postCtrl.index);
router.get('/admin/posts/create', ensureAuth, withDB, postCtrl.create);
router.post('/admin/posts', ensureAuth, withDB, postCtrl.store);
router.get('/admin/posts/:id/edit', ensureAuth, withDB, postCtrl.edit);
router.put('/admin/posts/:id', ensureAuth, withDB, postCtrl.update);
router.get('/admin/posts/:id/delete', ensureAuth, withDB, postCtrl.destroy);

// Categories
router.get('/admin/categories', ensureAuth, withDB, categoryCtrl.index);
router.get('/admin/categories/create', ensureAuth, withDB, categoryCtrl.create);
router.post('/admin/categories', ensureAuth, withDB, categoryCtrl.store);
router.get('/admin/categories/:id/edit', ensureAuth, withDB, categoryCtrl.edit);
router.put('/admin/categories/:id', ensureAuth, withDB, categoryCtrl.update);
router.get('/admin/categories/:id/delete', ensureAuth, withDB, categoryCtrl.destroy);

// Gallery Tags
router.get('/admin/gallery-tags', ensureAuth, withDB, galleryTagCtrl.index);
router.get('/admin/gallery-tags/create', ensureAuth, withDB, galleryTagCtrl.create);
router.post('/admin/gallery-tags', ensureAuth, withDB, galleryTagCtrl.store);
router.get('/admin/gallery-tags/:id/edit', ensureAuth, withDB, galleryTagCtrl.edit);
router.put('/admin/gallery-tags/:id', ensureAuth, withDB, galleryTagCtrl.update);
router.get('/admin/gallery-tags/:id/delete', ensureAuth, withDB, galleryTagCtrl.destroy);

// Gallery
router.get('/admin/galleries', ensureAuth, withDB, galleryCtrl.index);
router.get('/admin/galleries/create', ensureAuth, withDB, galleryCtrl.create);
router.post('/admin/galleries', ensureAuth, withDB, galleryCtrl.store);
router.get('/admin/galleries/:id/edit', ensureAuth, withDB, galleryCtrl.edit);
router.put('/admin/galleries/:id', ensureAuth, withDB, galleryCtrl.update);
router.get('/admin/galleries/:id/delete', ensureAuth, withDB, galleryCtrl.destroy);

// Testimonials
router.get('/admin/testimonials', ensureAuth, withDB, testimonialCtrl.index);
router.get('/admin/testimonials/create', ensureAuth, withDB, testimonialCtrl.create);
router.post('/admin/testimonials', ensureAuth, withDB, testimonialCtrl.store);
router.get('/admin/testimonials/:id/edit', ensureAuth, withDB, testimonialCtrl.edit);
router.put('/admin/testimonials/:id', ensureAuth, withDB, testimonialCtrl.update);
router.get('/admin/testimonials/:id/delete', ensureAuth, withDB, testimonialCtrl.destroy);

// Rooms
router.get('/admin/rooms', ensureAuth, withDB, roomCtrl.index);
router.get('/admin/rooms/create', ensureAuth, withDB, roomCtrl.create);
router.post('/admin/rooms', ensureAuth, withDB, roomCtrl.store);
router.get('/admin/rooms/:id/edit', ensureAuth, withDB, roomCtrl.edit);
router.put('/admin/rooms/:id', ensureAuth, withDB, roomCtrl.update);
router.get('/admin/rooms/:id/delete', ensureAuth, withDB, roomCtrl.destroy);

// Room Info
router.get('/admin/room-info', ensureAuth, withDB, roomInfoCtrl.index);
router.put('/admin/room-info', ensureAuth, withDB, roomInfoCtrl.update);

// Staff Categories
router.get('/admin/staff-categories', ensureAuth, withDB, staffCategoryCtrl.index);
router.get('/admin/staff-categories/create', ensureAuth, withDB, staffCategoryCtrl.create);
router.post('/admin/staff-categories', ensureAuth, withDB, staffCategoryCtrl.store);
router.get('/admin/staff-categories/:id/edit', ensureAuth, withDB, staffCategoryCtrl.edit);
router.put('/admin/staff-categories/:id', ensureAuth, withDB, staffCategoryCtrl.update);
router.get('/admin/staff-categories/:id/delete', ensureAuth, withDB, staffCategoryCtrl.destroy);

// Staff
router.get('/admin/staff', ensureAuth, withDB, staffCtrl.index);
router.get('/admin/staff/create', ensureAuth, withDB, staffCtrl.create);
router.post('/admin/staff', ensureAuth, withDB, staffCtrl.store);
router.get('/admin/staff/:id/edit', ensureAuth, withDB, staffCtrl.edit);
router.put('/admin/staff/:id', ensureAuth, withDB, staffCtrl.update);
router.get('/admin/staff/:id/delete', ensureAuth, withDB, staffCtrl.destroy);

// Site Settings
router.get('/admin/site-settings', ensureAuth, withDB, siteSettingCtrl.index);
router.post('/admin/site-settings/menu-pdf', ensureAuth, withDB, siteSettingCtrl.updateMenuPdf);

module.exports = router;
