var express = require('express');
var stellaController = require('../controllers/stellarController');
var router = express.Router();

// Stellar API routes
router.post('/getBalance', stellaController.getBalance);
router.post('/createAccount', stellaController.createAccount);

router.post('/getOrders', stellaController.getOrders);
router.post('/getActiveOrders', stellaController.getActiveOrders);
router.post('/placeOrder', stellaController.placeOrder);
router.post('/cancelOrder', stellaController.cancelOrder);

router.post('/sendXLM', stellaController.sendXLM);
router.post('/sendAsset', stellaController.sendAsset);

router.post('/getTrades', stellaController.getTrades);
router.post('/getTransactionHistory', stellaController.getTransactionHistory);

router.post('/startBot', stellaController.startBot);

module.exports = router;