import { apiClient, GEOGUESSR_BASE_URL } from './client';
import { getAuthHeaders } from './auth';
import { 
  GeoguessrChallengeResponse, 
  AuthenticationError,
  AccessDeniedError,
  NotFoundError,
} from './types';

/**
 * Get challenge basic information
 */
export const getChallengeInfo = async (challengeId: string): Promise<GeoguessrChallengeResponse> => {
  const headers = getAuthHeaders();

  try {
    const response = await apiClient.get<GeoguessrChallengeResponse>(
      `${GEOGUESSR_BASE_URL}/v3/challenges/${challengeId}`,
      { headers }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new AuthenticationError('Please check your _ncfa token.');
    } else if (error.response?.status === 403) {
      throw new AccessDeniedError('This challenge may be private or you may not have permission.');
    } else if (error.response?.status === 404) {
      throw new NotFoundError('Challenge not found or challenge ID is incorrect.');
    }
    throw new Error('Failed to fetch challenge information');
  }
}; 