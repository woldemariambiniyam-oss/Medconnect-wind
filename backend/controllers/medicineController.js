const Medicine = require('../models/Medicine');

// @desc    Get all medicines
// @route   GET /api/medicines
// @access  Public
const getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find();
    res.status(200).json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single medicine
// @route   GET /api/medicines/:id
// @access  Public
const getMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.status(200).json(medicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create medicine
// @route   POST /api/medicines
// @access  Private/Pharmacy
const createMedicine = async (req, res) => {
  try {
    const { name, description, price, category, manufacturer, expiryDate } = req.body;

    const medicine = await Medicine.create({
      name,
      description,
      price,
      category,
      manufacturer,
      expiryDate
    });

    res.status(201).json(medicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update medicine
// @route   PUT /api/medicines/:id
// @access  Private/Pharmacy
const updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.status(200).json(medicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete medicine
// @route   DELETE /api/medicines/:id
// @access  Private/Pharmacy
const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    await medicine.remove();
    res.status(200).json({ message: 'Medicine removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMedicines,
  getMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine,
};
