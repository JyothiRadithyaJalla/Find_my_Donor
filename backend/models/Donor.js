const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  area: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  city: { type: String, default: 'Hyderabad' },
  phoneNumber: { type: String, required: true },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

donorSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Donor', donorSchema);
