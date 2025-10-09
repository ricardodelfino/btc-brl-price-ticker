// src/api.js

/**
 * Fetches the current BTC price in BRL from the Binance API.
 * @returns {Promise<number|null>} The price as a number, or null if it fails.
 */
async function fetchFromBinance() {
  try {
    const url = 'https://api.binance.com/api/v3/ticker/price?symbol=BTCBRL';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Binance API responded with status: ${response.status}`);
    }
    const data = await response.json();
    return parseFloat(data.price);
  } catch (error) {
    console.warn('Failed to fetch from Binance API:', error);
    return null;
  }
}

/**
 * Fetches the current BTC price in BRL from the CoinGecko API.
 * @returns {Promise<number|null>} The price as a number, or null if it fails.
 */
async function fetchFromCoinGecko() {
  try {
    const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl';
    const response = await fetch(url);
    if (!response.ok) throw new Error(`CoinGecko API responded with status: ${response.status}`);
    const data = await response.json();
    return data?.bitcoin?.brl ?? null;
  } catch (error) {
    console.error('Failed to fetch from CoinGecko API:', error);
    return null;
  }
}

/**
 * Fetches the opening price for the current UTC day from Binance.
 * This is used as the reference for the daily price change.
 * @returns {Promise<number|null>} The opening price, or null on failure.
 */
export async function fetchDailyOpenPrice() {
  // 1. Try to get the daily open price from Binance (most accurate)
  try {
    const url = 'https://api.binance.com/api/v3/klines?symbol=BTCBRL&interval=1d&limit=1';
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Binance kline API status: ${response.status}`);
    const data = await response.json();
    const dailyKline = data[0];
    if (dailyKline) return parseFloat(dailyKline[1]);
  } catch (error) {
    console.warn('Failed to fetch daily open from Binance, falling back to CoinGecko.', error);
  }

  // 2. If Binance fails, fall back to CoinGecko
  try {
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const day = String(yesterday.getUTCDate()).padStart(2, '0');
    const month = String(yesterday.getUTCMonth() + 1).padStart(2, '0');
    const year = yesterday.getUTCFullYear();
    const url = `https://api.coingecko.com/api/v3/coins/bitcoin/history?date=${day}-${month}-${year}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`CoinGecko history API status: ${response.status}`);
    const data = await response.json();
    return data?.market_data?.current_price?.brl ?? null;
  } catch (error) {
    console.error('Fallback to CoinGecko for daily open also failed.', error);
  }

  return null; // Return null if all sources fail
}

/**
 * Fetches the BTC price, using Binance as the primary source and CoinGecko as a fallback.
 * @returns {Promise<{price: number|null, source: string}>} An object with the price and the source API.
 */
export async function fetchBtcPrice() {
  let price = await fetchFromBinance();
  if (price !== null) return { price, source: 'Binance' };

  console.warn('Binance failed for current price, falling back to CoinGecko.');
  price = await fetchFromCoinGecko();
  return { price, source: price !== null ? 'CoinGecko' : 'none' };
}