const Verification = require('../models/Verification');
const Doctor = require('../models/Doctor');
const Pharmacy = require('../models/Pharmacy');
const Notification = require('../models/Notification');

// @desc    Get all verifications
// @route   GET /api/verifications
// @access  Private/EFDA or Admin
const getVerifications = async (req, res) => {
  try {
    const verifications = await Verification.find()
      .populate('entityId')
      .sort({ createdAt: -1 });

    res.status(200).json(verifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create verification request
// @route   POST /api/verifications
// @access  Private/Doctor or Pharmacy
const createVerification = async (req, res) => {
  try {
    const { entityType, documents } = req.body;
    let entityId;

    if (entityType === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor profile not found' });
      }
      entityId = doctor._id;
    } else if (entityType === 'pharmacy') {
      const pharmacy = await Pharmacy.findOne({ userId: req.user._id });
      if (!pharmacy) {
        return res.status(404).json({ message: 'Pharmacy profile not found' });
      }
      entityId = pharmacy._id;
    } else {
      return res.status(400).json({ message: 'Invalid entity type' });
    }

    const verification = await Verification.create({
      entityId,
      entityType,
      documents
    });

    res.status(201).json(verification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve verification
// @route   PUT /api/verifications/:id/approve
// @access  Private/EFDA or Admin
const approveVerification = async (req, res) => {
  try {
    const { remarks } = req.body;

    const verification = await Verification.findById(req.params.id);
    if (!verification) {
      return res.status(404).json({ message: 'Verification not found' });
    }

    verification.status = 'approved';
    verification.approvedBy = req.user._id;
    verification.remarks = remarks;
    await verification.save();

    // Update entity verification status
    if (verification.entityType === 'doctor') {
      await Doctor.findByIdAndUpdate(verification.entityId, { verified: true });
    } else if (verification.entityType === 'pharmacy') {
      await Pharmacy.findByIdAndUpdate(verification.entityId, { verified: true });
    }

    // Create notification
    const entity = verification.entityType === 'doctor'
      ? await Doctor.findById(verification.entityId).populate('userId')
      : await Pharmacy.findById(verification.entityId).populate('userId');

    await Notification.create({
      userId: entity.userId._id,
      message: `Your ${verification.entityType} registration has been approved`,
      type: 'verification'
    });

    res.status(200).json(verification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject verification
// @route   PUT /api/verifications/:id/reject
// @access  Private/EFDA or Admin
const rejectVerification = async (req, res) => {
  try {
    const { remarks } = req.body;

    const verification = await Verification.findById(req.params.id);
    if (!verification) {
      return res.status(404).json({ message: 'Verification not found' });
    }

    verification.status = 'rejected';
    verification.approvedBy = req.user._id;
    verification.remarks = remarks;
    await verification.save();

    // Create notification
    const entity = verification.entityType === 'doctor'
      ? await Doctor.findById(verification.entityId).populate('userId')
      : await Pharmacy.findById(verification.entityId).populate('userId');

    await Notification.create({
      userId: entity.userId._id,
      message: `Your ${verification.entityType} registration has been rejected: ${remarks}`,
      type: 'verification'
    });

    res.status(200).json(verification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getVerifications,
  createVerification,
  approveVerification,
  rejectVerification,
};
