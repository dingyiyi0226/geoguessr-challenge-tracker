import axios from 'axios';

// Geoguessr API configuration
const GEOGUESSR_BASE_URL = '/api'; // Using proxy, so relative URL
const GEOGUESSR_GAME_SERVER = 'https://game-server.geoguessr.com/api';

// Create axios instance with default config
const apiClient = axios.create({
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

// Extract challenge ID from various Geoguessr URL formats
const extractChallengeId = (url) => {
  const patterns = [
    /\/challenge\/([a-zA-Z0-9-_]+)/,
    /\/results\/([a-zA-Z0-9-_]+)/,
    /challenge=([a-zA-Z0-9-_]+)/,
    /\/c\/([a-zA-Z0-9-_]+)/, // Short URL format
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  // If it's just an ID
  if (/^[a-zA-Z0-9-_]+$/.test(url.trim())) {
    return url.trim();
  }

  throw new Error('Invalid Geoguessr challenge URL format');
};

// Get authentication token from localStorage or prompt user
const getAuthToken = () => {
  const token = localStorage.getItem('geoguessr_ncfa_token');
  if (!token) {
    throw new Error('Authentication required. Please set your _ncfa token in the settings.');
  }
  return token;
};

// Set authentication token
export const setAuthToken = (token) => {
  localStorage.setItem('geoguessr_ncfa_token', token);
};

// Clear authentication token
export const clearAuthToken = () => {
  localStorage.removeItem('geoguessr_ncfa_token');
};

// Check if user has authentication token
export const hasAuthToken = () => {
  return !!localStorage.getItem('geoguessr_ncfa_token');
};

// Fetch challenge results using the highscores API approach
const fetchChallengeResultsFromAPI = async (challengeId, authToken) => {
  try {
    const headers = {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-Auth-Token': authToken, // Pass token through custom header for proxy
    };

    // First, get the challenge basic info
    const challengeResponse = await apiClient.get(
      `${GEOGUESSR_BASE_URL}/v3/challenges/${challengeId}`,
      { headers }
    );

    const challengeData = challengeResponse.data;
    
    if (!challengeData) {
      throw new Error('Challenge not found or access denied');
    }

    // Fetch highscores using the correct endpoint
    const params = new URLSearchParams({
      friends: 'false',
      limit: '100',
      minRounds: '5'
    });

    const highscoresResponse = await apiClient.get(
      `${GEOGUESSR_BASE_URL}/v3/results/highscores/${challengeId}?${params}`,
      { headers }
    );

    const highscores = highscoresResponse.data;
    
    if (!highscores || !highscores.items || highscores.items.length === 0) {
      throw new Error('No results found for this challenge');
    }

    // Process highscores items to get detailed results
    // Process highscores items - all data is already included in the response
    const participants = highscores.items.map((item, index) => {
      const game = item.game;
      const player = game.player;
      
      return {
        rank: index + 1,
        userId: player.id,
        nick: player.nick || 'Anonymous',
        totalScore: parseInt(player.totalScore.amount),
        totalTime: player.totalTime,
        gameToken: game.token,
        playedAt: game.rounds[0]?.startTime || null,
        pinUrl: player.pin?.url,
        countryCode: player.countryCode,
        isVerified: player.isVerified || false,
        flair: player.flair || 0,
        rounds: game.rounds.map((round, roundIndex) => {
          const guess = player.guesses[roundIndex];
          return {
            roundNumber: roundIndex + 1,
            lat: round.lat,
            lng: round.lng,
            guessLat: guess?.lat,
            guessLng: guess?.lng,
            distance: guess?.distanceInMeters,
            score: guess?.roundScoreInPoints,
            time: guess?.time,
            streakLocationCode: round.streakLocationCode,
            timedOut: guess?.timedOut || false,
            skippedRound: guess?.skippedRound || false,
          };
        }),
        gameMode: game.mode,
        gameType: game.type,
        totalDistance: player.totalDistanceInMeters,
        scorePercentage: parseFloat(player.totalScore.percentage),
      };
    });

    // All participants are already processed successfully

    return {
      id: challengeId,
      name: challengeData.map?.name || 'Unknown Challenge',
      description: challengeData.map?.description || '',
      created: challengeData.creator?.created,
      creator: challengeData.creator?.nick || 'Unknown',
      mode: challengeData.challenge?.gameMode || 'standard',
      timeLimit: challengeData.challenge?.timeLimit,
      participants: participants,
      totalParticipants: participants.length,
      maxParticipants: challengeData.challenge?.numberOfParticipants || 'unlimited',
      mapName: challengeData.map?.name,
      mapId: challengeData.map?.id,
      url: challengeData.map?.url,
      bounds: challengeData.map?.bounds,
      highscoreCount: highscores.items.length,
      forbidMoving: challengeData.challenge?.forbidMoving,
      forbidRotating: challengeData.challenge?.forbidRotating,
      forbidZooming: challengeData.challenge?.forbidZooming,
      roundCount: challengeData.challenge?.roundCount,
      challengeType: challengeData.challenge?.challengeType,
      streakType: challengeData.challenge?.streakType,
      accessLevel: challengeData.challenge?.accessLevel,
    };
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        throw new Error('Authentication failed. Please check your _ncfa token.');
      } else if (error.response.status === 403) {
        throw new Error('Access denied. This challenge may be private or you may not have permission.');
      } else if (error.response.status === 404) {
        throw new Error('Challenge not found. Please check the challenge ID.');
      }
    }
    throw error;
  }
};

// Main function to fetch challenge data using results/highscores approach
export const fetchChallengeData = async (challengeUrl) => {
  try {
    const challengeId = extractChallengeId(challengeUrl);
    
    if (!hasAuthToken()) {
      throw new Error('Authentication required. Please set your _ncfa token in the settings.');
    }

    const authToken = getAuthToken();
    return await fetchChallengeResultsFromAPI(challengeId, authToken);
  } catch (error) {
    console.error('Error fetching challenge data:', error);
    throw error;
  }
};

// Helper function to validate if a URL looks like a Geoguessr challenge URL
export const isValidChallengeUrl = (url) => {
  try {
    extractChallengeId(url);
    return true;
  } catch {
    return false;
  }
};

// Helper function to get user profile (requires auth)
export const getUserProfile = async () => {
  if (!hasAuthToken()) {
    throw new Error('Authentication required');
  }

  const authToken = getAuthToken();
  const headers = {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Auth-Token': authToken,
  };

  try {
    const response = await apiClient.get(`${GEOGUESSR_BASE_URL}/v3/profiles`, { headers });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Invalid authentication token');
    }
    throw new Error('Failed to fetch user profile');
  }
};

// Get challenge highscores directly using the correct endpoint
export const getChallengeHighscores = async (challengeId, options = {}) => {
  if (!hasAuthToken()) {
    throw new Error('Authentication required for highscores');
  }

  const authToken = getAuthToken();
  const headers = {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Auth-Token': authToken,
  };

  // Default parameters for highscores endpoint
  const params = new URLSearchParams({
    friends: options.friends || 'false',
    limit: options.limit || '100',
    minRounds: options.minRounds || '5',
    ...options.extraParams
  });

  try {
    const response = await apiClient.get(
      `${GEOGUESSR_BASE_URL}/v3/results/highscores/${challengeId}?${params}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Challenge highscores not found');
    }
    throw new Error('Failed to fetch highscores');
  }
}; 