/**
 * Formatting utilities for GeoGuessr challenge data
 */

/**
 * Formats a score with thousands separators
 * @param {number} score - The score to format
 * @returns {string} Formatted score string
 */
export const formatScore = (score) => {
  return score ? score.toLocaleString() : '0';
};

/**
 * Formats time in seconds to a human-readable format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string (e.g., "2m 30s" or "45s")
 */
export const formatTime = (seconds) => {
  if (!seconds) return '0s';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
};

/**
 * Formats distance in meters to a human-readable format
 * @param {number} distance - Distance in meters
 * @returns {string} Formatted distance string (e.g., "500 m" or "2.5 km")
 */
export const formatDistance = (distance) => {
  if (distance === null || distance === undefined) return 'N/A';
  if (distance < 1000) {
    return `${Math.round(distance)} m`;
  } else {
    return `${(distance / 1000).toFixed(1)} km`;
  }
};

/**
 * Converts a country code to its corresponding flag emoji
 * @param {string} countryCode - Two-letter country code (e.g., "US", "GB")
 * @returns {string} Flag emoji or world emoji if no country code
 */
export const getCountryFlag = (countryCode) => {
  if (!countryCode) return '🌍';
  
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
};

/**
 * Formats a rank number with medal emojis for top 3 positions
 * @param {number} rank - The rank position
 * @returns {string|number} Medal emoji for top 3, or rank number for others
 */
export const getRankDisplay = (rank) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}; 