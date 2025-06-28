// Session storage utilities for challenge data persistence

const STORAGE_PREFIX = 'geoguessr_challenge_';
const CHALLENGES_LIST_KEY = 'geoguessr_challenges_list';

// Save individual challenge data to session storage
export const saveChallenge = (challengeData) => {
  try {
    const storageKey = `${STORAGE_PREFIX}${challengeData.id}`;
    const dataToStore = {
      ...challengeData,
      cachedAt: Date.now(),
      version: '1.0' // For future compatibility
    };
    
    sessionStorage.setItem(storageKey, JSON.stringify(dataToStore));
    
    // Update the challenges list
    const challengesList = getChallengesList();
    if (!challengesList.includes(challengeData.id)) {
      challengesList.push(challengeData.id);
      sessionStorage.setItem(CHALLENGES_LIST_KEY, JSON.stringify(challengesList));
    }
    
    console.log(`Challenge ${challengeData.id} saved to session storage`);
    return true;
  } catch (error) {
    console.error('Error saving challenge to session storage:', error);
    return false;
  }
};

// Load individual challenge data from session storage
export const loadChallenge = (challengeId) => {
  try {
    const storageKey = `${STORAGE_PREFIX}${challengeId}`;
    const storedData = sessionStorage.getItem(storageKey);
    
    if (!storedData) {
      return null;
    }
    
    const challengeData = JSON.parse(storedData);
    
    // Check if data is valid and not too old (optional: add expiration)
    if (!challengeData.id || challengeData.id !== challengeId) {
      console.warn(`Invalid stored data for challenge ${challengeId}`);
      removeChallenge(challengeId);
      return null;
    }
    
    console.log(`Challenge ${challengeId} loaded from session storage`);
    return challengeData;
  } catch (error) {
    console.error('Error loading challenge from session storage:', error);
    return null;
  }
};

// Remove individual challenge from session storage
export const removeChallenge = (challengeId) => {
  try {
    const storageKey = `${STORAGE_PREFIX}${challengeId}`;
    sessionStorage.removeItem(storageKey);
    
    // Update the challenges list
    const challengesList = getChallengesList();
    const updatedList = challengesList.filter(id => id !== challengeId);
    sessionStorage.setItem(CHALLENGES_LIST_KEY, JSON.stringify(updatedList));
    
    console.log(`Challenge ${challengeId} removed from session storage`);
    return true;
  } catch (error) {
    console.error('Error removing challenge from session storage:', error);
    return false;
  }
};

// Get list of all stored challenge IDs
export const getChallengesList = () => {
  try {
    const storedList = sessionStorage.getItem(CHALLENGES_LIST_KEY);
    return storedList ? JSON.parse(storedList) : [];
  } catch (error) {
    console.error('Error loading challenges list:', error);
    return [];
  }
};

// Load all stored challenges
export const loadAllChallenges = () => {
  try {
    const challengesList = getChallengesList();
    const challenges = [];
    
    for (const challengeId of challengesList) {
      const challengeData = loadChallenge(challengeId);
      if (challengeData) {
        challenges.push(challengeData);
      }
    }
    
    console.log(`Loaded ${challenges.length} challenges from session storage`);
    return challenges;
  } catch (error) {
    console.error('Error loading all challenges from session storage:', error);
    return [];
  }
};

// Clear all stored challenge data
export const clearAllChallenges = () => {
  try {
    const challengesList = getChallengesList();
    
    // Remove all individual challenge data
    for (const challengeId of challengesList) {
      const storageKey = `${STORAGE_PREFIX}${challengeId}`;
      sessionStorage.removeItem(storageKey);
    }
    
    // Clear the challenges list
    sessionStorage.removeItem(CHALLENGES_LIST_KEY);
    
    console.log('All challenges cleared from session storage');
    return true;
  } catch (error) {
    console.error('Error clearing challenges from session storage:', error);
    return false;
  }
};

// Check if a challenge is already stored
export const hasChallenge = (challengeId) => {
  try {
    const storageKey = `${STORAGE_PREFIX}${challengeId}`;
    return sessionStorage.getItem(storageKey) !== null;
  } catch (error) {
    console.error('Error checking challenge in storage:', error);
    return false;
  }
};

// Update challenge name in session storage
export const updateChallengeName = (challengeId, newName) => {
  try {
    const challengeData = loadChallenge(challengeId);
    if (!challengeData) {
      console.warn(`Challenge ${challengeId} not found in storage for name update`);
      return false;
    }
    
    const updatedData = {
      ...challengeData,
      name: newName,
      lastModified: Date.now()
    };
    
    const storageKey = `${STORAGE_PREFIX}${challengeId}`;
    sessionStorage.setItem(storageKey, JSON.stringify(updatedData));
    
    console.log(`Challenge ${challengeId} name updated to: ${newName}`);
    return true;
  } catch (error) {
    console.error('Error updating challenge name in session storage:', error);
    return false;
  }
};

// Get storage info (for debugging)
export const getStorageInfo = () => {
  try {
    const challengesList = getChallengesList();
    const storageSize = new Blob([JSON.stringify(sessionStorage)]).size;
    
    return {
      challengeCount: challengesList.length,
      challengeIds: challengesList,
      approximateSize: `${(storageSize / 1024).toFixed(2)} KB`
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return { challengeCount: 0, challengeIds: [], approximateSize: '0 KB' };
  }
}; 