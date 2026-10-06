const Category = require('../models/Category');

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

exports.index = async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });
  res.render('admin/categories/index', {
    layout: 'layout/admin',
    page_title: 'Categories - Admin',
    categories
  });
};

exports.create = (req, res) => {
  res.render('admin/categories/create', {
    layout: 'layout/admin',
    page_title: 'Create Category - Admin'
  });
};

exports.store = async (req, res) => {
  try {
    const { name } = req.body;
    const slug = slugify(name);
    await Category.create({ name, slug });
    res.redirect('/admin/categories?success=Category created successfully');
  } catch (err) {
    res.redirect('/admin/categories/create?error=' + encodeURIComponent(err.message));
  }
};

exports.edit = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.redirect('/admin/categories?error=Category not found');
  res.render('admin/categories/edit', {
    layout: 'layout/admin',
    page_title: 'Edit Category - Admin',
    category
  });
};

exports.update = async (req, res) => {
  try {
    const { name } = req.body;
    const slug = slugify(name);
    await Category.findByIdAndUpdate(req.params.id, { name, slug });
    res.redirect('/admin/categories?success=Category updated successfully');
  } catch (err) {
    res.redirect(`/admin/categories/${req.params.id}/edit?error=` + encodeURIComponent(err.message));
  }
};

exports.destroy = async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.redirect('/admin/categories?success=Category deleted successfully');
};

exports.destroyBulk = async (req, res) => {
  await Category.deleteMany({});
  res.redirect('/admin/categories?success=All categories deleted');
};
