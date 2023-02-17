const admin = require('firebase-admin');
require('dotenv').config();
const serviceAccount = {
    type: process.env.TYPE,
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
};


// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://coininterview-4bbbb.firebaseio.com'
});


const getCoinsData = async (coinIds) => {
    let coinsData = [];

    if (coinIds) {
        for (const coinId of coinIds) {
            const coinDoc = await admin
                .firestore()
                .collection('coins')
                .doc(coinId)
                .get();

            if (coinDoc.exists) {
                coinsData.push(coinDoc.data());
            }
        }
    } else {
        const coinsSnapshot = await admin
            .firestore()
            .collection('coins')
            .get();

        coinsData = coinsSnapshot.docs.map((doc) => doc.data());
    }

    return coinsData;
};

const getCoin = async (coinId) => {
    if (coinId) {
            const coinDoc = await admin
                .firestore()
                .collection('coins')
                .doc(coinId)
                .get();
            return coinDoc
    }
};

const getCoinHistory = async (coinId, limit, order) => {
    let sort = '';

    // Check if the order is specified
    if (order === 'descending') {
        sort = 'desc';
    } else if (order === 'ascending') {
        sort = 'asc';
    }

    // Get the coin history
    let coinHistorySnapshot = await admin
        .firestore()
        .collection('coin_history')
        .where('coin_id', '==', coinId)
        .orderBy('synced_on', sort || 'asc')
        .limit(limit)
        .get();

    if (coinHistorySnapshot.size < limit) {
        coinHistorySnapshot = await admin
            .firestore()
            .collection('coin_history')
            .where('coin_id', '==', coinId)
            .orderBy('synced_on', sort || 'asc')
            .limit(50)
            .get();

    }

    return coinHistorySnapshot.docs.map((doc) => doc.data());
};


const updateCoinTracking = async (coinId, isTracked) => {
    await admin
        .firestore()
        .collection('coins')
        .doc(coinId)
        .update({ tracked: isTracked, last_synced:admin.firestore.FieldValue.serverTimestamp() });
    await admin
        .firestore()
        .collection('coin_history')
        .where('coin_id','==',coinId)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                admin.firestore().collection('coin_history').doc(doc.id).update({
                    tracked: isTracked
                });
            });
        });

};

module.exports = {
    getCoinsData,
    getCoinHistory,
    updateCoinTracking,
    getCoin
};
