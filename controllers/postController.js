const Post = require('../models/Post');
const Category = require('../models/Category');
const { cloudinary, upload } = require('../config/cloudinary');

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

exports.index = async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 }).populate('category_id');
  res.render('admin/posts/index', {
    layout: 'layout/admin',
    page_title: 'Posts - Admin',
    posts
  });
};

exports.create = async (req, res) => {
  const categories = await Category.find();
  res.render('admin/posts/create', {
    layout: 'layout/admin',
    page_title: 'Create Post - Admin',
    categories
  });
};

exports.store = [upload.single('image'), async (req, res) => {
  try {
    const { title, category_id, author, seo_title, excerpt, body, meta_description, keyword, status, featured } = req.body;
    const image = req.file ? req.file.path : '';
    const slug = slugify(title);
    await Post.create({ title, category_id, author, seo_title, excerpt, body, image, slug, meta_description, keyword, status: status || 'DRAFT', featured: featured === 'on' });
    res.redirect('/admin/posts?success=Post created successfully');
  } catch (err) {
    res.redirect('/admin/posts/create?error=' + encodeURIComponent(err.message));
  }
}];

exports.edit = async (req, res) => {
  const post = await Post.findById(req.params.id);
  const categories = await Category.find();
  if (!post) return res.redirect('/admin/posts?error=Post not found');
  res.render('admin/posts/edit', {
    layout: 'layout/admin',
    page_title: 'Edit Post - Admin',
    post, categories
  });
};

exports.update = [upload.single('image'), async (req, res) => {
  try {
    const { title, category_id, author, seo_title, excerpt, body, meta_description, keyword, status, featured } = req.body;
    const update = { title, category_id, author, seo_title, excerpt, body, meta_description, keyword, status, featured: featured === 'on' };
    if (req.file) update.image = req.file.path;
    if (title) update.slug = slugify(title);
    await Post.findByIdAndUpdate(req.params.id, update);
    res.redirect('/admin/posts?success=Post updated successfully');
  } catch (err) {
    res.redirect(`/admin/posts/${req.params.id}/edit?error=` + encodeURIComponent(err.message));
  }
}];

exports.destroy = async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.redirect('/admin/posts?success=Post deleted successfully');
};

exports.destroyBulk = async (req, res) => {
  await Post.deleteMany({});
  res.redirect('/admin/posts?success=All posts deleted');
};
