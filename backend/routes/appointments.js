const express = require('express');
const {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} = require('../controllers/appointmentController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Appointment management
 */

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Get appointments
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of appointments
 *       403:
 *         description: Not authorized
 */
router.get('/', protect, getAppointments);

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Create appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctorId
 *               - date
 *               - time
 *             properties:
 *               doctorId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment created
 *       404:
 *         description: Doctor not found
 */
router.post('/', protect, authorize('patient'), createAppointment);

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Get appointment by ID
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment data
 *       404:
 *         description: Appointment not found
 */
router.get('/:id', protect, getAppointment);

/**
 * @swagger
 * /api/appointments/{id}:
 *   put:
 *     summary: Update appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, completed, cancelled]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment updated
 *       404:
 *         description: Appointment not found
 */
router.put('/:id', protect, updateAppointment);

/**
 * @swagger
 * /api/appointments/{id}:
 *   delete:
 *     summary: Delete appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment deleted
 *       404:
 *         description: Appointment not found
 */
router.delete('/:id', protect, deleteAppointment);

module.exports = router;
