const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.showLogin = (req, res) => {
  res.render('auth/login', { layout: 'layout/admin', page_title: 'Admin Login' });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.redirect('/login?error=Invalid credentials');
    const match = await user.comparePassword(password);
    if (!match) return res.redirect('/login?error=Invalid credentials');
    const token = jwt.sign({ id: user._id, name: user.name, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.redirect('/login?error=Login failed');
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
};
