const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialization: {
    type: String,
    required: true
  },
  licenseNo: {
    type: String,
    required: true,
    unique: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  schedule: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    startTime: String,
    endTime: String
  }],
  patients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema);
