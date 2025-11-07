const Prescription = require('../models/Prescription');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Notification = require('../models/Notification');

// @desc    Get all prescriptions
// @route   GET /api/prescriptions
// @access  Private
const getPrescriptions = async (req, res) => {
  try {
    let query;

    // Patients can only see their own prescriptions
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      query = { patientId: patient._id };
    }
    // Doctors can only see prescriptions they issued
    else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      query = { doctorId: doctor._id };
    }
    // Pharmacies can see all prescriptions
    else if (req.user.role === 'pharmacy') {
      query = {};
    }
    // Admins can see all prescriptions
    else if (req.user.role === 'admin') {
      query = {};
    } else {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const prescriptions = await Prescription.find(query)
      .populate('doctorId', 'userId specialization')
      .populate('patientId', 'userId')
      .populate('doctorId.userId', 'name email')
      .populate('patientId.userId', 'name email')
      .populate('medicines.medicineId', 'name description')
      .sort({ issuedDate: -1 });

    res.status(200).json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single prescription
// @route   GET /api/prescriptions/:id
// @access  Private
const getPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('doctorId', 'userId specialization')
      .populate('patientId', 'userId')
      .populate('doctorId.userId', 'name email')
      .populate('patientId.userId', 'name email')
      .populate('medicines.medicineId', 'name description price');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Check authorization
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (prescription.patientId._id.toString() !== patient._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (prescription.doctorId._id.toString() !== doctor._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    res.status(200).json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create prescription
// @route   POST /api/prescriptions
// @access  Private/Doctor
const createPrescription = async (req, res) => {
  try {
    const { patientId, medicines, notes } = req.body;

    // Get doctor profile
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const prescription = await Prescription.create({
      doctorId: doctor._id,
      patientId,
      medicines,
      notes
    });

    // Add prescription to patient's record
    patient.prescriptions.push(prescription._id);
    await patient.save();

    // Create notification for patient
    await Notification.create({
      userId: patient.userId,
      message: `New prescription issued by Dr. ${req.user.name}`,
      type: 'prescription',
      relatedId: prescription._id
    });

    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update prescription
// @route   PUT /api/prescriptions/:id
// @access  Private/Doctor
const updatePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Check if doctor owns this prescription
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (prescription.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedPrescription = await Prescription.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedPrescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete prescription
// @route   DELETE /api/prescriptions/:id
// @access  Private/Doctor
const deletePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Check if doctor owns this prescription
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (prescription.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await prescription.remove();
    res.status(200).json({ message: 'Prescription removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPrescriptions,
  getPrescription,
  createPrescription,
  updatePrescription,
  deletePrescription,
};
