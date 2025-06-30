import { openDB } from 'idb';

const DB_NAME = 'GeoguessrChallengeTracker';
const DB_VERSION = 1;
const CHALLENGES_STORE = 'challenges';
const METADATA_STORE = 'metadata';
const CHALLENGES_LIST_KEY = 'challenges_list';

let dbPromise;

const initDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create challenges store
        if (!db.objectStoreNames.contains(CHALLENGES_STORE)) {
          const challengesStore = db.createObjectStore(CHALLENGES_STORE, {
            keyPath: 'id'
          });
          challengesStore.createIndex('cachedAt', 'cachedAt');
        }
        
        // Create metadata store for storing lists and other metadata
        if (!db.objectStoreNames.contains(METADATA_STORE)) {
          db.createObjectStore(METADATA_STORE);
        }
      },
    });
  }
  return dbPromise;
};

// Save individual challenge data to IndexedDB
export const saveChallenge = async (challengeData) => {
  try {
    const db = await initDB();
    const dataToStore = {
      ...challengeData,
      cachedAt: Date.now(),
      version: '1.0'
    };
    
    await db.put(CHALLENGES_STORE, dataToStore);
    console.log(`Challenge ${challengeData.id} saved to IndexedDB`);
    return true;
  } catch (error) {
    console.error('Error saving challenge to IndexedDB:', error);
    return false;
  }
};

// Load individual challenge data from IndexedDB
export const loadChallenge = async (challengeId) => {
  try {
    const db = await initDB();
    const challengeData = await db.get(CHALLENGES_STORE, challengeId);
    
    if (!challengeData) {
      return null;
    }
    
    // Check if data is valid
    if (!challengeData.id || challengeData.id !== challengeId) {
      console.warn(`Invalid stored data for challenge ${challengeId}`);
      await removeChallenge(challengeId);
      return null;
    }
    
    console.log(`Challenge ${challengeId} loaded from IndexedDB`);
    return challengeData;
  } catch (error) {
    console.error('Error loading challenge from IndexedDB:', error);
    return null;
  }
};

// Remove individual challenge from IndexedDB
export const removeChallenge = async (challengeId) => {
  try {
    const db = await initDB();
    await db.delete(CHALLENGES_STORE, challengeId);
    
    // Update the challenges list
    const challengesList = await getChallengesList();
    const updatedList = challengesList.filter(id => id !== challengeId);
    await db.put(METADATA_STORE, updatedList, CHALLENGES_LIST_KEY);
    
    console.log(`Challenge ${challengeId} removed from IndexedDB`);
    return true;
  } catch (error) {
    console.error('Error removing challenge from IndexedDB:', error);
    return false;
  }
};

// Get list of all stored challenge IDs
export const getChallengesList = async () => {
  try {
    const db = await initDB();
    const storedList = await db.get(METADATA_STORE, CHALLENGES_LIST_KEY);
    return storedList || [];
  } catch (error) {
    console.error('Error loading challenges list:', error);
    return [];
  }
};

// Update the order of challenges in storage
export const updateChallengeOrder = async (challengeIds) => {
  try {
    const db = await initDB();
    await db.put(METADATA_STORE, challengeIds, CHALLENGES_LIST_KEY);
    console.log('Challenge order updated in IndexedDB');
    return true;
  } catch (error) {
    console.error('Error updating challenge order:', error);
    return false;
  }
};

// Load all stored challenges
export const loadAllChallenges = async () => {
  try {
    const challengesList = await getChallengesList();
    const challenges = [];
    
    for (const challengeId of challengesList) {
      const challengeData = await loadChallenge(challengeId);
      if (challengeData) {
        challenges.push(challengeData);
      }
    }
    
    console.log(`Loaded ${challenges.length} challenges from IndexedDB`);
    return challenges;
  } catch (error) {
    console.error('Error loading all challenges from IndexedDB:', error);
    return [];
  }
};

// Clear all stored challenge data
export const clearAllChallenges = async () => {
  try {
    const db = await initDB();
    
    // Clear all challenges
    await db.clear(CHALLENGES_STORE);
    
    // Clear the challenges list
    await db.delete(METADATA_STORE, CHALLENGES_LIST_KEY);
    
    console.log('All challenges cleared from IndexedDB');
    return true;
  } catch (error) {
    console.error('Error clearing challenges from IndexedDB:', error);
    return false;
  }
};

// Check if a challenge is already stored
export const hasChallenge = async (challengeId) => {
  try {
    const db = await initDB();
    const challengeData = await db.get(CHALLENGES_STORE, challengeId);
    return challengeData !== undefined;
  } catch (error) {
    console.error('Error checking challenge in storage:', error);
    return false;
  }
};

// Update challenge name in IndexedDB
export const updateChallengeName = async (challengeId, newName) => {
  try {
    const challengeData = await loadChallenge(challengeId);
    if (!challengeData) {
      console.warn(`Challenge ${challengeId} not found in storage for name update`);
      return false;
    }
    
    const updatedData = {
      ...challengeData,
      name: newName,
      lastModified: Date.now()
    };
    
    const db = await initDB();
    await db.put(CHALLENGES_STORE, updatedData);
    
    console.log(`Challenge ${challengeId} name updated to: ${newName}`);
    return true;
  } catch (error) {
    console.error('Error updating challenge name in IndexedDB:', error);
    return false;
  }
};

// Append challenge to the list
export const appendChallengeList = async (challengeId) => {
  try {
    const challengesList = await getChallengesList();
    if (!challengesList.includes(challengeId)) {
      challengesList.push(challengeId);
      const db = await initDB();
      await db.put(METADATA_STORE, challengesList, CHALLENGES_LIST_KEY);
    }
    return true;
  } catch (error) {
    console.error('Error appending to challenges list:', error);
    return false;
  }
};

// Batch save multiple challenges efficiently
export const batchSaveChallenges = async (challengesData) => {
  try {
    const db = await initDB();
    
    // Get current challenges list and existing challenges
    const currentChallengesList = await getChallengesList();
    const existingChallengesIds = new Set(currentChallengesList);
    
    // Filter out challenges that already exist
    const challengesToSave = [];
    const newChallengeIds = [];
    
    for (const challengeData of challengesData) {
      if (!existingChallengesIds.has(challengeData.id)) {
        const dataToStore = {
          ...challengeData,
          cachedAt: Date.now(),
          version: '1.0'
        };
        
        challengesToSave.push(dataToStore);
        newChallengeIds.push(challengeData.id);
      }
    }
    
    if (challengesToSave.length === 0) {
      console.log('No new challenges to save');
      return { addedCount: 0, totalProcessed: challengesData.length };
    }
    
    // Start a transaction for batch operations
    const tx = db.transaction([CHALLENGES_STORE, METADATA_STORE], 'readwrite');
    const challengesStore = tx.objectStore(CHALLENGES_STORE);
    const metadataStore = tx.objectStore(METADATA_STORE);
    
    // Batch insert all new challenges
    for (const challenge of challengesToSave) {
      challengesStore.put(challenge);
    }
    
    // Update the challenges list with new IDs
    const updatedChallengesList = [...currentChallengesList, ...newChallengeIds];
    metadataStore.put(updatedChallengesList, CHALLENGES_LIST_KEY);
    
    // Wait for transaction to complete
    await tx.complete;
    
    console.log(`Batch saved ${challengesToSave.length} challenges to IndexedDB`);
    return { addedCount: challengesToSave.length, totalProcessed: challengesData.length };
  } catch (error) {
    console.error('Error batch saving challenges to IndexedDB:', error);
    return { addedCount: 0, totalProcessed: challengesData.length, error: error.message };
  }
}; 