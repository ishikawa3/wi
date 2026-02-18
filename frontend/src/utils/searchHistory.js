/**
 * Search History Management
 * Manages address search history using localStorage
 */

const STORAGE_KEY = 'wi_search_history';
const MAX_HISTORY = 10;

/**
 * Get search history from localStorage
 * @returns {Array} Array of search history items
 */
export const getSearchHistory = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const history = JSON.parse(stored);
    return Array.isArray(history) ? history : [];
  } catch (error) {
    console.error('Error reading search history:', error);
    return [];
  }
};

/**
 * Add item to search history
 * @param {Object} item - Search result item with { display_name, lat, lon, place_id }
 */
export const addSearchHistory = (item) => {
  try {
    const history = getSearchHistory();

    // Remove duplicate if exists (by place_id)
    const filtered = history.filter(h => h.place_id !== item.place_id);

    // Add new item to the beginning
    const newHistory = [
      {
        ...item,
        searched_at: new Date().toISOString(),
      },
      ...filtered
    ].slice(0, MAX_HISTORY); // Keep only MAX_HISTORY items

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error('Error adding to search history:', error);
  }
};

/**
 * Clear all search history
 */
export const clearSearchHistory = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing search history:', error);
  }
};

/**
 * Remove specific item from search history
 * @param {string} placeId - Place ID to remove
 */
export const removeSearchHistoryItem = (placeId) => {
  try {
    const history = getSearchHistory();
    const filtered = history.filter(h => h.place_id !== placeId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing history item:', error);
  }
};
