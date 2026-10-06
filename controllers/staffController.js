const Staff = require('../models/Staff');
const StaffCategory = require('../models/StaffCategory');
const { upload } = require('../config/cloudinary');

exports.index = async (req, res) => {
  const staffs = await Staff.find().sort({ order: 1 }).populate('category_id');
  res.render('admin/staff/index', {
    layout: 'layout/admin',
    page_title: 'Staff - Admin',
    staffs
  });
};

exports.create = async (req, res) => {
  const categories = await StaffCategory.find();
  res.render('admin/staff/create', {
    layout: 'layout/admin',
    page_title: 'Add Staff - Admin',
    categories
  });
};

exports.store = [upload.single('image'), async (req, res) => {
  try {
    const { category_id, name, position, description, order, status, qualification, bio } = req.body;
    const image = req.file ? req.file.path : '';
    await Staff.create({ category_id, name, position, image, description, order: order || 1, status: status || 'ACTIVE', qualification, bio });
    res.redirect('/admin/staff?success=Staff created successfully');
  } catch (err) {
    res.redirect('/admin/staff/create?error=' + encodeURIComponent(err.message));
  }
}];

exports.edit = async (req, res) => {
  const staff = await Staff.findById(req.params.id);
  const categories = await StaffCategory.find();
  if (!staff) return res.redirect('/admin/staff?error=Staff not found');
  res.render('admin/staff/edit', {
    layout: 'layout/admin',
    page_title: 'Edit Staff - Admin',
    staff, categories
  });
};

exports.update = [upload.single('image'), async (req, res) => {
  try {
    const { category_id, name, position, description, order, status, qualification, bio } = req.body;
    const update = { category_id, name, position, description, order: order || 1, status, qualification, bio };
    if (req.file) update.image = req.file.path;
    await Staff.findByIdAndUpdate(req.params.id, update);
    res.redirect('/admin/staff?success=Staff updated successfully');
  } catch (err) {
    res.redirect(`/admin/staff/${req.params.id}/edit?error=` + encodeURIComponent(err.message));
  }
}];

exports.destroy = async (req, res) => {
  await Staff.findByIdAndDelete(req.params.id);
  res.redirect('/admin/staff?success=Staff deleted successfully');
};

exports.destroyBulk = async (req, res) => {
  await Staff.deleteMany({});
  res.redirect('/admin/staff?success=All staff deleted');
};
