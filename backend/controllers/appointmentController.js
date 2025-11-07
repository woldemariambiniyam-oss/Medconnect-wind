const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Notification = require('../models/Notification');

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
  try {
    let query;

    // Patients can only see their own appointments
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      query = { patientId: patient._id };
    }
    // Doctors can only see their own appointments
    else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      query = { doctorId: doctor._id };
    }
    // Admins can see all appointments
    else if (req.user.role === 'admin') {
      query = {};
    } else {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'userId')
      .populate('doctorId', 'userId specialization')
      .populate('patientId.userId', 'name email')
      .populate('doctorId.userId', 'name email')
      .sort({ date: -1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'userId')
      .populate('doctorId', 'userId specialization')
      .populate('patientId.userId', 'name email')
      .populate('doctorId.userId', 'name email');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check authorization
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (appointment.patientId._id.toString() !== patient._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (appointment.doctorId._id.toString() !== doctor._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Private/Patient
const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, notes } = req.body;

    // Get patient profile
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    // Check if doctor exists and is verified
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !doctor.verified) {
      return res.status(404).json({ message: 'Doctor not found or not verified' });
    }

    const appointment = await Appointment.create({
      patientId: patient._id,
      doctorId,
      date,
      time,
      notes
    });

    // Create notification for doctor
    await Notification.create({
      userId: doctor.userId,
      message: `New appointment request from ${req.user.name}`,
      type: 'appointment',
      relatedId: appointment._id
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check authorization
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (appointment.patientId.toString() !== patient._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (appointment.doctorId.toString() !== doctor._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check authorization
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (appointment.patientId.toString() !== patient._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (appointment.doctorId.toString() !== doctor._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    await appointment.remove();
    res.status(200).json({ message: 'Appointment removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};
