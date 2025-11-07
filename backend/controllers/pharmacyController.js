const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');

// @desc    Get all pharmacies
// @route   GET /api/pharmacies
// @access  Public
const getPharmacies = async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find({ verified: true })
      .populate('userId', 'name email')
      .select('-inventory');
    res.status(200).json(pharmacies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single pharmacy
// @route   GET /api/pharmacies/:id
// @access  Public
const getPharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('inventory.medicineId', 'name description price');

    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    res.status(200).json(pharmacy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create pharmacy profile
// @route   POST /api/pharmacies
// @access  Private/Pharmacy
const createPharmacy = async (req, res) => {
  try {
    const { name, address } = req.body;

    // Check if pharmacy profile already exists
    const existingPharmacy = await Pharmacy.findOne({ userId: req.user._id });
    if (existingPharmacy) {
      return res.status(400).json({ message: 'Pharmacy profile already exists' });
    }

    const pharmacy = await Pharmacy.create({
      userId: req.user._id,
      name,
      address
    });

    res.status(201).json(pharmacy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update pharmacy profile
// @route   PUT /api/pharmacies/:id
// @access  Private/Pharmacy
const updatePharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);

    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    // Check if user owns this pharmacy profile
    if (pharmacy.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedPharmacy = await Pharmacy.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedPharmacy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pharmacy inventory
// @route   GET /api/pharmacies/:id/inventory
// @access  Private/Pharmacy
const getPharmacyInventory = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id).populate('inventory.medicineId', 'name description price category manufacturer expiryDate');

    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    // Check if user owns this pharmacy profile
    if (pharmacy.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.status(200).json(pharmacy.inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add medicine to inventory
// @route   POST /api/pharmacies/:id/inventory
// @access  Private/Pharmacy
const addToInventory = async (req, res) => {
  try {
    const { medicineId, quantity, price } = req.body;

    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    // Check if user owns this pharmacy profile
    if (pharmacy.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Check if medicine already exists in inventory
    const existingItem = pharmacy.inventory.find(item => item.medicineId.toString() === medicineId);

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.price = price;
    } else {
      pharmacy.inventory.push({ medicineId, quantity, price });
    }

    await pharmacy.save();

    // Update medicine quantity in Medicine collection
    await Medicine.findByIdAndUpdate(medicineId, { $inc: { quantity } });

    res.status(200).json(pharmacy.inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update inventory item
// @route   PUT /api/pharmacies/:id/inventory/:medicineId
// @access  Private/Pharmacy
const updateInventory = async (req, res) => {
  try {
    const { quantity, price } = req.body;

    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    // Check if user owns this pharmacy profile
    if (pharmacy.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const item = pharmacy.inventory.find(item => item.medicineId.toString() === req.params.medicineId);
    if (!item) {
      return res.status(404).json({ message: 'Medicine not found in inventory' });
    }

    item.quantity = quantity;
    item.price = price;

    await pharmacy.save();
    res.status(200).json(pharmacy.inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove medicine from inventory
// @route   DELETE /api/pharmacies/:id/inventory/:medicineId
// @access  Private/Pharmacy
const removeFromInventory = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    // Check if user owns this pharmacy profile
    if (pharmacy.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    pharmacy.inventory = pharmacy.inventory.filter(item => item.medicineId.toString() !== req.params.medicineId);

    await pharmacy.save();
    res.status(200).json(pharmacy.inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPharmacies,
  getPharmacy,
  createPharmacy,
  updatePharmacy,
  getPharmacyInventory,
  addToInventory,
  updateInventory,
  removeFromInventory,
};
