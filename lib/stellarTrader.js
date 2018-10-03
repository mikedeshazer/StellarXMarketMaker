"use strict";

const async = require('async');
const StellarWrapper = require('./stellarSDKWrapper');

/**
 * Procedure of Stellar Trader
 * @param {Object} job 
 */
exports.startBot = async (job) => {
    console.log(`Processing job ${job.id}`);

    // Trader workflow
    async.forever(
        (_callback) => {
            // Check runnable state to stop & continue
            // ...

            // continue trading
            async.parallel([
                // Get balance of account and required amount of asset
                // Update Orders and Cancel expired orders 
            ], (err) => {
                if (err) {
                    // wait for next trade
                  
                }

                // Check market and volatility of previous trades
                // do something if the conditions is not met

                if (_mode) { // BIDS
                    marketMaker(_mode, _callback);
                } else { // ASKS
                    marketMaker(_mode, _callback);
                }
            })
        },
        (err) => {
            // Stops Trading if any error has occured
        }
    )
}

/**
 * Procedure for Market maker 
 * @param {bool} _mode Buy Or Sell
 */
exports.marketMaker = (_mode) => {
    // Time to place order
    async.waterfall([
        // Get Sequence of Order
        // Figure out the price and amount of Order
        // Place order using StellarSDKWrapper
    ], (err) => {
        // Process exceptions
        // wait for next trade
        
    })

    // Manage state of Trader 
}