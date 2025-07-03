import { apiClient, GEOGUESSR_BASE_URL } from './client';
import { getAuthHeaders } from './auth';
import { GeoguessrHighscoreResponse, AuthenticationError, NotFoundError } from './types';
import { HighscoresOptions } from '../services/types/application';

/**
 * Get challenge highscores directly using the correct endpoint
 */
export const getChallengeHighscores = async (challengeId: string, options: HighscoresOptions = {}): Promise<GeoguessrHighscoreResponse> => {
  const headers = getAuthHeaders();

  // Default parameters for highscores endpoint
  const params = new URLSearchParams({
    friends: options.friends?.toString() || 'false',
    limit: options.limit?.toString() || '100',
    minRounds: options.minRounds?.toString() || '5',
    ...options.extraParams
  });

  try {
    const response = await apiClient.get<GeoguessrHighscoreResponse>(
      `${GEOGUESSR_BASE_URL}/v3/results/highscores/${challengeId}?${params}`,
      { headers }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new AuthenticationError('Authentication required for highscores');
    } else if (error.response?.status === 404) {
      throw new NotFoundError('Challenge highscores not found');
    }
    throw new Error('Failed to fetch highscores');
  }
}; 