const StellarSdk = require('stellar-sdk');
const server = new StellarSdk.Server('https://horizon.stellar.org/');
StellarSdk.Network.usePublicNetwork();

// const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
// StellarSdk.Network.useTestNetwork();

module.exports = {
    /**
     * Build Asset object from data
     * @param {string} code 
     * @param {string} issuer 
     */
    buildAsset(code, issuer) {
        return (code == 'XLM' || code == 'native') ?
            new StellarSdk.Asset.native() : new StellarSdk.Asset(code, issuer);
    },

    /**
     * returns balance of account
     * @param {string} accountId publicKey of account
     */
    getBalance(accountId) {
        return server.accounts()
            .accountId(accountId)
            .call()
            .then(res => {
                console.log(res.balances);
                return res.balances;
            })
            .catch(err => console.error(err))
    },

    /**
     * Get OrderBook from server
     * @param {Asset} selling 
     * @param {Asset} buying 
     */
    getOrderBook(selling, buying) {
        return server.orderbook(selling, buying)
            .call()
            .then(res => {
                console.log(res)
                return res;
            })
            .catch(err => {
                console.error(err);
                return err;
            });
    },

    getOrders(selling_code, selling_issuer, buying_code, buying_issuer) {
        return this.getOrderBook(
            this.buildAsset(selling_code, selling_issuer),
            this.buildAsset(buying_code, buying_issuer));
    },

    /**
     * Filter trades for a specific asset pair (orderbook)
     * @param {Asset} base 
     * @param {Asset} counter 
     * @param {string} cursor A cursor is a value that points to a specific location in a collection of resources.
     * @param {string} limit
     */
    getTrades4AssetPair(base, counter, cursor = 0, limit = 10) {
        return server.trades()
            .forAssetPair(base, counter)
            // .cursor(cursor)
            // .limit(limitCount)
            .call()
            .then(res => {
                console.log(res.records);
                return res.records;
            })
            .catch(err => err);
    },

    /**
     * Filter trades for a specific offer 
     * @param {string} offerId 
     */
    getTrades4Offer(offerId) {
        return server.trades()
            .forOffer(offerId)
            .call()
            .then(res => {
                console.log(res.records);
                return res.records;
            })
            .catch(err => err);
    },

    /**
     * Filter trades for a specific account
     * @param {string} accountId 
     */
    getTrades4Account(accountId) {
        return server.trades()
            .forAccount(accountId)
            .call()
            .then(res => {
                console.log(res.records);
                return res.records;
            })
            .catch(err => err);
    },

    getTrades(base_code, base_issuer, counter_code, counter_issuer, cursor) {
        return this.getTrades4AssetPair(
            this.buildAsset(base_code, base_issuer),
            this.buildAsset(counter_code, counter_issuer),
            cursor
        );
    },

    /**
     * Get transaction history of account 
     * @param {string} accountId 
     */
    getTransactionHistory(accountId) {
        return server.transactions()
            .forAccount(accountId)
            .call()
            .then(page => {
                console.log(page.records);
                return page.records;
            })
            .catch(err => {
                console.log(err);
                return err;
            })
    },

    /**
     * Create and fund a non existent account.
     * @param {string} source PrivateKey of funded account
     * @param {Number} startingBalance To be transfered to new account
     */
    createAccount(source, startingBalance) {
        let newKeyPair = StellarSdk.Keypair.random();
        let newPrivateKey = newKeyPair.secret();
        let newPublicKey = newKeyPair.publicKey();

        console.log(newPrivateKey, newPublicKey);

        let srcKeyPair = StellarSdk.Keypair.fromSecret(source);
        let srcPublicKey = srcKeyPair.publicKey();

        return server.loadAccount(srcPublicKey)
            .then(async (account) => {
                let transaction = new StellarSdk.TransactionBuilder(account)
                    // Add a payment operation to the transaction
                    .addOperation(StellarSdk.Operation.createAccount({
                        destination: newPublicKey,
                        startingBalance: startingBalance, //At least 1 XLM to active new account
                    }))
                    // Uncomment to add a memo (https://www.stellar.org/developers/learn/concepts/transactions.html)
                    .addMemo(StellarSdk.Memo.text('Create a new account!'))
                    .build();

                // Sign this transaction with the secret key
                transaction.sign(srcKeyPair);

                // Let's see the XDR (encoded in base64) of the transaction we just built
                console.log(transaction.toEnvelope().toXDR('base64'));

                // Submit the transaction to the Horizon server. The Horizon server will then
                // submit the transaction into the network for us.
                return await server.submitTransaction(transaction)
                    .then(function (transactionResult) {
                        console.log(JSON.stringify(transactionResult, null, 2));
                        console.log('\nSuccess! View the transaction at: ');
                        console.log(transactionResult._links.transaction.href);

                        return {
                            privateKey: newPrivateKey,
                            publicKey: newPublicKey,
                            transaction: transactionResult
                        };
                    })
                    .catch(function (err) {
                        console.log(err);
                        return err;
                    });
            })
            .catch(err => {
                console.error(err);
                return err;
            })
    },

    /**
     * Create transaction
     * @param {string} srcSecretKey 
     * @param {string} dstPublicKey 
     * @param {Number} amount 
     * @param {Any} assetId
     */
    payment(srcSecretKey, dstPublicKey, amount, asset) {
        let srcKeyPair = StellarSdk.Keypair.fromSecret(srcSecretKey);
        let srcPublicKey = srcKeyPair.publicKey();

        // Transactions require a valid sequence number that is specific to this account.
        // We can fetch the current sequence number for the source account from Horizon.
        return server.loadAccount(srcPublicKey)
            .then(async (account) => {
                let transaction = new StellarSdk.TransactionBuilder(account)
                    // Add a payment operation to the transaction
                    .addOperation(StellarSdk.Operation.payment({
                        destination: dstPublicKey,
                        asset: asset,
                        amount: amount
                    }))
                    // Uncomment to add a memo (https://www.stellar.org/developers/learn/concepts/transactions.html)
                    // .addMemo(StellarSdk.Memo.text('Hello world!'))
                    .build();

                // Sign this transaction with the secret key
                transaction.sign(srcKeyPair);

                // Let's see the XDR (encoded in base64) of the transaction we just built
                console.log(transaction.toEnvelope().toXDR('base64'));

                // Submit the transaction to the Horizon server. The Horizon server will then
                // submit the transaction into the network for us.
                return await server.submitTransaction(transaction)
                    .then(function (transactionResult) {
                        console.log(JSON.stringify(transactionResult, null, 2));
                        console.log('\nSuccess! View the transaction at: ');
                        console.log(transactionResult._links.transaction.href);

                        return transactionResult;
                    })
                    .catch(function (err) {
                        console.log('An error has occured:');
                        console.log(err);
                    });
            })
            .catch(err => {
                console.error(err);
            })
    },

    sendXLM(srcSecretKey, dstPublicKey, amount) {
        return this.payment(srcSecretKey, dstPublicKey, amount, StellarSdk.Asset.native());
    },

    /**
     * returns active orders
     * @param {string} accountId 
     */
    getActiveOffers(accountId) {
        return server.offers('accounts', accountId)
            .call()
            .then(res => {
                console.log(res)
                return res.records;
            })
            .catch(err => console.error(err));
    },

    /**
     * Place order
     * @param {string} srcSecretKey
     * @param {Asset} selling 
     * @param {Asset} buying 
     * @param {string} amount The total amount you're selling. If 0, deletes the offer.
     * @param {string} price Price of 1 unit of selling in terms of buying
     * @param {string} offerId If 0, will create a new offer (default). Otherwise, edits an exisiting offer.
     */
    manageOffer(srcSecretKey, selling, buying, amount, price, offerId) {
        let srcKeyPair = StellarSdk.Keypair.fromSecret(srcSecretKey);
        let srcPublicKey = srcKeyPair.publicKey();

        return server.loadAccount(srcPublicKey)
            .then(async (account) => {
                let transaction = new StellarSdk.TransactionBuilder(account)
                    .addOperation(StellarSdk.Operation.manageOffer({
                        selling: selling,
                        buying: buying,
                        amount: amount,
                        price: price,
                        offerId: offerId, //If 0, will create a new offer (default). Otherwise, edits an exisiting offer.
                    }))
                    .build();

                // Sign this transaction with the secret key
                transaction.sign(srcKeyPair);

                // Submit the transaction to the Horizon server. The Horizon server will then
                // submit the transaction into the network for us.
                return await server.submitTransaction(transaction)
                    .then(function (transactionResult) {
                        console.log(JSON.stringify(transactionResult, null, 2));
                        console.log('\nSuccess! View the transaction at: ');
                        console.log(transactionResult._links.transaction.href);

                        return transactionResult;
                    })
                    .catch(function (err) {
                        console.log('An error has occured:');
                        console.log(err);
                        return err;
                    });
            })
            .catch(err => console.error(err))
    },

    /**
     * Create a new offer
     * @param {string} source private key of source
     * @param {string} selling_code asset_code of selling
     * @param {string} selling_issuer asset_issuer of selling
     * @param {string} buying_code asset_code of buying
     * @param {string} buying_issuer asset_issuer of buying
     * @param {string} amount 
     * @param {string} price 
     */
    createOffer(source, selling_code, selling_issuer, buying_code, buying_issuer, amount, price) {
        let sellingAsset, buyingAsset;
        if (selling_code == 'XLM' || selling_code == 'native')
            sellingAsset = new StellarSdk.Asset.native();
        else
            sellingAsset = new StellarSdk.Asset(selling_code, selling_issuer);

        if (buying_code == 'XLM' || buying_code == 'native')
            buyingAsset = new StellarSdk.Asset.native();
        else
            buyingAsset = new StellarSdk.Asset(buying_code, buying_issuer);

        // offerId must be 0 to create order
        return this.manageOffer(source, sellingAsset, buyingAsset, amount, price, "0");
    },

    /**
     * Cancel existing offer
     * @param {string} source private key of source
     * @param {string} offerId Id of offer to be canceled
     */
    cancelOffer(source, offerId) {
        let srcKeyPair = StellarSdk.Keypair.fromSecret(source);
        let srcPublicKey = srcKeyPair.publicKey();

        return this.getActiveOffers(srcPublicKey)
            .then(async (offers) => {
                if (!offers || !offers.length) {
                    return 'No active orders';
                }

                let offer = offers.find(offer => offer.id == offerId);

                if (!offer) {
                    return 'Invalid Offer ID';
                }

                let sellingAsset, buyingAsset;
                if (offer.selling.asset_type == 'native')
                    sellingAsset = new StellarSdk.Asset.native();
                else
                    sellingAsset = new StellarSdk.Asset(offer.selling.asset_code, offer.selling.asset_issuer);

                if (offer.buying.asset_type == 'native')
                    buyingAsset = new StellarSdk.Asset.native();
                else
                    buyingAsset = new StellarSdk.Asset(offer.buying.asset_code, offer.buying.asset_issuer);

                // amount must be 0 to cancel order
                return await this.manageOffer(source, sellingAsset, buyingAsset, "0", offer.price.toString(), offerId);
            })
    },
}

/**
 * Figure out the sequence of next order
 * @param {string} accountId 
 */
exports.getSequence = (accountId) => {
    return server.accounts()
        .accountId(accountId)
        .call()
        .then(res => console.log(res.sequence))
        .catch(err => console.error(err));
}