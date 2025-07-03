import { apiClient, GEOGUESSR_BASE_URL } from './client';
import { getAuthHeaders } from './auth';
import { GeoguessrUser, AuthenticationError } from './types';

/**
 * Get user profile (requires auth)
 */
export const getUser = async (): Promise<GeoguessrUser> => {
  const headers = getAuthHeaders();

  try {
    const response = await apiClient.get<GeoguessrUser>(`${GEOGUESSR_BASE_URL}/v3/profiles`, { headers });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new AuthenticationError('Invalid authentication token');
    }
    throw new Error('Failed to fetch user profile');
  }
}; 