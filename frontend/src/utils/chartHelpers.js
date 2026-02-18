/**
 * Chart Helper Utilities
 * Statistical calculations for histogram and box plot charts
 */

/**
 * Calculate histogram bins for WI score distribution
 * @param {number[]} scores - Array of WI scores
 * @param {number} binCount - Number of bins (default: 10)
 * @returns {object[]} Array of bin objects with min, max, label, count
 */
export const calculateHistogramBins = (scores, binCount = 10) => {
  if (!scores || scores.length === 0) {
    return [];
  }

  const min = Math.min(...scores);
  const max = Math.max(...scores);

  // Handle edge case where all values are the same
  if (min === max) {
    return [{
      min: min,
      max: max,
      label: `${min.toFixed(0)}`,
      count: scores.length,
    }];
  }

  const binWidth = (max - min) / binCount;

  const bins = Array.from({ length: binCount }, (_, i) => ({
    min: min + i * binWidth,
    max: min + (i + 1) * binWidth,
    label: `${(min + i * binWidth).toFixed(0)}-${(min + (i + 1) * binWidth).toFixed(0)}`,
    count: 0,
  }));

  // Count scores in each bin
  scores.forEach(score => {
    const binIndex = Math.min(Math.floor((score - min) / binWidth), binCount - 1);
    bins[binIndex].count++;
  });

  return bins;
};

/**
 * Calculate box plot data (quartiles, outliers)
 * @param {number[]} scores - Array of WI scores
 * @returns {object} Box plot data: { min, q1, median, q3, max, outliers }
 */
export const calculateBoxPlotData = (scores) => {
  if (!scores || scores.length === 0) {
    return null;
  }

  const sorted = [...scores].sort((a, b) => a - b);
  const n = sorted.length;

  // Calculate quartiles
  const q1 = sorted[Math.floor(n * 0.25)];
  const median = sorted[Math.floor(n * 0.5)];
  const q3 = sorted[Math.floor(n * 0.75)];
  const iqr = q3 - q1;

  // Calculate fences for outlier detection
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;

  // Identify outliers
  const outliers = sorted.filter(s => s < lowerFence || s > upperFence);

  // Min and max (excluding outliers)
  const min = sorted.find(s => s >= lowerFence) || sorted[0];
  const max = [...sorted].reverse().find(s => s <= upperFence) || sorted[n - 1];

  return { min, q1, median, q3, max, outliers };
};
