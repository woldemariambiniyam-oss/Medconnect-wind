const express = require('express');
const {
  getDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  getDoctorPatients,
} = require('../controllers/doctorController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Doctors
 *   description: Doctor management
 */

/**
 * @swagger
 * /api/doctors:
 *   get:
 *     summary: Get all verified doctors
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: List of doctors
 */
router.get('/', getDoctors);

/**
 * @swagger
 * /api/doctors:
 *   post:
 *     summary: Create doctor profile
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - specialization
 *               - licenseNo
 *             properties:
 *               specialization:
 *                 type: string
 *               licenseNo:
 *                 type: string
 *               schedule:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     day:
 *                       type: string
 *                       enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *                     startTime:
 *                       type: string
 *                     endTime:
 *                       type: string
 *     responses:
 *       201:
 *         description: Doctor profile created
 *       400:
 *         description: Profile already exists
 */
router.post('/', protect, authorize('doctor'), createDoctor);

/**
 * @swagger
 * /api/doctors/{id}:
 *   get:
 *     summary: Get doctor by ID
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Doctor data
 *       404:
 *         description: Doctor not found
 */
router.get('/:id', getDoctor);

/**
 * @swagger
 * /api/doctors/{id}:
 *   put:
 *     summary: Update doctor profile
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               specialization:
 *                 type: string
 *               licenseNo:
 *                 type: string
 *               schedule:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     day:
 *                       type: string
 *                       enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *                     startTime:
 *                       type: string
 *                     endTime:
 *                       type: string
 *     responses:
 *       200:
 *         description: Doctor updated
 *       404:
 *         description: Doctor not found
 */
router.put('/:id', protect, authorize('doctor'), updateDoctor);

/**
 * @swagger
 * /api/doctors/{id}/patients:
 *   get:
 *     summary: Get doctor's patients
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: List of patients
 *       404:
 *         description: Doctor not found
 */
router.get('/:id/patients', protect, authorize('doctor'), getDoctorPatients);

module.exports = router;
