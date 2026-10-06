const mongoose = require('mongoose');

const roomDetailSchema = new mongoose.Schema({
  beds: { type: Number, default: 0 },
  vacancies: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('RoomDetail', roomDetailSchema);
