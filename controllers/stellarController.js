const Queue = require('bee-queue');
const StellarWrapper = require('../lib/stellarSDKWrapper');
const StellarTrader = require('../lib/stellarTrader');

exports.createAccount = async (req, res) => {
    // check 3 params of source, startingbalance
    if (!req.body.source || !req.body.startingBalance) {
        return res.json({
            msg: 'failure',
        })
    }

    // account details once create an account
    let account = await StellarWrapper.createAccount(req.body.source,
        req.body.startingBalance);

    res.json({
        msg: account ? 'success' : 'failure',
        data: account
    })
};

exports.getBalance = async (req, res) => {
    // Check accountId
    if (!req.body.accountId) {
        return res.json({
            msg: 'failure',
        })
    }

    // Get Balance from accountId
    let balances = await StellarWrapper.getBalance(req.body.accountId);

    res.json({
        msg: balances ? 'success' : 'failure',
        data: balances
    })
};

exports.sendXLM = async (req, res) => {
    // Check params to be used for transaction
    if (!req.body.source || !req.body.destination || !req.body.amount) {
        return res.json({
            msg: 'failure',
        })
    }

    // Places order and return result
    let ret = await StellarWrapper.sendXLM(req.body.source,
        req.body.destination,
        req.body.amount
    );

    res.json({
        msg: ret ? 'success' : 'failure',
        data: ret
    })
}

exports.sendAsset = async (req, res) => {
    // Check params to be used for trade
    if (!req.body.source || !req.body.destination || !req.body.asset || !req.body.amount) {
        return res.json({
            msg: 'failure',
        })
    }

    // Places order and return result
    let ret = await StellarWrapper.payment(req.body.source,
        req.body.destination,
        req.body.amount,
        req.body.asset
    );

    res.json({
        msg: ret ? 'success' : 'failure',
        data: ret
    })
}

exports.getTransactionHistory = async (req, res) => {
    // Check accountId
    if (!req.body.accountId) {
        return res.json({
            msg: 'failure',
        })
    }

    // Get transaction from accountId
    let transaction = await StellarWrapper.getTransactionHistory(req.body.accountId);

    res.json({
        msg: transaction ? 'success' : 'failure',
        data: transaction
    })
}

exports.getActiveOrders = async (req, res) => {
    // Check accountId
    if (!req.body.accountId) {
        return res.json({
            msg: 'failure',
        })
    }

    // Get active orders from accountId
    let orders = await StellarWrapper.getActiveOffers(req.body.accountId);

    res.json({
        msg: orders ? 'success' : 'failure',
        data: orders
    })
}

exports.placeOrder = async (req, res) => {
    // check 5 params of ...
    if (!req.body.source || !req.body.selling_code || !req.body.buying_code || !req.body.amount || !req.body.price) {
        return res.json({
            msg: 'failure',
        })
    }

    // return offer result 
    let offer = await StellarWrapper.createOffer(req.body.source,
        req.body.selling_code,
        req.body.selling_issuer,
        req.body.buying_code,
        req.body.buying_issuer,
        req.body.amount,
        req.body.price);

    res.json({
        msg: offer ? 'success' : 'failure',
        data: offer
    })
}

exports.cancelOrder = async (req, res) => {
    // check 5 params of ...
    if (!req.body.source || !req.body.offerId) {
        return res.json({
            msg: 'failure',
        })
    }

    // return offer result 
    let ret = await StellarWrapper.cancelOffer(req.body.source, req.body.offerId);

    res.json({
        msg: ret ? 'success' : 'failure',
        data: ret
    })
}

/**
 * Returns Asks & Bids of particular assets, 2 assets are required.
 */
exports.getOrders = async (req, res) => {
    if (!req.body.selling_code || !req.body.buying_code) {
        return res.json({
            msg: 'failure',
        });
    }

    let ret = await StellarWrapper.getOrders(
        req.body.selling_code, req.body.selling_issuer,
        req.body.buying_code, req.body.buying_issuer);

    res.json({
        msg: ret ? 'success' : 'failure',
        data: ret
    });
}

exports.getTrades = async (req, res) => {
    if (!req.body.base_code || !req.body.counter_code) {
        return res.json({
            msg: 'failure',
        });
    }

    let ret = await StellarWrapper.getTrades(
        req.body.base_code, req.body.base_issuer,
        req.body.counter_code, req.body.counter_issuer);

    res.json({
        msg: ret ? 'success' : 'failure',
        data: ret
    });
}

exports.startBot = async (req, res) => {
    // Check accountId
    if (!req.body.accountId) {
        return res.json({
            msg: 'failure',
        })
    }

    /**
     * Check state of previous bot
     * 1. Registered User
     * 2. Is registered job running
     * 3. Check Job Queue
     */

    //  ...

    /**
     * Create a new job queue if it is needed
     */
    let queue = new Queue('Identifier', {
        stallInterval: 10000,
        isWorker: true,
        // ....
    })

    let job = queue.createJob({ /* params */ });
    job.timeout(3000)
        .save()
        .then(job => {
            // Register enqueued job including job id.
            // ....
        });

    // Provide trader function to job queue
    queue.process(StellarTrader.startBot);

    /**
     * To manage jobs it needs to hook queue events like success, failed etc.
     */

    res.json({
        msg: 'success',
        data: job
    });
}