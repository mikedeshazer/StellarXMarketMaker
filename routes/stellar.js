var express = require('express');
var stellaController = require('../controllers/stellarController');
var router = express.Router();

// Stellar API routes
router.post('/placeOrder', stellaController.placeOrder);
router.post('/sendAsset', stellaController.sendAsset);
router.post('/createAccount', stellaController.createAccount);
router.post('/seeBalance', stellaController.getBalance);
router.post('/startBot', stellaController.startBot);
router.post('/getActiveOrders', stellaController.getActiveOrders);
router.post('/getOrderHistory', stellaController.getTransactionHistory);

module.exports = router;