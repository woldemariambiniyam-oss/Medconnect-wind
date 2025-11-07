const Transaction = require('../models/Transaction');
const Appointment = require('../models/Appointment');
const axios = require('axios');

// @desc    Initialize Chapa payment
// @route   POST /api/payments/chapa/initialize
// @access  Private
const initializePayment = async (req, res) => {
  try {
    const { appointmentId, amount, callbackUrl, returnUrl } = req.body;

    // Check if appointment exists and belongs to user
    const appointment = await Appointment.findById(appointmentId).populate('patientId');
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.patientId.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Chapa API integration
    const chapaPayload = {
      amount: amount,
      currency: 'ETB',
      email: req.user.email,
      first_name: req.user.name.split(' ')[0],
      last_name: req.user.name.split(' ')[1] || '',
      phone_number: req.body.phoneNumber,
      tx_ref: `txn-${Date.now()}`,
      callback_url: callbackUrl,
      return_url: returnUrl,
      customization: {
        title: 'Medconnect-wind Payment',
        description: 'Appointment payment'
      }
    };

    const chapaResponse = await axios.post('https://api.chapa.co/v1/transaction/initialize', chapaPayload, {
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (chapaResponse.data.status === 'success') {
      // Create transaction record
      const transaction = await Transaction.create({
        userId: req.user._id,
        amount,
        chapaRef: chapaPayload.tx_ref,
        type: 'appointment',
        appointmentId
      });

      res.status(200).json({
        checkoutUrl: chapaResponse.data.data.checkout_url,
        transactionId: transaction._id
      });
    } else {
      res.status(400).json({ message: 'Payment initialization failed' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Chapa payment
// @route   POST /api/payments/chapa/verify/:tx_ref
// @access  Public (Chapa webhook)
const verifyPayment = async (req, res) => {
  try {
    const { tx_ref } = req.params;

    // Verify with Chapa
    const chapaResponse = await axios.get(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`
      }
    });

    if (chapaResponse.data.status === 'success') {
      // Update transaction status
      const transaction = await Transaction.findOneAndUpdate(
        { chapaRef: tx_ref },
        { status: 'completed' },
        { new: true }
      );

      if (transaction) {
        // Update appointment payment status
        await Appointment.findByIdAndUpdate(transaction.appointmentId, {
          paymentStatus: 'paid'
        });
      }

      res.status(200).json({ message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ message: 'Payment verification failed' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user transactions
// @route   GET /api/payments/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id })
      .populate('appointmentId')
      .sort({ createdAt: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Refund payment
// @route   POST /api/payments/refund/:transactionId
// @access  Private/Admin
const refundPayment = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.transactionId);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Update transaction status
    transaction.status = 'refunded';
    await transaction.save();

    // Update appointment payment status
    if (transaction.appointmentId) {
      await Appointment.findByIdAndUpdate(transaction.appointmentId, {
        paymentStatus: 'refunded'
      });
    }

    res.status(200).json({ message: 'Payment refunded successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  initializePayment,
  verifyPayment,
  getTransactions,
  refundPayment,
};
