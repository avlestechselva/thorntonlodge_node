const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  title: { type: String, required: true },
  author: { type: String },
  seo_title: { type: String },
  excerpt: { type: String },
  body: { type: String },
  image: { type: String },
  slug: { type: String, required: true, unique: true },
  meta_description: { type: String },
  keyword: { type: String },
  status: { type: String, enum: ['PUBLISHED', 'DRAFT', 'PENDING'], default: 'DRAFT' },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
