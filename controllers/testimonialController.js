const Testimonial = require('../models/Testimonial');
const { upload } = require('../config/cloudinary');

exports.index = async (req, res) => {
  const testimonials = await Testimonial.find().sort({ createdAt: -1 });
  res.render('admin/testimonials/index', {
    layout: 'layout/admin',
    page_title: 'Testimonials - Admin',
    testimonials
  });
};

exports.create = (req, res) => {
  res.render('admin/testimonials/create', {
    layout: 'layout/admin',
    page_title: 'Add Testimonial - Admin'
  });
};

exports.store = [upload.single('image'), async (req, res) => {
  try {
    const { name, occupation, comment, status } = req.body;
    const image = req.file ? req.file.path : '';
    await Testimonial.create({ name, occupation, comment, image, status: status || 'DRAFT' });
    res.redirect('/admin/testimonials?success=Testimonial created successfully');
  } catch (err) {
    res.redirect('/admin/testimonials/create?error=' + encodeURIComponent(err.message));
  }
}];

exports.edit = async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) return res.redirect('/admin/testimonials?error=Testimonial not found');
  res.render('admin/testimonials/edit', {
    layout: 'layout/admin',
    page_title: 'Edit Testimonial - Admin',
    testimonial
  });
};

exports.update = [upload.single('image'), async (req, res) => {
  try {
    const { name, occupation, comment, status } = req.body;
    const update = { name, occupation, comment, status };
    if (req.file) update.image = req.file.path;
    await Testimonial.findByIdAndUpdate(req.params.id, update);
    res.redirect('/admin/testimonials?success=Testimonial updated successfully');
  } catch (err) {
    res.redirect(`/admin/testimonials/${req.params.id}/edit?error=` + encodeURIComponent(err.message));
  }
}];

exports.destroy = async (req, res) => {
  await Testimonial.findByIdAndDelete(req.params.id);
  res.redirect('/admin/testimonials?success=Testimonial deleted successfully');
};

exports.destroyBulk = async (req, res) => {
  await Testimonial.deleteMany({});
  res.redirect('/admin/testimonials?success=All testimonials deleted');
};
