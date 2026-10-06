const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  tag_id: { type: mongoose.Schema.Types.ObjectId, ref: 'GalleryTag' },
  title: { type: String },
  image: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);
