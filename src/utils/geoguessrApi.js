import axios from 'axios';
import { 
  saveChallenge, 
  loadChallenge, 
  hasChallenge,
  appendChallengeList
} from './sessionStorage';

// Geoguessr API configuration
const GEOGUESSR_BASE_URL = '/api'; // Using proxy, so relative URL
const GEOGUESSR_GAME_SERVER = 'https://game-server.geoguessr.com/api';

// Create axios instance with default config
const apiClient = axios.create({
  timeout: 20000,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

// Extract challenge ID from various Geoguessr URL formats
export const getChallengeIDFromUrl = (url) => {
  // Handle null, undefined, or empty input
  if (!url || typeof url !== 'string' || !url.trim()) {
    return null;
  }

  const trimmedUrl = url.trim();
  const patterns = [
    /\/challenge\/([a-zA-Z0-9-_]+)/,
    /\/results\/([a-zA-Z0-9-_]+)/,
    /challenge=([a-zA-Z0-9-_]+)/,
    /\/c\/([a-zA-Z0-9-_]+)/, // Short URL format
  ];

  for (const pattern of patterns) {
    const match = trimmedUrl.match(pattern);
    if (match) {
      return match[1];
    }
  }

  // If it's just an ID
  if (/^[a-zA-Z0-9-_]+$/.test(trimmedUrl)) {
    return trimmedUrl;
  }

  // Return null for invalid format instead of throwing
  return null;
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
      creator: challengeData.creator?.nick || 'Unknown',
      mode: getGameMode(challengeData),
      timeLimit: challengeData.challenge?.timeLimit,
      participants: participants,
      totalParticipants: participants.length,
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
        throw new Error('This challenge is not played yet. Or the challenge ID is incorrect.');
      }
    }
    throw error;
  }
};

// Main function to fetch challenge data with session storage caching
export const fetchChallengeData = async (challengeUrl, forceRefresh = false) => {
  try {
    const challengeId = getChallengeIDFromUrl(challengeUrl);
    if (!challengeId) {
      throw new Error('Invalid Geoguessr challenge URL format');
    }
    
    // Check session storage first (unless force refresh)
    if (!forceRefresh && hasChallenge(challengeId)) {
      const cachedData = loadChallenge(challengeId);
      if (cachedData) {
        console.log(`Using cached data for challenge ${challengeId}`);
        return cachedData;
      }
    }
    
    if (!hasAuthToken()) {
      throw new Error('Authentication required. Please set your _ncfa token in the settings.');
    }

    const authToken = getAuthToken();
    console.log(`Fetching fresh data for challenge ${challengeId}`);
    const challengeData = await fetchChallengeResultsFromAPI(challengeId, authToken);
    
    // Save to session storage after successful fetch
    saveChallenge(challengeData);
    appendChallengeList(challengeId);
    
    return challengeData;
  } catch (error) {
    console.error('Error fetching challenge data:', error);
    throw error;
  }
};

// Helper function to process challenges in batches with rate limiting
const processBatch = async (batch, startIndex, updateProgress, forceRefresh = false, names = null) => {
  const batchPromises = batch.map(async ({ url, index }, batchIndex) => {
    try {
      const challengeId = getChallengeIDFromUrl(url);
      
      if (!challengeId) {
        throw new Error('Invalid Geoguessr challenge URL format');
      }
      
      // Check session storage first (unless force refresh)
      if (!forceRefresh && hasChallenge(challengeId)) {
        const cachedData = loadChallenge(challengeId);
        if (cachedData) {
          // Apply custom name if provided, even for cached data
          if (names && names[index]) {
            cachedData.name = names[index];
            saveChallenge(cachedData); // Re-save with updated name
          }
          return { success: true, data: cachedData, url, index, challengeId };
        }
      }
      
      if (!hasAuthToken()) {
        throw new Error('Authentication required. Please set your _ncfa token in the settings.');
      }

      const authToken = getAuthToken();
      
      // Add small delay between requests in the same batch to avoid overwhelming the server
      if (batchIndex > 0) {
        await new Promise(resolve => setTimeout(resolve, 200 * batchIndex));
      }
      
      const challengeData = await fetchChallengeResultsFromAPI(challengeId, authToken);
      
      // Apply custom name if provided
      if (names && names[index]) {
        challengeData.name = names[index];
      }
      
      // Save to session storage but DON'T append to challenge list yet
      saveChallenge(challengeData);
      
      return { success: true, data: challengeData, url, index, challengeId };
    } catch (error) {
      console.error(`Failed to fetch challenge for ${url}:`, error);
      const errorInfo = { success: false, error: error.message, url, index };
      return errorInfo;
    }
  });

  return await Promise.allSettled(batchPromises);
};

