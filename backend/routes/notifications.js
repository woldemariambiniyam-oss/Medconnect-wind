const express = require('express');
const {
  getNotifications,
  markAsRead,
  deleteNotification,
  createNotification,
} = require('../controllers/notificationController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get('/', protect, getNotifications);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 */
router.put('/:id/read', protect, markAsRead);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted
 *       404:
 *         description: Notification not found
 */
router.delete('/:id', protect, deleteNotification);

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - message
 *               - type
 *             properties:
 *               userId:
 *                 type: string
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [appointment, prescription, payment, verification, general]
 *               relatedId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notification created
 */
router.post('/', protect, authorize('admin'), createNotification);

module.exports = router;
