const mongoose = require('mongoose');

const galleryTagSchema = new mongoose.Schema({
  order: { type: Number, default: 1 },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  image: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('GalleryTag', galleryTagSchema);
