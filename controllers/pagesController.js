const Post = require('../models/Post');
const Category = require('../models/Category');
const Testimonial = require('../models/Testimonial');
const Room = require('../models/Room');
const RoomDetail = require('../models/RoomDetail');
const Gallery = require('../models/Gallery');
const GalleryTag = require('../models/GalleryTag');
const Staff = require('../models/Staff');
const StaffCategory = require('../models/StaffCategory');
const SiteSetting = require('../models/SiteSetting');

exports.index = async (req, res) => {
  const testimonials = await Testimonial.find({ status: 'PUBLISHED' }).limit(10);
  const rooms = await Room.find({ status: 'PUBLISHED' }).limit(6);
  const room_info = await RoomDetail.findOne() || { beds: 0, vacancies: 0 };
  const count_room = room_info.vacancies || 0;
  const posts = await Post.find({ status: 'PUBLISHED' }).sort({ createdAt: -1 }).limit(3).populate('category_id');
  res.render('pages/index', {
    page_title: 'Thornton Lodge - Quality Residential Care',
    description: 'Thornton Lodge is a Residential Care Home for Adults and Older People with Mental Health Illness',
    keywords: 'care home, residential care, mental health, thornton lodge',
    Abstract: 'Thornton Lodge Care Home',
    testimonials, rooms, room_info, count_room, posts
  });
};

exports.about = (req, res) => {
  res.render('pages/about', {
    page_title: 'About Us - Thornton Lodge',
    description: 'Learn about Thornton Lodge care home',
    keywords: 'about thornton lodge, care home',
    Abstract: 'About Thornton Lodge'
  });
};

exports.testimonial = async (req, res) => {
  const testimonials = await Testimonial.find({ status: 'PUBLISHED' });
  res.render('pages/testimonial', {
    page_title: 'Testimonials - Thornton Lodge',
    description: 'Read testimonials from residents and families at Thornton Lodge',
    keywords: 'testimonials, reviews, care home',
    Abstract: 'Testimonials',
    testimonials
  });
};

exports.cuisine = async (req, res) => {
  const menuSetting = await SiteSetting.findOne({ key: 'menu_pdf_path' });
  res.render('pages/cuisine', {
    page_title: 'Cuisine - Thornton Lodge',
    description: 'Our cuisine and menu at Thornton Lodge',
    keywords: 'cuisine, menu, meals, care home',
    Abstract: 'Cuisine',
    menu_pdf_path: menuSetting ? menuSetting.value : null
  });
};

exports.accommodation = async (req, res) => {
  const rooms = await Room.find({ status: 'PUBLISHED' });
  const room_info = await RoomDetail.findOne() || { beds: 0, vacancies: 0 };
  res.render('pages/accommodation', {
    page_title: 'Accommodation - Thornton Lodge',
    description: 'Explore our accommodation options at Thornton Lodge',
    keywords: 'accommodation, rooms, care home',
    Abstract: 'Accommodation',
    rooms, room_info
  });
};

exports.admission = (req, res) => {
  res.render('pages/admission', {
    page_title: 'Admission Criteria - Thornton Lodge',
    description: 'Admission criteria for Thornton Lodge care home',
    keywords: 'admission, criteria, care home',
    Abstract: 'Admission Criteria'
  });
};

exports.facilities = (req, res) => {
  res.render('pages/facilities', {
    page_title: 'Facilities - Thornton Lodge',
    description: 'Our facilities at Thornton Lodge',
    keywords: 'facilities, care home',
    Abstract: 'Facilities'
  });
};

exports.activities = (req, res) => {
  res.render('pages/activities', {
    page_title: 'Activities & Events - Thornton Lodge',
    description: 'Activities and events at Thornton Lodge',
    keywords: 'activities, events, care home',
    Abstract: 'Activities and Events'
  });
};

exports.principal = (req, res) => {
  res.render('pages/principal', {
    page_title: 'Principal of Care - Thornton Lodge',
    description: 'Our principal of care at Thornton Lodge',
    keywords: 'principal of care, care home',
    Abstract: 'Principal of Care'
  });
};

exports.st_christophers = (req, res) => {
  res.render('pages/st_christophers', {
    page_title: 'St Christophers - Thornton Lodge',
    description: 'St Christophers at Thornton Lodge',
    keywords: 'st christophers, care home',
    Abstract: 'St Christophers'
  });
};

exports.staff_training = (req, res) => {
  res.render('pages/staff_training', {
    page_title: 'Staff Training - Thornton Lodge',
    description: 'Staff training at Thornton Lodge',
    keywords: 'staff training, care home',
    Abstract: 'Staff Training'
  });
};

exports.vacancy = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 9;
  const skip = (page - 1) * limit;
  const rooms = await Room.find({ status: 'PUBLISHED' }).skip(skip).limit(limit);
  const total = await Room.countDocuments({ status: 'PUBLISHED' });
  const room_info = await RoomDetail.findOne() || { beds: 0, vacancies: 0 };
  const count_room = room_info.vacancies || 0;
  const pages = Math.ceil(total / limit);
  res.render('pages/vacancy', {
    page_title: 'Bed Vacancies - Thornton Lodge',
    description: 'Available beds and rooms at Thornton Lodge',
    keywords: 'bed vacancies, rooms available, care home',
    Abstract: 'Bed Vacancies',
    rooms, room_info, count_room, page, pages, total
  });
};

