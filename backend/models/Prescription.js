const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  medicines: [{
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine'
    },
    dosage: String,
    frequency: String,
    duration: String,
    quantity: Number
  }],
  issuedDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
