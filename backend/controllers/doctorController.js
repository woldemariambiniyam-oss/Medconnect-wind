const Doctor = require('../models/Doctor');
const User = require('../models/User');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ verified: true })
      .populate('userId', 'name email')
      .select('-patients');
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Public
const getDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('patients', 'userId');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create doctor profile
// @route   POST /api/doctors
// @access  Private/Doctor
const createDoctor = async (req, res) => {
  try {
    const { specialization, licenseNo, schedule } = req.body;

    // Check if doctor profile already exists
    const existingDoctor = await Doctor.findOne({ userId: req.user._id });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor profile already exists' });
    }

    const doctor = await Doctor.create({
      userId: req.user._id,
      specialization,
      licenseNo,
      schedule
    });

    res.status(201).json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/:id
// @access  Private/Doctor
const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if user owns this doctor profile
    if (doctor.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedDoctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get doctor's patients
// @route   GET /api/doctors/:id/patients
// @access  Private/Doctor
const getDoctorPatients = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate({
      path: 'patients',
      populate: {
        path: 'userId',
        select: 'name email'
      }
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if user owns this doctor profile
    if (doctor.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.status(200).json(doctor.patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  getDoctorPatients,
};
