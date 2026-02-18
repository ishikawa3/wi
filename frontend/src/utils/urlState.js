/**
 * URL State Utilities
 * Encode and decode app state to/from URL query parameters
 */

/**
 * Encode current app state to a URL string
 */
export const encodeStateToURL = ({ selectedArea, selectedProfile, wiScoreFilter, darkMode }) => {
  const p = new URLSearchParams();
  if (selectedArea) p.set('area', selectedArea);
  if (selectedProfile) p.set('profile', selectedProfile);
  if (wiScoreFilter) {
    p.set('scoreMin', String(wiScoreFilter.min));
    p.set('scoreMax', String(wiScoreFilter.max));
  }
  p.set('dark', String(darkMode));
  return `${window.location.pathname}?${p.toString()}`;
};

/**
 * Decode app state from the current URL
 */
export const decodeStateFromURL = () => {
  const p = new URLSearchParams(window.location.search);
  return {
    area: p.get('area') || null,
    profile: p.get('profile') || null,
    scoreMin: p.has('scoreMin') ? Number(p.get('scoreMin')) : 0,
    scoreMax: p.has('scoreMax') ? Number(p.get('scoreMax')) : 100,
    dark: p.get('dark') === 'true',
  };
};
