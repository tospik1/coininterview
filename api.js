const express = require('express');
const bodyParser = require('body-parser');
const { getCoinsData, getCoinHistory, updateCoinTracking } = require('./firestore');
const { caller } = require('./sv');
const app = express();
app.use(bodyParser.json());

const dataprovider = require('./dataprovider')

// JSON-RPC 2.0 endpoint
app.post('/rpc', async (req, res) => {
    const { method, params, id } = req.body;
    switch (method) {
        case 'method_a':
            try {
                const coins = params && params[0] ? params[0].split(',') : [];
                let coinsData;

                if (coins.length === 0) {
                    coinsData = await getCoinsData();
                } else {
                    coinsData = await getCoinsData(coins);
                }
                if (coinsData.length === 0) {
                    res.json({
                        id,
                        error: { code: -32604, message: 'Coin not found' },
                    });
                    return;
                }

                const result = coinsData.map((coinData) => ({
                    id: coinData.id,
                    name: coinData.name,
                    symbol: coinData.symbol,
                    tracked: coinData.tracked,
                    price: coinData.price,
                    last_synced: coinData.last_synced
                }));
                result.forEach(item => {
                    if (item.tracked === false) {
                        delete item.price;
                        delete item.last_synced;
                    }
                });

                res.json({ id, result: coins.length === 1 ? result[0] : result });
            } catch (error) {
                res.json({ id, error: { code: -32603, message: error.message } });
            }
            break;
        case 'method_b':
            try {
                if (!params || !params[0]) {
                    res.json({
                        id,
                        error: { code: -32602, message: 'Invalid params' },
                    });
                    return;
                }

                const coinId = params[0];
                let limit = params[1] || 10;
                let order = params[2];

                let data = await getCoinHistory(coinId, limit, order);

                if (!data || !data[0] || data[0].tracked === false) {
                    if (!data) {
                        res.json({
                            id,
                            result: []
                        });
                        return;
                    }

                    const result = data.slice(0, Math.min(data.length, 10));
                    res.json({ id, result });
                    return;
                }

                if (!data) {
                    res.json({
                        id,
                        error: { code: -32604, message: 'Coin not found' },
                    });
                    return;
                }
                const result = data.slice(0, limit);
                res.json({ id, result });
            } catch (error) {
                res.json({ id, error: { code: -32603, message: error.message } });
            }
            break;


        case 'method_c':
            try {
                if (!params || !params[0] || typeof params[1] !== 'boolean') {
                    res.json({
                        id,
                        error: { code: -32602, message: 'Invalid params' },
                    });
                    return;
                }
                const coinId = params[0];
                const isTracked = params[1];
                await updateCoinTracking(coinId, isTracked);
                res.json({ id, result: { message: 'Ok' } });
            } catch (error) {
                res.json({ id, error: { code: -32603, message: error.message } });
            }
            break;
        default:
            res.json({
                id,
                error: { code: -32601, message: 'Method not found' },
            });
    }
});

async function onStart(){
    dataprovider.updateCoinInformationWithTracked('BTC', 'BTC',true);
    dataprovider.updateCoinInformationWithTracked('ETH', 'ETH',true);
    dataprovider.updateCoinInformationWithTracked('XRP', 'XRP',true);
    dataprovider.updateCoinInformationWithTracked('BNB', 'BNB',true);
    dataprovider.updateCoinInformationWithTracked('ADA', 'ADA',true);
    dataprovider.updateCoinInformationWithTracked('USDC', 'USDC',false);
    dataprovider.updateCoinInformationWithTracked('LINK', 'LINK',false);
    dataprovider.updateCoinInformationWithTracked('OP', 'OP',false);
    dataprovider.updateCoinInformationWithTracked('GALA', 'GALA',false);
    dataprovider.updateCoinInformationWithTracked('ATOM', 'ATOM',false);
    dataprovider.updateCoinInformationWithTracked('SAND', 'SAND',false);
    dataprovider.updateCoinInformationWithTracked('AVAX', 'AVAX',false);
    dataprovider.updateCoinInformationWithTracked('DREP', 'DREP',false);
    dataprovider.updateCoinInformationWithTracked('TRX', 'TRX',false);
    dataprovider.updateCoinInformationWithTracked('ETC', 'ETC',false);
    dataprovider.updateCoinInformationWithTracked('XMR', 'XMR',false);
    dataprovider.updateCoinInformationWithTracked('AXS', 'AXS',false);
    dataprovider.updateCoinInformationWithTracked('APE', 'APE',false);
    dataprovider.updateCoinInformationWithTracked('EOS', 'EOS',false);
    dataprovider.updateCoinInformationWithTracked('GMT', 'GMT',false);

        await dataprovider.updateCoinHistory('EOS', 'EOS').then(async()=>{
            await dataprovider.updateCoinHistory('GMT', 'GMT').then(async()=>{
                await  dataprovider.updateCoinHistory('APE', 'APE').then(async()=>{
                    await  dataprovider.updateCoinHistory('AXS', 'AXS').then(async()=>{
                        await dataprovider.updateCoinHistory('XMR', 'XMR').then(async()=>{
                            await dataprovider.updateCoinHistory('ETC', 'ETC').then(async()=>{
                                await dataprovider.updateCoinHistory('TRX', 'TRX').then(async()=>{
                                    await dataprovider.updateCoinHistory('DREP', 'DREP').then(async()=>{
                                        await dataprovider.updateCoinHistory('AVAX', 'AVAX').then(async()=>{
                                            await dataprovider.updateCoinHistory('SAND', 'SAND').then(async ()=>{
                                                await dataprovider.updateCoinHistory('ATOM', 'ATOM').then(async()=>{
                                                    await dataprovider.updateCoinHistory('GALA', 'GALA').then(async()=>{
                                                        await dataprovider.updateCoinHistory('OP', 'OP').then(async()=>{
                                                            await dataprovider.updateCoinHistory('LINK', 'LINK').then(async()=>{
                                                                await dataprovider.updateCoinHistory('USDC', 'USDC').then(async()=>{
                                                                    await dataprovider.updateCoinHistory('ADA', 'ADA').then(async()=>{
                                                                        await dataprovider.updateCoinHistory('BNB', 'BNB').then(async()=>{
                                                                            await dataprovider.updateCoinHistory('XRP', 'XRP').then(async()=> {
                                                                                await dataprovider.updateCoinHistory('ETH', 'ETH').then(async()=>{
                                                                                    await dataprovider.updateCoinHistory('BTC', 'BTC');
                                                                                })
                                                                            })
                                                                        })
                                                                    })
                                                                } )
                                                            })
                                                        })
                                                    } )
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    setTimeout(async () => {
        // Call the caller function
        await caller();
    }, 3000);
}

onStart()

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`JSON-RPC 2.0 endpoint listening on port ${port}`);
});