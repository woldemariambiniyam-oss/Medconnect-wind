const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  age: Number,
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    notes: String
  }],
  prescriptions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  }],
  appointments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Patient', patientSchema);
