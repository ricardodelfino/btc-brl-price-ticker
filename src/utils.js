// src/utils.js

/**
 * Formats a number into a BRL currency string.
 * e.g., 350123.45 => "R$ 350.123"
 * @param {number} price The price to format.
 * @returns {string} The formatted price string.
 */
export function formatPrice(price) {
  if (price === null || typeof price === 'undefined') return '';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Formats a price into a short, compact string for the badge.
 * e.g., 350123 => "350k", 1250000 => "1.2m"
 * @param {number} price The price to format.
 * @returns {string} The compact price string.
 */
export function formatPriceShort(price) {
  if (price === null || typeof price === 'undefined') return 'N/A';
  if (price >= 1_000_000) {
    return (price / 1_000_000).toFixed(1) + 'm';
  }
  if (price >= 10_000) {
    return Math.round(price / 1000) + 'k';
  }
  return Math.round(price).toString();
}

/**
 * Formats the percentage variation with a sign and an arrow.
 * e.g., 2.52 => "+2.52% ▲", -4.56 => "-4.56% ▼"
 * @param {number} variation The percentage variation.
 * @returns {string} The formatted variation string.
 */
export function formatVariation(variation) {
  if (variation === null || typeof variation === 'undefined' || isNaN(variation)) return '';
  const sign = variation >= 0 ? '+' : '';
  const arrow = variation >= 0 ? '▲' : '▼';
  return `${sign}${variation.toFixed(2)}% ${arrow}`;
}