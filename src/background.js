// src/background.js

// Import necessary functions from other modules.
import { fetchBtcPrice, fetchDailyOpenPrice } from './api.js';
import { formatPrice, formatPriceShort, formatVariation } from './utils.js';

// Define constants for easy configuration and readability.
const UPDATE_ALARM_NAME = 'update-price-alarm';
const BINANCE_TRADE_URL = 'https://www.binance.com/pt-BR/trade/BTC_BRL';
const ACTIVE_UPDATE_PERIOD_MINUTES = 1;
const IDLE_UPDATE_PERIOD_MINUTES = 5;

/**
 * Gets the daily open price, using a cached value if available for the current UTC day.
 * Fetches and caches the price if it's a new day or the cache is empty.
 * @returns {Promise<number|null>} The opening price for the current UTC day.
 */
async function getDailyOpenPrice() {
  const todayUTC = new Date().toISOString().slice(0, 10); // Get 'YYYY-MM-DD'
  const cache = await chrome.storage.local.get(['dailyOpenPrice', 'priceDate']);

  // If the cached date is today, use the cached price.
  if (cache.priceDate === todayUTC && cache.dailyOpenPrice) {
    return cache.dailyOpenPrice;
  }

  // Otherwise, fetch a new price.
  console.log('Fetching new daily open price for', todayUTC);
  const newDailyOpenPrice = await fetchDailyOpenPrice();

  if (newDailyOpenPrice !== null) {
    // Store the new price and date in the cache.
    await chrome.storage.local.set({
      dailyOpenPrice: newDailyOpenPrice,
      priceDate: todayUTC,
    });
  }

  return newDailyOpenPrice;
}

/**
 * Updates the extension's badge and tooltip with the latest Bitcoin price.
 * It fetches the current price and the day's opening price.
 */
async function updatePrice() {
  try {
    // Fetch current and yesterday's prices concurrently for efficiency.
    const [currentPriceData, dailyOpenPrice] = await Promise.all([
      fetchBtcPrice(), // Fetches the live price
      getDailyOpenPrice()  // Gets the daily open price (from cache or network)
    ]);

    const currentPrice = currentPriceData?.price;

    // If the current price couldn't be fetched, show an error state.
    if (currentPrice === null) {
      updateUIError();
      console.warn('Could not fetch current price. UI set to error state.');
      return;
    }

    // Update the UI with the fetched prices.
    updateUISuccess(currentPrice, dailyOpenPrice);

  } catch (error) {
    console.error('Error updating price:', error);
    updateUIError();
  }
}

/**
 * Updates the UI to show the fetched price information.
 * @param {number} currentPrice - The current price of BTC.
 * @param {number|null} dailyOpenPrice - The opening price of BTC for the current UTC day.
 */
function updateUISuccess(currentPrice, dailyOpenPrice) {
  // Format the price for the badge (e.g., "650k", "1.1m").
  const badgeText = formatPriceShort(currentPrice);
  chrome.action.setBadgeText({ text: badgeText });
  chrome.action.setBadgeBackgroundColor({ color: '#000000' });

  // Build the tooltip string.
  let title = chrome.i18n.getMessage('tooltipNow', formatPrice(currentPrice)); // e.g., "Bitcoin: R$ 350.123"
  if (dailyOpenPrice !== null) {
    const variation = ((currentPrice - dailyOpenPrice) / dailyOpenPrice) * 100;
    title += `\n${chrome.i18n.getMessage('tooltipYesterday', formatPrice(dailyOpenPrice))}`; // e.g., "Abertura: R$ 345.500"
    title += `\n${chrome.i18n.getMessage('tooltipVariation', formatVariation(variation))}`;
  }
  chrome.action.setTitle({ title });
}

/**
 * Updates the UI to indicate an error fetching the price.
 */
function updateUIError() {
  chrome.action.setBadgeText({ text: 'N/A' });
  chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
  chrome.action.setTitle({ title: chrome.i18n.getMessage('tooltipError') });
}

/**
 * Sets up the initial state of the extension and creates the periodic alarm.
 */
function initialize() {
  // Check if the alarm already exists to avoid creating duplicates.
  chrome.alarms.get(UPDATE_ALARM_NAME, (existingAlarm) => {
    if (!existingAlarm) {
      // Create an alarm that fires to trigger a price update.
      chrome.alarms.create(UPDATE_ALARM_NAME, {
        delayInMinutes: ACTIVE_UPDATE_PERIOD_MINUTES,
        periodInMinutes: ACTIVE_UPDATE_PERIOD_MINUTES
      });
      console.log('Update alarm created.');
    }
  });
}

// --- Event Listeners ---

// Fired when the alarm goes off.
chrome.alarms.onAlarm.addListener((alarm) => alarm.name === UPDATE_ALARM_NAME && updatePrice());

// Adjust update frequency based on user activity to save resources.
chrome.idle.onStateChanged.addListener((newState) => {
  const periodInMinutes = newState === 'active' 
    ? ACTIVE_UPDATE_PERIOD_MINUTES 
    : IDLE_UPDATE_PERIOD_MINUTES;

  chrome.alarms.create(UPDATE_ALARM_NAME, { periodInMinutes });
  console.log(`User state is ${newState}. Update period set to ${periodInMinutes} minutes.`);
});

// Fired when the user clicks the extension icon.
chrome.action.onClicked.addListener(() => chrome.tabs.create({ url: BINANCE_TRADE_URL }));

// Set the detection interval for the idle state.
chrome.idle.setDetectionInterval(15);

// Initialize the alarm when the service worker starts.
initialize();

// Run an initial price update as soon as the service worker starts.
updatePrice();