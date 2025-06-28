import axios from 'axios';

// Geoguessr API configuration
const GEOGUESSR_BASE_URL = 'https://www.geoguessr.com/api';
const GEOGUESSR_GAME_SERVER = 'https://game-server.geoguessr.com/api';

// Create axios instance with default config
const apiClient = axios.create({
  timeout: 10000,
  withCredentials: true,
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

// Helper function to format user agent
const getUserAgent = () => {
  return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
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
      'User-Agent': getUserAgent(),
      'Accept': 'application/json',
      'Referer': 'https://www.geoguessr.com/',
      'Cookie': `_ncfa=${authToken}`,
    };

    // First, get the challenge with highscores data
    const challengeResponse = await apiClient.get(
      `${GEOGUESSR_BASE_URL}/v3/challenges/${challengeId}`,
      { headers }
    );

    const challengeData = challengeResponse.data;
    
    if (!challengeData) {
      throw new Error('Challenge not found or access denied');
    }

    // Extract highscores directly from the challenge data
    const highscores = challengeData.highscores;
    
    if (!highscores || !highscores.items || highscores.items.length === 0) {
      // If no highscores in challenge, try alternative results endpoint
      return await fetchAlternativeResults(challengeId, challengeData, headers);
    }

    // Process highscores items to get detailed results
    const participants = await Promise.allSettled(
      highscores.items.map(async (participant, index) => {
        try {
          // Fetch detailed game data for each participant
          const gameResponse = await apiClient.get(
            `${GEOGUESSR_BASE_URL}/v3/games/${participant.gameToken}`,
            { headers }
          );

          const gameData = gameResponse.data;
          
          return {
            rank: index + 1,
            userId: participant.userId,
            nick: participant.nick || participant.playerName || 'Anonymous',
            totalScore: participant.totalScore,
            totalTime: participant.totalTime,
            gameToken: participant.gameToken,
            created: participant.created,
            pinUrl: participant.pinUrl,
            countryCode: participant.countryCode,
            isVerified: participant.isVerified || false,
            rounds: gameData.rounds ? gameData.rounds.map((round, roundIndex) => ({
              roundNumber: roundIndex + 1,
              lat: round.lat,
              lng: round.lng,
              guessLat: round.guessLat,
              guessLng: round.guessLng,
              distance: round.distance?.meters || round.distance,
              score: round.score,
              time: round.time,
              streetView: round.streetView,
            })) : [],
            gameMode: gameData.mode,
            gameType: gameData.type,
          };
        } catch (gameError) {
          console.warn(`Failed to fetch detailed game data for ${participant.nick}:`, gameError.message);
          // Return basic participant info even if game fetch fails
          return {
            rank: index + 1,
            userId: participant.userId,
            nick: participant.nick || participant.playerName || 'Anonymous',
            totalScore: participant.totalScore,
            totalTime: participant.totalTime,
            gameToken: participant.gameToken,
            created: participant.created,
            pinUrl: participant.pinUrl,
            countryCode: participant.countryCode,
            isVerified: participant.isVerified || false,
            rounds: [],
            gameMode: 'unknown',
            gameType: 'unknown',
            error: 'Failed to fetch detailed results'
          };
        }
      })
    );

    // Filter successful results
    const successfulParticipants = participants
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);

    return {
      id: challengeId,
      name: challengeData.challenge?.map?.name || challengeData.map?.name || 'Unknown Challenge',
      description: challengeData.challenge?.map?.description || challengeData.map?.description || '',
      created: challengeData.created,
      creator: challengeData.creator?.nick || 'Unknown',
      mode: challengeData.challenge?.mode || challengeData.mode || 'standard',
      timeLimit: challengeData.challenge?.timeLimit || challengeData.timeLimit,
      participants: successfulParticipants,
      totalParticipants: successfulParticipants.length,
      maxParticipants: highscores.maxSize || 'unlimited',
      mapName: challengeData.challenge?.map?.name || challengeData.map?.name,
      mapId: challengeData.challenge?.map?.id || challengeData.map?.id,
      url: challengeData.challenge?.map?.url || challengeData.map?.url,
      bounds: challengeData.challenge?.map?.bounds || challengeData.map?.bounds,
      highscoreCount: highscores.items.length,
      forbidMoving: challengeData.forbidMoving,
      forbidRotating: challengeData.forbidRotating,
      forbidZooming: challengeData.forbidZooming,
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

// Alternative method to fetch results if primary highscores method fails
const fetchAlternativeResults = async (challengeId, challengeData, headers) => {
  try {
    // Try to get results from alternative endpoints
    const endpoints = [
      `${GEOGUESSR_BASE_URL}/v3/results/${challengeId}`,
      `${GEOGUESSR_BASE_URL}/v4/results/${challengeId}`,
      `${GEOGUESSR_BASE_URL}/v3/challenges/${challengeId}/results`
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await apiClient.get(endpoint, { headers });
        if (response.data && response.data.items) {
          return processAlternativeResults(challengeId, challengeData, response.data);
        }
      } catch (endpointError) {
        console.warn(`Alternative endpoint ${endpoint} failed:`, endpointError.message);
      }
    }

    // If all alternative methods fail, return challenge data without participants
    return {
      id: challengeId,
      name: challengeData.challenge?.map?.name || challengeData.map?.name || 'Unknown Challenge',
      description: challengeData.challenge?.map?.description || challengeData.map?.description || '',
      created: challengeData.created,
      creator: challengeData.creator?.nick || 'Unknown',
      mode: challengeData.challenge?.mode || challengeData.mode || 'standard',
      timeLimit: challengeData.challenge?.timeLimit || challengeData.timeLimit,
      participants: [],
      totalParticipants: 0,
      maxParticipants: 'unknown',
      mapName: challengeData.challenge?.map?.name || challengeData.map?.name,
      mapId: challengeData.challenge?.map?.id || challengeData.map?.id,
      highscoreCount: 0,
      isPrivate: true,
      warning: 'This challenge may be private or have no public results'
    };
  } catch (error) {
    throw new Error(`Failed to fetch results: ${error.message}`);
  }
};

// Process alternative results format
const processAlternativeResults = (challengeId, challengeData, resultsData) => {
  const participants = resultsData.items.map((participant, index) => ({
    rank: index + 1,
    userId: participant.userId,
    nick: participant.nick || participant.playerName || 'Anonymous',
    totalScore: participant.totalScore,
    totalTime: participant.totalTime,
    gameToken: participant.gameToken,
    created: participant.created,
    pinUrl: participant.pinUrl,
    countryCode: participant.countryCode,
    isVerified: participant.isVerified || false,
    rounds: [], // Will need separate API call to get detailed rounds
    gameMode: 'unknown',
    gameType: 'unknown',
  }));

  return {
    id: challengeId,
    name: challengeData.challenge?.map?.name || challengeData.map?.name || 'Unknown Challenge',
    description: challengeData.challenge?.map?.description || challengeData.map?.description || '',
    created: challengeData.created,
    creator: challengeData.creator?.nick || 'Unknown',
    mode: challengeData.challenge?.mode || challengeData.mode || 'standard',
    timeLimit: challengeData.challenge?.timeLimit || challengeData.timeLimit,
    participants: participants,
    totalParticipants: participants.length,
    maxParticipants: resultsData.maxSize || 'unlimited',
    mapName: challengeData.challenge?.map?.name || challengeData.map?.name,
    mapId: challengeData.challenge?.map?.id || challengeData.map?.id,
    highscoreCount: participants.length,
    source: 'alternative_results_api'
  };
};

// Mock function for testing when no auth token is available
const mockFetchChallengeData = async (challengeId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  // Generate mock data with multiple players and ranking
  const mockParticipants = [
    {
      rank: 1,
      userId: 'user1',
      nick: 'GeographyMaster',
      totalScore: 24847,
      totalTime: 847,
      gameToken: 'game1',
      created: new Date().toISOString(),
      countryCode: 'US',
      isVerified: true,
      rounds: [
        { roundNumber: 1, score: 4998, time: 180, distance: 23 },
        { roundNumber: 2, score: 4952, time: 165, distance: 156 },
        { roundNumber: 3, score: 4876, time: 192, distance: 342 },
        { roundNumber: 4, score: 4999, time: 158, distance: 12 },
        { roundNumber: 5, score: 5022, time: 152, distance: 8 },
      ]
    },
    {
      rank: 2,
      userId: 'user2',
      nick: 'WorldExplorer',
      totalScore: 21456,
      totalTime: 623,
      gameToken: 'game2',
      created: new Date(Date.now() - 3600000).toISOString(),
      countryCode: 'CA',
      isVerified: false,
      rounds: [
        { roundNumber: 1, score: 4323, time: 120, distance: 567 },
        { roundNumber: 2, score: 4654, time: 135, distance: 234 },
        { roundNumber: 3, score: 4012, time: 142, distance: 892 },
        { roundNumber: 4, score: 4234, time: 108, distance: 445 },
        { roundNumber: 5, score: 4233, time: 118, distance: 677 },
      ]
    },
    {
      rank: 3,
      userId: 'user3',
      nick: 'MapDetective',
      totalScore: 18943,
      totalTime: 567,
      gameToken: 'game3',
      created: new Date(Date.now() - 7200000).toISOString(),
      countryCode: 'GB',
      isVerified: true,
      rounds: [
        { roundNumber: 1, score: 3845, time: 115, distance: 1234 },
        { roundNumber: 2, score: 3723, time: 125, distance: 987 },
        { roundNumber: 3, score: 3654, time: 102, distance: 1456 },
        { roundNumber: 4, score: 3892, time: 118, distance: 789 },
        { roundNumber: 5, score: 3829, time: 107, distance: 1123 },
      ]
    },
    {
      rank: 4,
      userId: 'user4',
      nick: 'GeoNinja',
      totalScore: 16234,
      totalTime: 723,
      gameToken: 'game4',
      created: new Date(Date.now() - 10800000).toISOString(),
      countryCode: 'DE',
      isVerified: false,
      rounds: [
        { roundNumber: 1, score: 3234, time: 145, distance: 2345 },
        { roundNumber: 2, score: 3123, time: 155, distance: 1876 },
        { roundNumber: 3, score: 3456, time: 132, distance: 1654 },
        { roundNumber: 4, score: 3211, time: 138, distance: 2123 },
        { roundNumber: 5, score: 3210, time: 153, distance: 1987 },
      ]
    }
  ];

  // Sometimes simulate an error
  if (Math.random() < 0.1) {
    throw new Error('Challenge not found or access denied');
  }

  return {
    id: challengeId,
    name: `Challenge ${challengeId.substring(0, 8)}`,
    description: 'Test challenge with ranked highscores',
    created: new Date().toISOString(),
    creator: 'TestUser',
    mode: 'standard',
    timeLimit: 180,
    participants: mockParticipants,
    totalParticipants: mockParticipants.length,
    maxParticipants: 'unlimited',
    mapName: 'World',
    mapId: 'world',
    highscoreCount: mockParticipants.length,
    forbidMoving: false,
    forbidRotating: false,
    forbidZooming: false,
  };
};

// Main function to fetch challenge data using results/highscores approach
export const fetchChallengeData = async (challengeUrl) => {
  try {
    const challengeId = extractChallengeId(challengeUrl);
    
    // Check if we have authentication token
    if (hasAuthToken()) {
      try {
        const authToken = getAuthToken();
        return await fetchChallengeResultsFromAPI(challengeId, authToken);
      } catch (error) {
        // If API call fails, fall back to mock data with a warning
        console.warn('API call failed, using mock data:', error.message);
        const mockData = await mockFetchChallengeData(challengeId);
        mockData.isSimulated = true;
        mockData.simulationReason = error.message;
        return mockData;
      }
    } else {
      // Use mock data when no auth token is available
      const mockData = await mockFetchChallengeData(challengeId);
      mockData.isSimulated = true;
      mockData.simulationReason = 'No authentication token provided. Using simulated data.';
      return mockData;
    }
  } catch (error) {
    if (error.message === 'Invalid Geoguessr challenge URL format') {
      throw error;
    }
    throw new Error(`Failed to fetch challenge data: ${error.message}`);
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
    'User-Agent': getUserAgent(),
    'Accept': 'application/json',
    'Referer': 'https://www.geoguessr.com/',
    'Cookie': `_ncfa=${authToken}`,
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

// Get challenge highscores directly (alternative endpoint)
export const getChallengeHighscores = async (challengeId, limit = 50, offset = 0) => {
  if (!hasAuthToken()) {
    throw new Error('Authentication required for highscores');
  }

  const authToken = getAuthToken();
  const headers = {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Auth-Token': authToken,
  };

  try {
    const response = await apiClient.get(
      `${GEOGUESSR_BASE_URL}/v3/challenges/${challengeId}/highscores?limit=${limit}&offset=${offset}`,
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