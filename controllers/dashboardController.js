const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Post = require('../models/Post');
const Gallery = require('../models/Gallery');
const Room = require('../models/Room');
const Testimonial = require('../models/Testimonial');

exports.index = async (req, res) => {
  const postCount = await Post.countDocuments();
  const galleryCount = await Gallery.countDocuments();
  const roomCount = await Room.countDocuments();
  const testimonialCount = await Testimonial.countDocuments();
  res.render('admin/dashboard', {
    layout: 'layout/admin',
    page_title: 'Dashboard - Thornton Lodge',
    postCount, galleryCount, roomCount, testimonialCount
  });
};

exports.profile = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.render('admin/profile', {
    layout: 'layout/admin',
    page_title: 'Profile - Thornton Lodge',
    profileUser: user
  });
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const update = { name, email };
    if (password) {
      update.password = await bcrypt.hash(password, 10);
    }
    await User.findByIdAndUpdate(req.params.id, update);
    res.redirect('/admin/profile?success=Profile updated successfully');
  } catch (err) {
    res.redirect('/admin/profile?error=Update failed');
  }
};
