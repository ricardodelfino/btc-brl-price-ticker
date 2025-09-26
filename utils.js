// src/utils.js

/**
 * Formats a number into a currency string (e.g., R$ 584,854).
 * @param {number} price - The price to format.
 * @returns {string} The formatted price string.
 */
export function formatPrice(price) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(price);
}

/**
 * Formats a number into a short format for the badge (e.g., 600k, 1.2m).
 * @param {number} price - The price to format.
 * @returns {string} The short-formatted price string.
 */
export function formatPriceShort(price) {
  if (price >= 1_000_000) {
    return (price / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'm';
  }
  if (price >= 1_000) {
    return Math.round(price / 1_000) + 'k';
  }
  return String(Math.round(price));
}

/**
 * Formats the percentage variation with an arrow.
 * @param {number} variation - The percentage change.
 * @returns {string} The formatted variation string (e.g., "↑ 2.52%").
 */
export function formatVariation(variation) {
  const arrow = variation >= 0 ? '↑' : '↓';
  const formattedPercentage = Math.abs(variation).toFixed(2);
  return `${arrow} ${formattedPercentage}%`;
}