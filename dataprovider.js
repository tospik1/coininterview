const axios = require('axios');
require('dotenv').config();
const admin = require('firebase-admin');
const { getCoin} = require('./firestore');

// If the free tier request amount is exceeded you can another api for data requests

//If you change to coinpaprike you need to adjust the code in order to handle requests and responses!

//const COIN_API_BASE_URL = 'https://api.coinpaprika.com/v1/tickers';

const COIN_API_BASE_URL = 'https://min-api.cryptocompare.com/data/price';

const getCurrentPrice = async (symbol) => {
    const response = await axios.get(`${COIN_API_BASE_URL}?fsym=${symbol}&tsyms=USD&api_key=6d83d637a30a6f9cc15ebd24f3c91f1be41aa3f84433e12277beba1fe1d1490b`);
    return response.data.USD;
};


const updateCoinHistory = async (coinId, symbol) => {
    const currentPrice = await getCurrentPrice(symbol);

    // Get all existing document IDs in the coin_history collection
    const snapshot = await admin.firestore().collection('coin_history').get();
    let existingDocumentIDs = snapshot.docs.map(doc => parseInt(doc.id) );
    if(existingDocumentIDs === null || existingDocumentIDs === undefined){
        existingDocumentIDs = 0;
    }
    // Start a transaction to update the coin_history collection
    await admin.firestore().runTransaction(async t => {
        // Generate a new document ID by incrementing the maximum value of the existing document IDs
        const newDocumentID = (existingDocumentIDs.length > 0 ? Math.max(...existingDocumentIDs) : 0) + 1;
        const coinDoc = await getCoin(coinId)
        const docData = coinDoc.data()
        let tracked = docData.tracked
        // Update the coin_history collection with the new document
        await t.set(admin.firestore().collection('coin_history').doc(newDocumentID.toString()), {
            coin_id: coinId,
            price: currentPrice,
            name: symbol,
            tracked: tracked,
            synced_on: admin.firestore.Timestamp.now(),
        }, { merge: true });

        console.log("Coin History updated", newDocumentID, coinId, symbol, currentPrice);
    });
};

const updateCoinInformationWithTracked = async (coinId, symbol,tracked) => {
    try {
        const currentPrice = await getCurrentPrice(symbol);
        await admin
            .firestore()
            .collection('coins')
            .doc(coinId)
            .set({
                id:coinId,
                name:symbol, //If we use crypto compare to obtain data, we cannot get the name of the coin, instead we get an object and there is no name in it. For example: we get BTC for bitcoin in symbol and as name object as well. So I decided to use symbol for both name and symbol.
                symbol:symbol,
                price: currentPrice,
                last_synced: admin.firestore.FieldValue.serverTimestamp(),
                tracked: tracked, // set tracked to the generated boolean value
            }, { merge: true });
        console.log("Coin updated", coinId, symbol, currentPrice);
    } catch (error) {
        console.error(error.message);
    }
};

module.exports = { updateCoinInformationWithTracked, updateCoinHistory };
