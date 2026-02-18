/**
 * Difference Color Scale Utilities
 * Color mapping for difference heatmap (Profile 1 vs Profile 2)
 */

/**
 * Convert difference value to color
 * @param {number} diffValue - Difference value (score1 - score2), range: -100 to +100
 * @returns {string} Hex color code
 */
export function getDiffColor(diffValue) {
  if (diffValue >= 60) return '#b2182b';      // Dark red: P1 significantly higher
  if (diffValue >= 20) return '#ef8a62';      // Light red: P1 moderately higher
  if (diffValue >= -20) return '#f7f7f7';     // Gray: No significant difference
  if (diffValue >= -60) return '#67a9cf';     // Light blue: P2 moderately higher
  return '#2166ac';                           // Dark blue: P2 significantly higher
}

/**
 * Convert difference value to RGBA color with opacity
 * @param {number} diffValue - Difference value
 * @param {number} opacity - Opacity (0-1)
 * @returns {string} RGBA color string
 */
export function getDiffColorWithOpacity(diffValue, opacity = 0.7) {
  const color = getDiffColor(diffValue);
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Color scale definition for difference legend
 */
export const diffColorScale = [
  {
    min: 60,
    max: 100,
    color: '#b2182b',
    label: '+60〜+100: 大幅高い (P1)'
  },
  {
    min: 20,
    max: 60,
    color: '#ef8a62',
    label: '+20〜+60: やや高い (P1)'
  },
  {
    min: -20,
    max: 20,
    color: '#f7f7f7',
    label: '-20〜+20: 差なし'
  },
  {
    min: -60,
    max: -20,
    color: '#67a9cf',
    label: '-60〜-20: やや高い (P2)'
  },
  {
    min: -100,
    max: -60,
    color: '#2166ac',
    label: '-100〜-60: 大幅高い (P2)'
  }
];
