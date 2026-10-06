const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String },
  body: { type: String },
  cover_image: { type: String },
  seo_title: { type: String },
  meta_description: { type: String },
  keyword: { type: String },
  status: { type: String, enum: ['PUBLISHED', 'DRAFT', 'PENDING'], default: 'DRAFT' },
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
