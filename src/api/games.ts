import { apiClient, GEOGUESSR_BASE_URL } from './client';
import { getAuthHeaders } from './auth';
import { 
  GeoguessrGame, 
  AuthenticationError,
  AccessDeniedError,
  NotFoundError,
} from './types';

/**
 * Get game information by token
 */
export const getGameInfo = async (gameToken: string): Promise<GeoguessrGame> => {
  const headers = getAuthHeaders();

  try {
    const response = await apiClient.get<GeoguessrGame>(
      `${GEOGUESSR_BASE_URL}/v3/games/${gameToken}`,
      { headers }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new AuthenticationError('Please check your _ncfa token.');
    } else if (error.response?.status === 403) {
      throw new AccessDeniedError('This game may be private or you may not have permission.');
    } else if (error.response?.status === 404) {
      throw new NotFoundError('Game not found or game token is incorrect.');
    }
    throw new Error('Failed to fetch game information');
  }
};

/**
 * Get multiple games information by tokens
 */
export const getGamesInfo = async (gameTokens: string[]): Promise<GeoguessrGame[]> => {
  const promises = gameTokens.map(token => getGameInfo(token));
  return Promise.all(promises);
}; 