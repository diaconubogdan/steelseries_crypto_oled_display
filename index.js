const fs = require('fs');
const axios = require('axios');
const config = require('./config.json');
const apiKey = config.apiKey;
const coins = config.coins;
let cryptoPrices = {};

coins.forEach(coin => {
    cryptoPrices[coin] = "";
});

let coreProps;

if(process.platform === 'win32') {
    coreProps = require(`${process.env.PROGRAMDATA}/SteelSeries/SteelSeries Engine 3/coreProps.json`);
} else if (process.platform === 'darwn') {
    coreProps = require(`/Library/Application Support/SteelSeries Engine 3/coreProps.json`);
}

if(!coreProps) {
    throw new Error('coreProps.json file is misssing.');
}

const address = coreProps.address;

if(!address) {
    throw new Error('address is missing from your coreProps.json file');
}

let bindGameEvent = () => {

    const endpoint = `http://${address}/bind_game_event`;

    const payload = {
        "game": "CRYPTO_PRICE",
        "event": "REFRESH",
        "handlers": [
            {
                "device-type": "keyboard",
                "mode": "screen",
                "zone": "one",
                "datas": [
                    {
                        "has-text": true,
                        "context-frame-key": "text",
                        "length-millis": 3000
                    }
                ]
            }
        ]
    }

    return axios.post(endpoint, payload);
}

let display = (text) => {
    const endpoint = `http://${address}/game_event`;

    const payload = {
        "game": "CRYPTO_PRICE",
        "event": "REFRESH",
        "data": {
            "value": counter,
            "has-text": true,
            "context-frame-key": "text",
            "length-millis": 3000,
            "frame": {
                "text": text
            }
        }
    }

    return axios.post(endpoint, payload);
};

let formatNumber = (number) => {
    return new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(number); 
}

let getCryptoPrices = () => {
    const endpoint = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest`;

    const options = {
        method: 'GET',
        url: endpoint,
        json: true,
        headers: {
            'X-CMC_PRO_API_KEY': apiKey
        }
    };

    return axios(options).then(r => {
        Object.keys(cryptoPrices).forEach(crypto => {
            let cryptoAPIObj = r.data.data.find(x => x.symbol == crypto.toUpperCase());
            cryptoPrices[crypto] = formatNumber(cryptoAPIObj.quote.USD.price);
        });

        return true;
    })
}

let refreshCryptoPrices = () => {
    return getCryptoPrices();
};

let counter = 0;

let rotateCryptoPrices = () => {
    let cryptoIndex = counter % Object.keys(cryptoPrices).length;
    let cryptoName = Object.keys(cryptoPrices)[cryptoIndex];
    let cryptoPrice = cryptoPrices[cryptoName];

    let text = `${cryptoName}: ${cryptoPrice}`;

    counter++;

    console.log(`Showing price for ${cryptoName}`);

    return display(text);
}

let main = () => {
    return bindGameEvent().then((r) => {
        return refreshCryptoPrices();
    }).then(() => {

        rotateCryptoPrices();
        
        setInterval(() => {
            refreshCryptoPrices();
        }, 15000)

        setInterval(() => {
            rotateCryptoPrices();
        }, 3000)
        
    }).catch(e => {
        console.error(e);
        throw e;
    })
}

main();