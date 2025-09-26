// src/background.js

// Import necessary functions from other modules.
// This modular approach keeps the code organized and maintainable.
import { fetchBtcPrice } from './api.js';
import { formatPrice, formatPriceShort, formatVariation } from './utils.js';

// Define constants for easy configuration and readability.
const UPDATE_ALARM_NAME = 'update-price-alarm';
const BINANCE_TRADE_URL = 'https://www.binance.com/pt-BR/trade/BTC_BRL';

/**
 * Updates the extension's badge and tooltip with the latest Bitcoin price.
 * It fetches the current price and the price from 24 hours ago.
 */
async function updatePrice() {
  try {
    // Fetch current and yesterday's prices concurrently for efficiency.
    const [currentPriceData, yesterdayPriceData] = await Promise.all([
      fetchBtcPrice(),
      fetchBtcPrice(new Date(Date.now() - 24 * 60 * 60 * 1000))
    ]);

    const currentPrice = currentPriceData?.price;
    const yesterdayPrice = yesterdayPriceData?.price;

    // If the current price couldn't be fetched, show an error state.
    if (currentPrice === null) {
      updateUIError();
      return;
    }

    // Update the UI with the fetched prices.
    updateUISuccess(currentPrice, yesterdayPrice);

  } catch (error) {
    console.error('Error updating price:', error);
    updateUIError();
  }
}

/**
 * Updates the UI to show the fetched price information.
 * @param {number} currentPrice - The current price of BTC.
 * @param {number|null} yesterdayPrice - The price of BTC 24 hours ago.
 */
function updateUISuccess(currentPrice, yesterdayPrice) {
  // Format the price for the badge (e.g., "650k", "1.1m").
  const badgeText = formatPriceShort(currentPrice);
  chrome.action.setBadgeText({ text: badgeText });
  chrome.action.setBadgeBackgroundColor({ color: '#000000' });

  // Build the tooltip string.
  let title = `Bitcoin Price Now: ${formatPrice(currentPrice)}`;
  if (yesterdayPrice !== null) {
    const variation = ((currentPrice - yesterdayPrice) / yesterdayPrice) * 100;
    title += `\nYesterday: ${formatPrice(yesterdayPrice)}`;
    title += `\nVariation: ${formatVariation(variation)}`;
  }
  chrome.action.setTitle({ title });
}

/**
 * Updates the UI to indicate an error fetching the price.
 * Sets the badge text to "N/A".
 */
function updateUIError() {
  chrome.action.setBadgeText({ text: 'N/A' });
  chrome.action.setBadgeBackgroundColor({ color: '#FF0000' }); // Red color for error
  chrome.action.setTitle({ title: 'Could not fetch BTC price. Check your connection or API status.' });
}

/**
 * Sets up the initial state of the extension and creates the periodic alarm.
 */
function initialize() {
  // Run the update function immediately on startup.
  updatePrice();

  // Create an alarm that fires every 60 seconds to trigger a price update.
  // This is more efficient than setInterval in a service worker context.
  chrome.alarms.create(UPDATE_ALARM_NAME, {
    delayInMinutes: 1,
    periodInMinutes: 1
  });
}

// --- Event Listeners ---

// Fired when the extension is first installed, updated, or the browser starts.
chrome.runtime.onStartup.addListener(initialize);
chrome.runtime.onInstalled.addListener(initialize);

// Fired when the alarm goes off.
chrome.alarms.onAlarm.addListener((alarm) => alarm.name === UPDATE_ALARM_NAME && updatePrice());

// Fired when the user clicks the extension icon.
chrome.action.onClicked.addListener(() => chrome.tabs.create({ url: BINANCE_TRADE_URL }));