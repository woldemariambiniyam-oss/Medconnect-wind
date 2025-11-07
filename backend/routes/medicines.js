const express = require('express');
const {
  getMedicines,
  getMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} = require('../controllers/medicineController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Medicines
 *   description: Medicine management
 */

/**
 * @swagger
 * /api/medicines:
 *   get:
 *     summary: Get all medicines
 *     tags: [Medicines]
 *     responses:
 *       200:
 *         description: List of medicines
 */
router.get('/', getMedicines);

/**
 * @swagger
 * /api/medicines:
 *   post:
 *     summary: Create medicine
 *     tags: [Medicines]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               manufacturer:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Medicine created
 */
router.post('/', protect, authorize('pharmacy'), createMedicine);

/**
 * @swagger
 * /api/medicines/{id}:
 *   get:
 *     summary: Get medicine by ID
 *     tags: [Medicines]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Medicine ID
 *     responses:
 *       200:
 *         description: Medicine data
 *       404:
 *         description: Medicine not found
 */
router.get('/:id', getMedicine);

/**
 * @swagger
 * /api/medicines/{id}:
 *   put:
 *     summary: Update medicine
 *     tags: [Medicines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Medicine ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               manufacturer:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Medicine updated
 *       404:
 *         description: Medicine not found
 */
router.put('/:id', protect, authorize('pharmacy'), updateMedicine);

/**
 * @swagger
 * /api/medicines/{id}:
 *   delete:
 *     summary: Delete medicine
 *     tags: [Medicines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Medicine ID
 *     responses:
 *       200:
 *         description: Medicine deleted
 *       404:
 *         description: Medicine not found
 */
router.delete('/:id', protect, authorize('pharmacy'), deleteMedicine);

module.exports = router;
