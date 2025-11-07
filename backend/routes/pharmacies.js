const express = require('express');
const {
  getPharmacies,
  getPharmacy,
  createPharmacy,
  updatePharmacy,
  getPharmacyInventory,
  addToInventory,
  updateInventory,
  removeFromInventory,
} = require('../controllers/pharmacyController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Pharmacies
 *   description: Pharmacy management
 */

/**
 * @swagger
 * /api/pharmacies:
 *   get:
 *     summary: Get all verified pharmacies
 *     tags: [Pharmacies]
 *     responses:
 *       200:
 *         description: List of pharmacies
 */
router.get('/', getPharmacies);

/**
 * @swagger
 * /api/pharmacies:
 *   post:
 *     summary: Create pharmacy profile
 *     tags: [Pharmacies]
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
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   coordinates:
 *                     type: object
 *                     properties:
 *                       lat:
 *                         type: number
 *                       lng:
 *                         type: number
 *     responses:
 *       201:
 *         description: Pharmacy profile created
 *       400:
 *         description: Profile already exists
 */
router.post('/', protect, authorize('pharmacy'), createPharmacy);

/**
 * @swagger
 * /api/pharmacies/{id}:
 *   get:
 *     summary: Get pharmacy by ID
 *     tags: [Pharmacies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Pharmacy ID
 *     responses:
 *       200:
 *         description: Pharmacy data
 *       404:
 *         description: Pharmacy not found
 */
router.get('/:id', getPharmacy);

/**
 * @swagger
 * /api/pharmacies/{id}:
 *   put:
 *     summary: Update pharmacy profile
 *     tags: [Pharmacies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Pharmacy ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   coordinates:
 *                     type: object
 *                     properties:
 *                       lat:
 *                         type: number
 *                       lng:
 *                         type: number
 *     responses:
 *       200:
 *         description: Pharmacy updated
 *       404:
 *         description: Pharmacy not found
 */
router.put('/:id', protect, authorize('pharmacy'), updatePharmacy);

/**
 * @swagger
 * /api/pharmacies/{id}/inventory:
 *   get:
 *     summary: Get pharmacy inventory
 *     tags: [Pharmacies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Pharmacy ID
 *     responses:
 *       200:
 *         description: Pharmacy inventory
 *       404:
 *         description: Pharmacy not found
 */
router.get('/:id/inventory', protect, authorize('pharmacy'), getPharmacyInventory);

/**
 * @swagger
 * /api/pharmacies/{id}/inventory:
 *   post:
 *     summary: Add medicine to inventory
 *     tags: [Pharmacies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Pharmacy ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - medicineId
 *               - quantity
 *               - price
 *             properties:
 *               medicineId:
 *                 type: string
 *               quantity:
 *                 type: number
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Medicine added to inventory
 *       404:
 *         description: Pharmacy not found
 */
router.post('/:id/inventory', protect, authorize('pharmacy'), addToInventory);

/**
 * @swagger
 * /api/pharmacies/{id}/inventory/{medicineId}:
 *   put:
 *     summary: Update inventory item
 *     tags: [Pharmacies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Pharmacy ID
 *       - in: path
 *         name: medicineId
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
 *               quantity:
 *                 type: number
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Inventory item updated
 *       404:
 *         description: Pharmacy or medicine not found
 */
router.put('/:id/inventory/:medicineId', protect, authorize('pharmacy'), updateInventory);

/**
 * @swagger
 * /api/pharmacies/{id}/inventory/{medicineId}:
 *   delete:
 *     summary: Remove medicine from inventory
 *     tags: [Pharmacies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Pharmacy ID
 *       - in: path
 *         name: medicineId
 *         required: true
 *         schema:
 *           type: string
 *         description: Medicine ID
 *     responses:
 *       200:
 *         description: Medicine removed from inventory
 *       404:
 *         description: Pharmacy not found
 */
router.delete('/:id/inventory/:medicineId', protect, authorize('pharmacy'), removeFromInventory);

module.exports = router;
