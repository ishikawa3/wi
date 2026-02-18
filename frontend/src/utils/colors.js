/**
 * Get color for WI score (0-100)
 * Color scale: Red (low) -> Yellow (medium) -> Green (high)
 */
export function getWIColor(score) {
  if (score >= 80) return '#1a9850'; // Dark green
  if (score >= 60) return '#91cf60'; // Light green
  if (score >= 40) return '#fee090'; // Yellow
  if (score >= 20) return '#fc8d59'; // Orange
  return '#d73027'; // Red
}

/**
 * Get color with opacity
 */
export function getWIColorWithOpacity(score, opacity = 0.7) {
  const color = getWIColor(score);
  // Convert hex to rgba
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Get color for legend
 */
export const colorScale = [
  { min: 80, max: 100, color: '#1a9850', label: '80-100: 非常に高い' },
  { min: 60, max: 80, color: '#91cf60', label: '60-80: 高い' },
  { min: 40, max: 60, color: '#fee090', label: '40-60: 中程度' },
  { min: 20, max: 40, color: '#fc8d59', label: '20-40: 低い' },
  { min: 0, max: 20, color: '#d73027', label: '0-20: 非常に低い' },
];
