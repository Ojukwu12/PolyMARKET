const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const adminAuth = require('../middleware/adminAuth');

router.get('/metrics', adminAuth, adminController.metrics);
router.post('/refresh', adminAuth, adminController.refresh);

module.exports = router;
