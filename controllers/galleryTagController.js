const GalleryTag = require('../models/GalleryTag');
const { upload } = require('../config/cloudinary');

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

exports.index = async (req, res) => {
  const tags = await GalleryTag.find().sort({ order: 1 });
  res.render('admin/gallery_tags/index', {
    layout: 'layout/admin',
    page_title: 'Gallery Tags - Admin',
    tags
  });
};

exports.create = (req, res) => {
  res.render('admin/gallery_tags/create', {
    layout: 'layout/admin',
    page_title: 'Create Gallery Tag - Admin'
  });
};

exports.store = [upload.single('image'), async (req, res) => {
  try {
    const { title, order } = req.body;
    const slug = slugify(title);
    const image = req.file ? req.file.path : '';
    await GalleryTag.create({ title, slug, order: order || 1, image });
    res.redirect('/admin/gallery-tags?success=Tag created successfully');
  } catch (err) {
    res.redirect('/admin/gallery-tags/create?error=' + encodeURIComponent(err.message));
  }
}];

exports.edit = async (req, res) => {
  const tag = await GalleryTag.findById(req.params.id);
  if (!tag) return res.redirect('/admin/gallery-tags?error=Tag not found');
  res.render('admin/gallery_tags/edit', {
    layout: 'layout/admin',
    page_title: 'Edit Gallery Tag - Admin',
    tag
  });
};

exports.update = [upload.single('image'), async (req, res) => {
  try {
    const { title, order } = req.body;
    const update = { title, order: order || 1, slug: slugify(title) };
    if (req.file) update.image = req.file.path;
    await GalleryTag.findByIdAndUpdate(req.params.id, update);
    res.redirect('/admin/gallery-tags?success=Tag updated successfully');
  } catch (err) {
    res.redirect(`/admin/gallery-tags/${req.params.id}/edit?error=` + encodeURIComponent(err.message));
  }
}];

exports.destroy = async (req, res) => {
  await GalleryTag.findByIdAndDelete(req.params.id);
  res.redirect('/admin/gallery-tags?success=Tag deleted successfully');
};

exports.destroyBulk = async (req, res) => {
  await GalleryTag.deleteMany({});
  res.redirect('/admin/gallery-tags?success=All tags deleted');
};