exports.team = async (req, res) => {
  const staffCategories = await StaffCategory.find({ is_active: true }).sort({ order: 1 });
  const staffs = await Staff.find({ status: 'ACTIVE' }).sort({ order: 1 }).populate('category_id');

  // Build sections grouped by parent_section
  const sections = {};
  staffCategories.forEach(cat => {
    const catWithStaffs = {
      ...cat.toObject(),
      staffs: staffs.filter(s => s.category_id && s.category_id._id.toString() === cat._id.toString())
    };
    const parent = cat.parent_section || '';
    if (!sections[parent]) sections[parent] = [];
    sections[parent].push(catWithStaffs);
  });

  res.render('pages/team', {
    page_title: 'Our Team - Thornton Lodge',
    description: 'Meet our dedicated team at Thornton Lodge',
    keywords: 'team, staff, care home',
    Abstract: 'Our Team',
    sections
  });
};

exports.job_vacancy = (req, res) => {
  res.render('pages/job_vacancy', {
    page_title: 'Job Vacancies - Thornton Lodge',
    description: 'Job opportunities at Thornton Lodge',
    keywords: 'jobs, vacancies, care home',
    Abstract: 'Job Vacancies'
  });
};

exports.gallery = async (req, res) => {
  const gallery_tags = await GalleryTag.find().sort({ order: 1 });
  const galleries = await Gallery.find().populate('tag_id');
  res.render('pages/gallery', {
    page_title: 'Gallery - Thornton Lodge',
    description: 'Photo gallery of Thornton Lodge',
    keywords: 'gallery, photos, care home',
    Abstract: 'Gallery',
    gallery_tags, galleries
  });
};

exports.show_gallery = async (req, res) => {
  const tag_info = await GalleryTag.findOne({ slug: req.params.slug });
  if (!tag_info) return res.redirect('/gallery');
  const galleries = await Gallery.find({ tag_id: tag_info._id });
  res.render('gallery/show', {
    page_title: `${tag_info.title} Gallery - Thornton Lodge`,
    description: `${tag_info.title} gallery at Thornton Lodge`,
    keywords: 'gallery, photos',
    Abstract: 'Gallery',
    tag_info, galleries
  });
};

exports.blog = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 9;
  const skip = (page - 1) * limit;
  const posts = await Post.find({ status: 'PUBLISHED' }).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('category_id');
  const total = await Post.countDocuments({ status: 'PUBLISHED' });
  const categories = await Category.find();
  const pages = Math.ceil(total / limit);
  res.render('post/index', {
    page_title: 'News - Thornton Lodge',
    description: 'Latest news from Thornton Lodge',
    keywords: 'news, blog, care home',
    Abstract: 'News',
    posts, categories, page, pages, total
  });
};

exports.postcategory = async (req, res) => {
  const tag_info = await Category.findOne({ slug: req.params.postcategory });
  if (!tag_info) return res.redirect('/news');
  const posts = await Post.find({ status: 'PUBLISHED', category_id: tag_info._id }).sort({ createdAt: -1 }).populate('category_id');
  const categories = await Category.find();
  res.render('post/category', {
    page_title: `${tag_info.name} - Thornton Lodge`,
    description: `${tag_info.name} news from Thornton Lodge`,
    keywords: 'news, blog',
    Abstract: tag_info.name,
    posts, categories, tag_info
  });
};

exports.show_post = async (req, res) => {
  const tag_info = await Category.findOne({ slug: req.params.category });
  const post = await Post.findOne({ slug: req.params.slug, status: 'PUBLISHED' }).populate('category_id');
  if (!post) return res.redirect('/news');
  const tags = await Category.find();
  const pop_post = await Post.find({ status: 'PUBLISHED' }).sort({ createdAt: -1 }).limit(5).populate('category_id');
  res.render('post/show', {
    page_title: `${post.title} - Thornton Lodge`,
    description: post.meta_description || post.excerpt,
    keywords: post.keyword,
    Abstract: post.title,
    post, tag_info, tags, pop_post
  });
};

exports.room = async (req, res) => {
  const rooms = await Room.find({ status: 'PUBLISHED' });
  res.render('pages/room', {
    page_title: 'Rooms - Thornton Lodge',
    description: 'Our rooms at Thornton Lodge',
    keywords: 'rooms, accommodation, care home',
    Abstract: 'Rooms',
    rooms
  });
};

exports.show_project = async (req, res) => {
  const room = await Room.findOne({ slug: req.params.slug, status: 'PUBLISHED' });
  if (!room) return res.redirect('/projects');
  res.render('room/show', {
    page_title: `${room.title} - Thornton Lodge`,
    description: room.meta_description || room.excerpt,
    keywords: room.keyword,
    Abstract: room.title,
    room
  });
};

exports.privacy_policy = (req, res) => {
  res.render('pages/terms', {
    page_title: 'Privacy Policy - Thornton Lodge',
    description: 'Privacy policy for Thornton Lodge',
    keywords: 'privacy policy, terms',
    Abstract: 'Privacy Policy'
  });
};

exports.contact = (req, res) => {
  res.render('pages/contact', {
    page_title: 'Contact Us - Thornton Lodge',
    description: 'Contact Thornton Lodge care home',
    keywords: 'contact, care home',
    Abstract: 'Contact Us'
  });
};

exports.sitemap = (req, res) => {
  res.render('pages/sitemap', {
    page_title: 'Sitemap - Thornton Lodge',
    description: 'Sitemap for Thornton Lodge website',
    keywords: 'sitemap',
    Abstract: 'Sitemap'
  });
};

exports.menu = async (req, res) => {
  const menuSetting = await SiteSetting.findOne({ key: 'menu_pdf' });
  res.render('pages/menu', {
    page_title: 'Menu - Thornton Lodge',
    description: 'Our menu at Thornton Lodge',
    keywords: 'menu, food, care home',
    Abstract: 'Menu',
    menu_pdf: menuSetting ? menuSetting.value : null
  });
};
