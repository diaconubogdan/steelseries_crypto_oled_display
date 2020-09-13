# Display cryptocurrency prices on your SteelSeries OLED display  

In order for this to work, you need a CoinMarketCap API key. Create a `config.json` file in the root of the project that has the keys `{apiKey: "", coins: []}`. For example:

```json
{
    "apiKey": "1234",
    "coins": ["BTC", "ETH"]
}
```
Currently tested only on Windows with a SteelSeries Apex 7 keyboard.  
Obviously, this is made just for fun. It works only if the `index.js` script is running, so porting this to an executable may be a better solution.
