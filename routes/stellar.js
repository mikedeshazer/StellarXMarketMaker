var express = require('express');
var stellaController = require('../controllers/stellarController');
var router = express.Router();

// Stellar API routes
router.post('/createAccount', stellaController.createAccount);
router.post('/getBalance', stellaController.getBalance);
router.post('/sendXLM', stellaController.sendXLM);
router.post('/placeOrder', stellaController.placeOrder);
router.post('/cancelOrder', stellaController.cancelOrder);
router.post('/sendAsset', stellaController.sendAsset);
router.post('/startBot', stellaController.startBot);
router.post('/getActiveOrders', stellaController.getActiveOrders);
router.post('/getTransactionHistory', stellaController.getTransactionHistory);

module.exports = router;