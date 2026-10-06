require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(expressLayouts);
app.set('layout', 'layout/app');

// JWT middleware
app.use((req, res, next) => {
  try {
    const token = req.cookies.token;
    if (token) req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    res.clearCookie('token');
  }
  next();
});

// Flash locals
app.use((req, res, next) => {
  res.locals.success = req.query.success || null;
  res.locals.error = req.query.error || null;
  res.locals.user = req.user || null;
  next();
});

app.use('/', require('./routes/web'));

module.exports = app;

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Thornton Lodge running on port ${port}`));
}
