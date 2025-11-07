const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  verified: {
    type: Boolean,
    default: false
  },
  inventory: [{
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine'
    },
    quantity: Number,
    price: Number
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Pharmacy', pharmacySchema);
