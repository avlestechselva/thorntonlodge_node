const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'StaffCategory' },
  name: { type: String, required: true },
  position: { type: String },
  image: { type: String },
  description: { type: String },
  order: { type: Number, default: 1 },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  qualification: { type: String },
  bio: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);
