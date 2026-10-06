const mongoose = require('mongoose');

const staffCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String },
  section_title: { type: String },
  parent_section: { type: String },
  display_type: { type: String },
  is_active: { type: Boolean, default: true },
  description: { type: String },
  order: { type: Number, default: 1 },
}, { timestamps: true });

module.exports = mongoose.model('StaffCategory', staffCategorySchema);
