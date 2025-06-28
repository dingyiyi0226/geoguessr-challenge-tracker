import axios from 'axios';

// Extract challenge ID from various Geoguessr URL formats
const extractChallengeId = (url) => {
  const patterns = [
    /\/challenge\/([a-zA-Z0-9]+)/,
    /\/results\/([a-zA-Z0-9]+)/,
    /challenge=([a-zA-Z0-9]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  // If it's just an ID
  if (/^[a-zA-Z0-9]+$/.test(url.trim())) {
    return url.trim();
  }

  throw new Error('Invalid Geoguessr challenge URL format');
};

// Mock function to simulate API response
// In a real implementation, you would call the actual Geoguessr API
const mockFetchChallengeData = async (challengeId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  // Mock data structure
  const mockChallenges = [
    {
      id: challengeId,
      name: 'World Famous Places',
      player: 'GeoguesFan2024',
      totalScore: 24847,
      totalTime: 847,
      date: new Date().toISOString(),
      rounds: [
        { round: 1, score: 4998, time: 180 },
        { round: 2, score: 4952, time: 165 },
        { round: 3, score: 4876, time: 192 },
        { round: 4, score: 4999, time: 158 },
        { round: 5, score: 5022, time: 152 },
      ]
    },
    {
      id: challengeId,
      name: 'European Capitals',
      player: 'MapMaster',
      totalScore: 21456,
      totalTime: 623,
      date: new Date(Date.now() - 86400000).toISOString(),
      rounds: [
        { round: 1, score: 4323, time: 120 },
        { round: 2, score: 4654, time: 135 },
        { round: 3, score: 4012, time: 142 },
        { round: 4, score: 4234, time: 108 },
        { round: 5, score: 4233, time: 118 },
      ]
    },
    {
      id: challengeId,
      name: 'US States Challenge',
      player: 'AmericaExplorer',
      totalScore: 18943,
      totalTime: 567,
      date: new Date(Date.now() - 172800000).toISOString(),
      rounds: [
        { round: 1, score: 3845, time: 115 },
        { round: 2, score: 3723, time: 125 },
        { round: 3, score: 3654, time: 102 },
        { round: 4, score: 3892, time: 118 },
        { round: 5, score: 3829, time: 107 },
      ]
    }
  ];

  // Return a random challenge from our mock data
  const randomChallenge = mockChallenges[Math.floor(Math.random() * mockChallenges.length)];
  
  // Sometimes simulate an error
  if (Math.random() < 0.1) {
    throw new Error('Challenge not found or access denied');
  }

  return {
    ...randomChallenge,
    id: challengeId,
  };
};

// Main function to fetch challenge data
export const fetchChallengeData = async (challengeUrl) => {
  try {
    const challengeId = extractChallengeId(challengeUrl);
    
    // In a real implementation, you would make an actual API call like:
    // const response = await axios.get(`https://api.geoguessr.com/api/v3/challenges/${challengeId}`, {
    //   headers: {
    //     'Authorization': `Bearer ${YOUR_API_TOKEN}`,
    //   }
    // });
    // return response.data;

    // For now, use mock data
    const challengeData = await mockFetchChallengeData(challengeId);
    
    return challengeData;
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