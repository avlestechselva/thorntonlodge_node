const ensureAuth = (req, res, next) => {
  if (req.user) return next();
  res.redirect('/login');
};

const ensureGuest = (req, res, next) => {
  if (!req.user) return next();
  res.redirect('/admin/dashboard');
};

module.exports = { ensureAuth, ensureGuest };
