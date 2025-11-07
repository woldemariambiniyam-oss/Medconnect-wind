const express = require('express');
const {
  getPrescriptions,
  getPrescription,
  createPrescription,
  updatePrescription,
  deletePrescription,
} = require('../controllers/prescriptionController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Prescriptions
 *   description: Prescription management
 */

/**
 * @swagger
 * /api/prescriptions:
 *   get:
 *     summary: Get prescriptions
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of prescriptions
 *       403:
 *         description: Not authorized
 */
router.get('/', protect, getPrescriptions);

/**
 * @swagger
 * /api/prescriptions:
 *   post:
 *     summary: Create prescription
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - medicines
 *             properties:
 *               patientId:
 *                 type: string
 *               medicines:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - medicineId
 *                     - dosage
 *                     - frequency
 *                     - duration
 *                     - quantity
 *                   properties:
 *                     medicineId:
 *                       type: string
 *                     dosage:
 *                       type: string
 *                     frequency:
 *                       type: string
 *                     duration:
 *                       type: string
 *                     quantity:
 *                       type: number
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Prescription created
 *       404:
 *         description: Patient not found
 */
router.post('/', protect, authorize('doctor'), createPrescription);

/**
 * @swagger
 * /api/prescriptions/{id}:
 *   get:
 *     summary: Get prescription by ID
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Prescription ID
 *     responses:
 *       200:
 *         description: Prescription data
 *       404:
 *         description: Prescription not found
 */
router.get('/:id', protect, getPrescription);

/**
 * @swagger
 * /api/prescriptions/{id}:
 *   put:
 *     summary: Update prescription
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Prescription ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               medicines:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     medicineId:
 *                       type: string
 *                     dosage:
 *                       type: string
 *                     frequency:
 *                       type: string
 *                     duration:
 *                       type: string
 *                     quantity:
 *                       type: number
 *               status:
 *                 type: string
 *                 enum: [active, completed, cancelled]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Prescription updated
 *       404:
 *         description: Prescription not found
 */
router.put('/:id', protect, authorize('doctor'), updatePrescription);

/**
 * @swagger
 * /api/prescriptions/{id}:
 *   delete:
 *     summary: Delete prescription
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Prescription ID
 *     responses:
 *       200:
 *         description: Prescription deleted
 *       404:
 *         description: Prescription not found
 */
router.delete('/:id', protect, authorize('doctor'), deletePrescription);

module.exports = router;
