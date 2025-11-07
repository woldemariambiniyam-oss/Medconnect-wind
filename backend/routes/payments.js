const express = require('express');
const {
  initializePayment,
  verifyPayment,
  getTransactions,
  refundPayment,
} = require('../controllers/paymentController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment management
 */

/**
 * @swagger
 * /api/payments/chapa/initialize:
 *   post:
 *     summary: Initialize Chapa payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appointmentId
 *               - amount
 *               - callbackUrl
 *               - returnUrl
 *             properties:
 *               appointmentId:
 *                 type: string
 *               amount:
 *                 type: number
 *               phoneNumber:
 *                 type: string
 *               callbackUrl:
 *                 type: string
 *               returnUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment initialized
 *       404:
 *         description: Appointment not found
 */
router.post('/chapa/initialize', protect, initializePayment);

/**
 * @swagger
 * /api/payments/chapa/verify/{tx_ref}:
 *   post:
 *     summary: Verify Chapa payment
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: tx_ref
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction reference
 *     responses:
 *       200:
 *         description: Payment verified
 *       400:
 *         description: Payment verification failed
 */
router.post('/chapa/verify/:tx_ref', verifyPayment);

/**
 * @swagger
 * /api/payments/transactions:
 *   get:
 *     summary: Get user transactions
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of transactions
 */
router.get('/transactions', protect, getTransactions);

/**
 * @swagger
 * /api/payments/refund/{transactionId}:
 *   post:
 *     summary: Refund payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Payment refunded
 *       404:
 *         description: Transaction not found
 */
router.post('/refund/:transactionId', protect, authorize('admin'), refundPayment);

module.exports = router;
