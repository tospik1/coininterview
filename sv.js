const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

const callMethod = async (method, params) => {
    try {
        const response = await axios.post(API_BASE_URL + '/rpc', {
            id: 1,
            method,
            params,
        });
        if (response.data.error) {
            console.error(response.data.error);
            return;
        }

        console.log(response.data.result);
    } catch (error) {
        console.error(error.message);
    }
};

//Test Calls

async function caller(){
    console.log("--------------------");
    await callMethod('method_a',['ADA']).then(async()=>{
        console.log("--------------------1");
        await callMethod('method_a',['IIIII']).then(async()=>{
            console.log("--------------------2");
           await callMethod('method_b', ["XMR",null,"ascending"]).then(async()=>{
               console.log("--------------------3");
               await callMethod('method_b', ["ETH",undefined,"ascending"]).then(async()=>{
                   console.log("--------------------4");
                   await callMethod('method_a',['ETH,BTC']).then(async()=>{
                       console.log("--------------------5");
                       await callMethod('method_a').then(async()=>{
                           console.log("--------------------6");
                           await callMethod('method_b', ["ETH",1000,"ascending"]).then(async()=>{
                               console.log("--------------------7");
                           }).then(async()=>{
                               await callMethod('method_c', ['ETH', false]).then(async()=>{
                                   console.log("--------------------8");
                                   await callMethod('method_a', ['ETH']).then(async()=>{
                                       console.log("--------------------9");
                                       await callMethod('method_b', ["ETH"]).then(async()=>{
                                           console.log("----------------------10");
                                           await callMethod('method_b', ["XMR",2,"descending"]).then(async()=>{
                                               console.log("----------DONE----------");
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
}

module.exports = {
    caller
};