const Gallery = require('../models/Gallery');
const GalleryTag = require('../models/GalleryTag');
const { upload } = require('../config/cloudinary');

exports.index = async (req, res) => {
  const galleries = await Gallery.find().sort({ createdAt: -1 }).populate('tag_id');
  res.render('admin/galleries/index', {
    layout: 'layout/admin',
    page_title: 'Gallery - Admin',
    galleries
  });
};

exports.create = async (req, res) => {
  const tags = await GalleryTag.find();
  res.render('admin/galleries/create', {
    layout: 'layout/admin',
    page_title: 'Add Gallery Image - Admin',
    tags
  });
};

exports.store = [upload.single('image'), async (req, res) => {
  try {
    const { tag_id, title } = req.body;
    const image = req.file ? req.file.path : '';
    await Gallery.create({ tag_id, title, image });
    res.redirect('/admin/galleries?success=Image added successfully');
  } catch (err) {
    res.redirect('/admin/galleries/create?error=' + encodeURIComponent(err.message));
  }
}];

exports.edit = async (req, res) => {
  const gallery = await Gallery.findById(req.params.id);
  const tags = await GalleryTag.find();
  if (!gallery) return res.redirect('/admin/galleries?error=Image not found');
  res.render('admin/galleries/edit', {
    layout: 'layout/admin',
    page_title: 'Edit Gallery Image - Admin',
    gallery, tags
  });
};

exports.update = [upload.single('image'), async (req, res) => {
  try {
    const { tag_id, title } = req.body;
    const update = { tag_id, title };
    if (req.file) update.image = req.file.path;
    await Gallery.findByIdAndUpdate(req.params.id, update);
    res.redirect('/admin/galleries?success=Image updated successfully');
  } catch (err) {
    res.redirect(`/admin/galleries/${req.params.id}/edit?error=` + encodeURIComponent(err.message));
  }
}];

exports.destroy = async (req, res) => {
  await Gallery.findByIdAndDelete(req.params.id);
  res.redirect('/admin/galleries?success=Image deleted successfully');
};

exports.destroyBulk = async (req, res) => {
  await Gallery.deleteMany({});
  res.redirect('/admin/galleries?success=All images deleted');
};
