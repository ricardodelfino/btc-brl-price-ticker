// src/api.js

/**
 * Fetches the BTC price in BRL from the Binance API.
 * @returns {Promise<number|null>} The price as a number, or null if it fails.
 */
async function fetchFromBinance() {
  try {
    const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCBRL');
    if (!response.ok) {
      throw new Error(`Binance API responded with status: ${response.status}`);
    }
    const data = await response.json();
    return parseFloat(data.price);
  } catch (error) {
    console.warn('Failed to fetch from Binance API:', error);
    return null; // Return null to indicate failure, allowing fallback.
  }
}

/**
 * Fetches historical or current BTC price in BRL from the CoinGecko API.
 * @param {Date|null} date - The date for historical price, or null for current price.
 * @returns {Promise<number|null>} The price as a number, or null if it fails.
 */
async function fetchFromCoinGecko(date = null) {
  try {
    let url;
    if (date) {
      // Format date as dd-mm-yyyy for CoinGecko's history endpoint.
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      url = `https://api.coingecko.com/api/v3/coins/bitcoin/history?date=${day}-${month}-${year}`;
    } else {
      url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl';
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`CoinGecko API responded with status: ${response.status}`);
    }
    const data = await response.json();

    // The data structure is different for current vs. historical queries.
    if (date) {
      return data?.market_data?.current_price?.brl ?? null;
    }
    return data?.bitcoin?.brl ?? null;

  } catch (error) {
    console.error('Failed to fetch from CoinGecko API:', error);
    return null;
  }
}

/**
 * Fetches the BTC price, using Binance as the primary source and CoinGecko as a fallback.
 * If a date is provided, it fetches the historical price from CoinGecko.
 * @param {Date|null} date - Optional date for historical data. If null, fetches current price.
 * @returns {Promise<{price: number|null, source: string}>} An object with the price and the source API.
 */
export async function fetchBtcPrice(date = null) {
  // For historical data, CoinGecko is the only source.
  if (date) {
    const price = await fetchFromCoinGecko(date);
    return { price, source: 'CoinGecko' };
  }

  // For current price, try Binance first.
  let price = await fetchFromBinance();
  if (price !== null) {
    return { price, source: 'Binance' };
  }

  // If Binance fails, fall back to CoinGecko.
  console.log('Binance failed, falling back to CoinGecko.');
  price = await fetchFromCoinGecko();
  return { price, source: price !== null ? 'CoinGecko' : 'none' };
}