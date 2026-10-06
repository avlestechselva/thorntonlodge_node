const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  occupation: { type: String },
  comment: { type: String, required: true },
  image: { type: String },
  status: { type: String, enum: ['PUBLISHED', 'DRAFT', 'PENDING'], default: 'DRAFT' },
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
