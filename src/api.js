// src/api.js

/**
 * Fetches BTC/BRL price data from Binance.
 * @returns {Promise<{currentPrice: number, openPrice: number, variation: number}|null>} An object with prices and variation, or null on failure.
 */
async function fetchFromBinance() {
  try {
    const url = 'https://data-api.binance.vision/api/v3/ticker/24hr?symbol=BTCBRL';
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Binance API status: ${response.status}`);
    const data = await response.json();
    return {
      currentPrice: parseFloat(data.lastPrice),
      openPrice: parseFloat(data.openPrice),
      variation: parseFloat(data.priceChangePercent),
    };
  } catch (error) {
    console.warn('Failed to fetch from Binance API:', error);
    return null;
  }
}

/**
 * Fetches BTC/BRL price data from Bybit.
 * @returns {Promise<{currentPrice: number, openPrice: number, variation: number}|null>} An object with prices and variation, or null on failure.
 */
async function fetchFromBybit() {
  try {
    const url = 'https://api.bybit.com/v5/market/tickers?category=spot&symbol=BTCBRL';
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Bybit API status: ${response.status}`);
    const data = await response.json();

    const ticker = data?.result?.list?.[0];
    if (!ticker || !ticker.lastPrice || !ticker.prevPrice24h || !ticker.price24hPcnt) {
      throw new Error('Bybit API response is missing required fields.');
    }

    return {
      currentPrice: parseFloat(ticker.lastPrice),
      openPrice: parseFloat(ticker.prevPrice24h),
      // Bybit returns a ratio (e.g., 0.025), so we convert it to a percentage.
      variation: parseFloat(ticker.price24hPcnt) * 100,
    };
  } catch (error) {
    console.warn('Failed to fetch from Bybit API:', error);
    return null;
  }
}

/**
 * Fetches the latest BTC/BRL price data, using Binance as the primary source and Bybit as a fallback.
 * @returns {Promise<{currentPrice: number, openPrice: number, variation: number}|null>} An object with prices and variation, or null if all sources fail.
 */
export async function fetchBtcPriceData() {
  const binanceData = await fetchFromBinance();
  if (binanceData) return binanceData;

  console.log('Binance failed, trying Bybit as a fallback...');
  return await fetchFromBybit();
}