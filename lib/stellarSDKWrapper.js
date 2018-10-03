"use strict";

const StellarSdk = require('stellar-sdk');
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

// StellarSdk.Network.usePublicNetwork();
StellarSdk.Network.useTestNetwork();

/**
 * returns balance of account
 * @param {string} accountId 
 */
exports.getBalance = (accountId) => {
    return server.accounts()
        .accountId(accountId)
        .call()
        .then(res => {
            console.log(res.balances);
        })
        .catch(err => console.error(err))
}

/**
 * Create and fund a non existent account.
 * @param {string} source 
 * @param {string} destination 
 * @param {Number} startingBalance To be transfered to new account
 */
exports.createAccount = (source, destination, startingBalance) => {
    // create an Account object using locally tracked sequence number
    var an_account = new StellarSdk.Account(source, "46316927324160");

    var transaction = new StellarSdk.TransactionBuilder(an_account)
        .addOperation(StellarSdk.Operation.createAccount({
            destination: destination,
            startingBalance: startingBalance // in XLM
        }))
        .build();

    transaction.sign(StellarSdk.Keypair.fromSecret(seedString)); // sign the transaction

    // transaction is now ready to be sent to the network or saved somewhere

}

/**
 * Get transaction history of account 
 * @param {string} accountId 
 */
exports.getTransactionHistory = (accountId) => {
    server.transactions()
        .forAccount(accountId)
        .call()
        .then(page => {
            console.log(page.records);
        })
        .catch(err => {
            console.log(err);
        })
}

/**
 * Create transaction
 * @param {string} srcSecretKey 
 * @param {string} dstPublicKey 
 * @param {Number} amount 
 * @param {Any} assetId
 */
exports.payment = (srcSecretKey, dstPublicKey, amount, assetId) => {
    let srcKeyPair = StellarSdk.Keypair.fromSecret(srcSecretKey);
    let srcPublicKey = srcKeyPair.publicKey();

    // Transactions require a valid sequence number that is specific to this account.
    // We can fetch the current sequence number for the source account from Horizon.
    return server.loadAccount(srcPublicKey)
        .then(account => {
            let transaction = new StellarSdk.TransactionBuilder(account)
                // Add a payment operation to the transaction
                .addOperation(StellarSdk.Operation.payment({
                    destination: dstPublicKey,
                    asset: StellarSdk.Asset.native(), //assetId
                    amount: amount,
                }))
                // Uncomment to add a memo (https://www.stellar.org/developers/learn/concepts/transactions.html)
                // .addMemo(StellarSdk.Memo.text('Hello world!'))
                .build();

            // Sign this transaction with the secret key
            // NOTE: signing is transaction is network specific. Test network transactions
            // won't work in the public network. To switch networks, use the Network object
            // as explained above (look for StellarSdk.Network).
            transaction.sign(srcKeyPair);

            // Let's see the XDR (encoded in base64) of the transaction we just built
            console.log(transaction.toEnvelope().toXDR('base64'));

            // Submit the transaction to the Horizon server. The Horizon server will then
            // submit the transaction into the network for us.
            server.submitTransaction(transaction)
                .then(function (transactionResult) {
                    console.log(JSON.stringify(transactionResult, null, 2));
                    console.log('\nSuccess! View the transaction at: ');
                    console.log(transactionResult._links.transaction.href);
                })
                .catch(function (err) {
                    console.log('An error has occured:');
                    console.log(err);
                });
        })
        .catch(err => {
            console.error(err);
        })
}

/**
 * Get OrderBook from server
 * @param {Asset} selling 
 * @param {Asset} buying 
 */
exports.getOrders = (selling, buying) => {
    return server.orderbook(selling, buying)
        .call()
        .then(res => {
            console.log(res)
        })
        .catch(err => console.error(err));
}

/**
 * returns active orders
 * @param {string} accountId 
 */
exports.getActiveOrders = (accountId) => {
    return server.offers('accounts', accountId)
        .call()
        .then(res => {
            console.log(res)
        })
        .catch(err => console.error(err));
}

/**
 * 
 */
exports.cancelOrder = () => {
    // ...
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

/**
 * Place Order
 * @param {string} source 
 * @param {string} destination 
 * @param {Asset} asset 
 * @param {Number} amount 
 */
exports.manageOffer = (accountId, selling, buying, amount, price, offerId = 0) => {
    return server.loadAccount(accountId)
        .then(account => {
            let transaction = new StellarSdk.TransactionBuilder(account)
                .addOperation(StellarSdk.Operation.manageOffer({
                    selling: selling,
                    buying: buying,
                    amount: amount,
                    price: price,
                    offerId: offerId, //If 0, will create a new offer (default). Otherwise, edits an exisiting offer.
                }))
                .build();

            // Submit the transaction to the Horizon server. The Horizon server will then
            // submit the transaction into the network for us.
            server.submitTransaction(transaction)
                .then(function (transactionResult) {
                    console.log(JSON.stringify(transactionResult, null, 2));
                    console.log('\nSuccess! View the transaction at: ');
                    console.log(transactionResult._links.transaction.href);
                })
                .catch(function (err) {
                    console.log('An error has occured:');
                    console.log(err);
                });
        })
        .catch(err => console.error(err))


}