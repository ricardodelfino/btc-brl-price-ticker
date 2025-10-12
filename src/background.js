// src/background.js

// Import necessary functions from other modules.
import { fetchBtcPriceData } from './api.js';
import { formatPrice, formatPriceShort, formatVariation } from './utils.js';

// Define constants for easy configuration and readability.
const UPDATE_ALARM_NAME = 'update-price-alarm';
const BINANCE_TRADE_URL = 'https://www.binance.com/pt-BR/trade/BTC_BRL';
const ACTIVE_UPDATE_PERIOD_MINUTES = 1;
const IDLE_UPDATE_PERIOD_MINUTES = 5;

/**
 * Updates the extension's badge and tooltip with the latest Bitcoin price.
 * It fetches the current price and the 24-hour opening price in a single call.
 */
async function updatePrice() {
  try {
    // Fetch current and 24h open prices in a single API call.
    const priceData = await fetchBtcPriceData();

    // If the data couldn't be fetched, show an error state.
    if (priceData === null) {
      updateUIError();
      console.warn('Could not fetch price data. UI set to error state.');
      return;
    }

    // Update the UI with the fetched prices.
    updateUISuccess(priceData);

  } catch (error) {
    console.error('Error updating price:', error);
    updateUIError();
  }
}

/**
 * Updates the UI to show the fetched price information.
 * @param {{currentPrice: number, openPrice: number, variation: number}} priceData - The fetched price data.
 */
function updateUISuccess(priceData) {
  // Format the price for the badge (e.g., "650k", "1.1m").
  const badgeText = formatPriceShort(priceData.currentPrice);
  chrome.action.setBadgeText({ text: badgeText });
  chrome.action.setBadgeBackgroundColor({ color: '#000000' });

  // Build the tooltip string.
  let title = chrome.i18n.getMessage('tooltipNow', formatPrice(priceData.currentPrice));
  if (priceData.openPrice !== null && priceData.variation !== null) {
    title += `\n${chrome.i18n.getMessage('tooltipYesterday', formatPrice(priceData.openPrice))}`;
    title += `\n${chrome.i18n.getMessage('tooltipVariation', formatVariation(priceData.variation))}`;
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