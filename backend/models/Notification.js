const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['appointment', 'prescription', 'payment', 'verification', 'general'],
    required: true
  },
  readStatus: {
    type: Boolean,
    default: false
  },
  relatedId: mongoose.Schema.Types.ObjectId // Can reference appointment, prescription, etc.
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
