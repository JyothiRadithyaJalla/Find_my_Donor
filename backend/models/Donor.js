const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  area: { type: String, required: true },
  city: { type: String, default: 'Hyderabad' },
  phoneNumber: { type: String, required: true },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Donor', donorSchema);
