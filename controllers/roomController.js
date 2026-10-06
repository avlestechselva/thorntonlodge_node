const Room = require('../models/Room');
const { upload } = require('../config/cloudinary');

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

exports.index = async (req, res) => {
  const rooms = await Room.find().sort({ createdAt: -1 });
  res.render('admin/rooms/index', {
    layout: 'layout/admin',
    page_title: 'Rooms - Admin',
    rooms
  });
};

exports.create = (req, res) => {
  res.render('admin/rooms/create', {
    layout: 'layout/admin',
    page_title: 'Create Room - Admin'
  });
};

exports.store = [upload.single('cover_image'), async (req, res) => {
  try {
    const { title, excerpt, body, seo_title, meta_description, keyword, status } = req.body;
    const cover_image = req.file ? req.file.path : '';
    const slug = slugify(title);
    await Room.create({ title, slug, excerpt, body, cover_image, seo_title, meta_description, keyword, status: status || 'DRAFT' });
    res.redirect('/admin/rooms?success=Room created successfully');
  } catch (err) {
    res.redirect('/admin/rooms/create?error=' + encodeURIComponent(err.message));
  }
}];

exports.edit = async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) return res.redirect('/admin/rooms?error=Room not found');
  res.render('admin/rooms/edit', {
    layout: 'layout/admin',
    page_title: 'Edit Room - Admin',
    room
  });
};

exports.update = [upload.single('cover_image'), async (req, res) => {
  try {
    const { title, excerpt, body, seo_title, meta_description, keyword, status } = req.body;
    const update = { title, excerpt, body, seo_title, meta_description, keyword, status };
    if (title) update.slug = slugify(title);
    if (req.file) update.cover_image = req.file.path;
    await Room.findByIdAndUpdate(req.params.id, update);
    res.redirect('/admin/rooms?success=Room updated successfully');
  } catch (err) {
    res.redirect(`/admin/rooms/${req.params.id}/edit?error=` + encodeURIComponent(err.message));
  }
}];

exports.destroy = async (req, res) => {
  await Room.findByIdAndDelete(req.params.id);
  res.redirect('/admin/rooms?success=Room deleted successfully');
};

exports.destroyBulk = async (req, res) => {
  await Room.deleteMany({});
  res.redirect('/admin/rooms?success=All rooms deleted');
};
