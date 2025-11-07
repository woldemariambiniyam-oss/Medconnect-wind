const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    default: 0
  },
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    required: true
  },
  category: String,
  manufacturer: String,
  expiryDate: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Medicine', medicineSchema);
