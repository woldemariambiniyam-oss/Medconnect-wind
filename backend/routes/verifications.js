const express = require('express');
const {
  getVerifications,
  createVerification,
  approveVerification,
  rejectVerification,
} = require('../controllers/verificationController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Verifications
 *   description: Verification management
 */

/**
 * @swagger
 * /api/verifications:
 *   get:
 *     summary: Get all verifications
 *     tags: [Verifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of verifications
 */
router.get('/', protect, authorize('efda', 'admin'), getVerifications);

/**
 * @swagger
 * /api/verifications:
 *   post:
 *     summary: Create verification request
 *     tags: [Verifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - entityType
 *             properties:
 *               entityType:
 *                 type: string
 *                 enum: [doctor, pharmacy]
 *               documents:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                     url:
 *                       type: string
 *     responses:
 *       201:
 *         description: Verification request created
 *       400:
 *         description: Invalid entity type
 */
router.post('/', protect, authorize('doctor', 'pharmacy'), createVerification);

/**
 * @swagger
 * /api/verifications/{id}/approve:
 *   put:
 *     summary: Approve verification
 *     tags: [Verifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Verification ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification approved
 *       404:
 *         description: Verification not found
 */
router.put('/:id/approve', protect, authorize('efda', 'admin'), approveVerification);

/**
 * @swagger
 * /api/verifications/{id}/reject:
 *   put:
 *     summary: Reject verification
 *     tags: [Verifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Verification ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification rejected
 *       404:
 *         description: Verification not found
 */
router.put('/:id/reject', protect, authorize('efda', 'admin'), rejectVerification);

module.exports = router;
