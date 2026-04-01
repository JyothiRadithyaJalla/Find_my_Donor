const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor', required: true },
  donorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hospitalName: { type: String, required: true },
  patientName: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  recipientName: { type: String, required: true },
  recipientPhone: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
