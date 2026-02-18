/**
 * Favorites Management
 * Manages favorite locations using localStorage
 */

const STORAGE_KEY = 'wi_favorites';
const MAX_FAVORITES = 50;

/**
 * Get all favorites from localStorage
 * @returns {Array} Array of favorite items
 */
export const getFavorites = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const favorites = JSON.parse(stored);
    return Array.isArray(favorites) ? favorites : [];
  } catch (error) {
    console.error('Error reading favorites:', error);
    return [];
  }
};

/**
 * Add a favorite location
 * @param {Object} item - { lat, lon, wi_score, address, note }
 */
export const addFavorite = (item) => {
  try {
    const favorites = getFavorites();
    const newItem = {
      id: crypto.randomUUID(),
      lat: item.lat,
      lon: item.lon,
      wi_score: item.wi_score ?? null,
      address: item.address ?? null,
      note: item.note ?? '',
      saved_at: new Date().toISOString(),
    };
    const newFavorites = [newItem, ...favorites].slice(0, MAX_FAVORITES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
    return newItem;
  } catch (error) {
    console.error('Error adding favorite:', error);
    return null;
  }
};

/**
 * Remove a favorite by ID
 * @param {string} id - Favorite ID
 */
export const removeFavorite = (id) => {
  try {
    const favorites = getFavorites();
    const filtered = favorites.filter(f => f.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing favorite:', error);
  }
};

/**
 * Update note for a favorite
 * @param {string} id - Favorite ID
 * @param {string} note - New note text
 */
export const updateFavoriteNote = (id, note) => {
  try {
    const favorites = getFavorites();
    const updated = favorites.map(f => f.id === id ? { ...f, note } : f);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error updating favorite note:', error);
  }
};

/**
 * Check if a location (by lat/lon) is already favorited
 * @param {number} lat
 * @param {number} lon
 * @returns {Object|null} The favorite item if found, otherwise null
 */
export const findFavoriteByLocation = (lat, lon) => {
  const favorites = getFavorites();
  return favorites.find(f =>
    Math.abs(f.lat - lat) < 0.000001 &&
    Math.abs(f.lon - lon) < 0.000001
  ) || null;
};
