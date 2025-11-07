const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true // Can be doctor or pharmacy ID
  },
  entityType: {
    type: String,
    enum: ['doctor', 'pharmacy'],
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // EFDA or Admin
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  remarks: String,
  documents: [String] // URLs to uploaded documents
}, {
  timestamps: true
});

module.exports = mongoose.model('Verification', verificationSchema);
