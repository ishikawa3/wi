import apiClient from './client';

/**
 * Fetch list of available profiles
 */
export const fetchProfiles = async () => {
  const data = await apiClient.get('/profiles');
  return data.profiles;
};

/**
 * Fetch profile details
 */
export const fetchProfile = async (profileId) => {
  return await apiClient.get(`/profiles/${profileId}`);
};

/**
 * Fetch list of available areas
 */
export const fetchAreas = async () => {
  const data = await apiClient.get('/areas');
  return data.areas;
};

/**
 * Fetch WI grid data
 */
export const fetchWIGrid = async ({ area, profile, bbox }) => {
  const params = { area, profile };
  if (bbox) {
    params.bbox = bbox;
  }
  return await apiClient.get('/wi/grid', { params });
};

/**
 * Fetch WI for a specific point
 */
export const fetchWIPoint = async ({ lat, lon, area, profile }) => {
  return await apiClient.get('/wi/point', {
    params: { lat, lon, area, profile }
  });
};

/**
 * Fetch WI statistics
 */
export const fetchWIStatistics = async ({ area, profile }) => {
  return await apiClient.get('/wi/statistics', {
    params: { area, profile }
  });
};

/**
 * Fetch amenities data
 */
export const fetchAmenities = async ({ area, amenityTypes, bbox }) => {
  const params = { area };
  if (amenityTypes && amenityTypes.length > 0) {
    params.amenity_types = amenityTypes.join(',');
  }
  if (bbox) {
    params.bbox = bbox;
  }
  return await apiClient.get('/amenities', { params });
};

/**
 * Fetch available amenity types
 */
export const fetchAmenityTypes = async (area) => {
  return await apiClient.get('/amenities/types', {
    params: { area }
  });
};

/**
 * Get default weights for a profile
 */
export const fetchProfileDefaults = async (profileId) => {
  return await apiClient.get('/profiles/custom/defaults', {
    params: { profile_id: profileId }
  });
};

/**
 * Calculate WI with custom profile
 */
export const calculateCustomWI = async ({ area, profileName, weights }) => {
  return await apiClient.post('/profiles/custom/calculate', {
    area,
    profile: {
      name: profileName,
      weights
    }
  });
};

/**
 * Search for address using geocoding API
 */
export const searchAddress = async (query, limit = 5) => {
  return await apiClient.get('/geocoding/search', {
    params: { q: query, limit }
  });
};
