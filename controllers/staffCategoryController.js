const StaffCategory = require('../models/StaffCategory');

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

exports.index = async (req, res) => {
  const categories = await StaffCategory.find().sort({ order: 1 });
  res.render('admin/staff_categories/index', {
    layout: 'layout/admin',
    page_title: 'Staff Categories - Admin',
    categories
  });
};

exports.create = (req, res) => {
  res.render('admin/staff_categories/create', {
    layout: 'layout/admin',
    page_title: 'Create Staff Category - Admin'
  });
};

exports.store = async (req, res) => {
  try {
    const { name, section_title, parent_section, display_type, is_active, description, order } = req.body;
    const slug = slugify(name);
    await StaffCategory.create({ name, slug, section_title, parent_section, display_type, is_active: is_active === 'on', description, order: order || 1 });
    res.redirect('/admin/staff-categories?success=Category created successfully');
  } catch (err) {
    res.redirect('/admin/staff-categories/create?error=' + encodeURIComponent(err.message));
  }
};

exports.edit = async (req, res) => {
  const category = await StaffCategory.findById(req.params.id);
  if (!category) return res.redirect('/admin/staff-categories?error=Category not found');
  res.render('admin/staff_categories/edit', {
    layout: 'layout/admin',
    page_title: 'Edit Staff Category - Admin',
    category
  });
};

exports.update = async (req, res) => {
  try {
    const { name, section_title, parent_section, display_type, is_active, description, order } = req.body;
    const slug = slugify(name);
    await StaffCategory.findByIdAndUpdate(req.params.id, { name, slug, section_title, parent_section, display_type, is_active: is_active === 'on', description, order: order || 1 });
    res.redirect('/admin/staff-categories?success=Category updated successfully');
  } catch (err) {
    res.redirect(`/admin/staff-categories/edit/${req.params.id}?error=` + encodeURIComponent(err.message));
  }
};

exports.destroy = async (req, res) => {
  await StaffCategory.findByIdAndDelete(req.params.id);
  res.redirect('/admin/staff-categories?success=Category deleted successfully');
};

exports.destroyBulk = async (req, res) => {
  await StaffCategory.deleteMany({});
  res.redirect('/admin/staff-categories?success=All categories deleted');
};