// Parallel fetch multiple challenges data with progress tracking and rate limiting
export const fetchChallengesData = async (challengeUrls, onProgress = null, forceRefresh = false, names = null) => {
  if (!Array.isArray(challengeUrls) || challengeUrls.length === 0) {
    throw new Error('challengeUrls must be a non-empty array');
  }

  // Validate names array if provided
  if (names && (!Array.isArray(names) || names.length !== challengeUrls.length)) {
    throw new Error('names array must have the same length as challengeUrls array');
  }

  let addedCount = 0;
  let failedCount = 0;
  const results = [];
  const errors = [];
  
  const updateProgress = () => {
    if (onProgress) {
      onProgress({
        addedCount,
        failedCount,
        totalCount: challengeUrls.length,
        remainingCount: challengeUrls.length - addedCount - failedCount
      });
    }
  };

  const BATCH_SIZE = 8;
  const batches = [];
  
  for (let i = 0; i < challengeUrls.length; i += BATCH_SIZE) {
    const batch = challengeUrls.slice(i, i + BATCH_SIZE).map((url, batchIndex) => ({
      url,
      index: i + batchIndex
    }));
    batches.push(batch);
  }

  // Process batches sequentially, but items within each batch in parallel
  const allResults = [];
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    
    // Add delay between batches to be respectful to the API
    if (batchIndex > 0) {
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    const batchResults = await processBatch(batch, batchIndex * BATCH_SIZE, updateProgress, forceRefresh, names);
    
    // Process batch results and update counters
    batchResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        const resultValue = result.value;
        if (resultValue.success) {
          addedCount++;
        } else {
          failedCount++;
          errors.push(resultValue);
        }
        updateProgress();
      } else {
        failedCount++;
        updateProgress();
      }
    });
    
    allResults.push(...batchResults);
  }

  // Now process all results to maintain order
  const promiseResults = allResults;

  // Create ordered results array to maintain original order
  const orderedResults = new Array(challengeUrls.length);
  const orderedChallengeIds = new Array(challengeUrls.length);
  
  // Process results and place them in correct order
  promiseResults.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const resultValue = result.value;
      if (resultValue.success) {
        orderedResults[resultValue.index] = resultValue.data;
        orderedChallengeIds[resultValue.index] = resultValue.challengeId;
        results.push(resultValue.data);
      }
    }
  });

  // Now append challenge IDs to the list in the correct order
  orderedChallengeIds.forEach(challengeId => {
    if (challengeId) {
      appendChallengeList(challengeId);
    }
  });

  // Filter out undefined entries to get only successful results in order
  const finalOrderedResults = orderedResults.filter(result => result !== undefined);

  return {
    results: finalOrderedResults,
    errors,
    addedCount,
    failedCount,
    totalCount: challengeUrls.length,
    successRate: challengeUrls.length > 0 ? (addedCount / challengeUrls.length) * 100 : 0
  };
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

export const getGameMode = (challengeData) => {
  if (challengeData.challenge.forbidMoving && challengeData.challenge.forbidRotating && challengeData.challenge.forbidZooming) {
    return 'NMPZ';
  } else if (challengeData.challenge.forbidMoving) {
    return 'No move';
  } else {
    return 'Moving';
  }
}
