import {
  initDB,
  CHALLENGES_STORE,
  METADATA_STORE,
  CHALLENGES_LIST_KEY,
  withTransaction,
} from './db';
import { StoredChallenge } from './types';
import { ChallengeData } from '../services/types/application';

export const saveChallenge = async (
challengeData: ChallengeData
): Promise<boolean> => {
  try {
    const db = await initDB();
    const dataToStore: StoredChallenge = {
      ...challengeData,
      cachedAt: Date.now(),
      version: '1.0',
    };

    await db.put(CHALLENGES_STORE, dataToStore);
    return true;
  } catch (error) {
    console.error('Error saving challenge to IndexedDB:', error);
    return false;
  }
};

export const loadChallenge = async (
  challengeId: string
): Promise<StoredChallenge | null> => {
  try {
    const db = await initDB();
    const challengeData = await db.get(CHALLENGES_STORE, challengeId);

    if (!challengeData) {
      return null;
    }

    if (!challengeData.id || challengeData.id !== challengeId) {
      console.warn(`Invalid stored data for challenge ${challengeId}`);
      await removeChallenge(challengeId);
      return null;
    }

    return challengeData;
  } catch (error) {
    console.error('Error loading challenge from IndexedDB:', error);
    return null;
  }
};

export const removeChallenge = async (
  challengeId: string
): Promise<boolean> => {
  try {
    await withTransaction(
      [CHALLENGES_STORE, METADATA_STORE],
      'readwrite',
      async (tx) => {
        const metadataStore = tx.objectStore(METADATA_STORE);
        const challengesList =
          (await metadataStore.get(CHALLENGES_LIST_KEY)) || [];
        const updatedList = challengesList.filter(
          (id: string) => id !== challengeId
        );

        tx.objectStore(CHALLENGES_STORE).delete(challengeId);
        metadataStore.put(updatedList, CHALLENGES_LIST_KEY);
      }
    );

    return true;
  } catch (error) {
    console.error('Error removing challenge from IndexedDB:', error);
    return false;
  }
};

export const getChallengesList = async (): Promise<string[]> => {
  try {
    const db = await initDB();
    const storedList = await db.get(METADATA_STORE, CHALLENGES_LIST_KEY);
    return storedList || [];
  } catch (error) {
    console.error('Error loading challenges list:', error);
    return [];
  }
};

export const updateChallengeOrder = async (
  challengeIds: string[]
): Promise<boolean> => {
  try {
    const db = await initDB();
    await db.put(METADATA_STORE, challengeIds, CHALLENGES_LIST_KEY);
    return true;
  } catch (error) {
    console.error('Error updating challenge order:', error);
    return false;
  }
};

export const loadAllChallenges = async (): Promise<StoredChallenge[]> => {
  try {
    const challengesList = await getChallengesList();
    const challenges: StoredChallenge[] = [];

    for (const challengeId of challengesList) {
      const challengeData = await loadChallenge(challengeId);
      if (challengeData) {
        challenges.push(challengeData);
      }
    }

    return challenges;
  } catch (error) {
    console.error('Error loading all challenges from IndexedDB:', error);
    return [];
  }
};

export const clearAllChallenges = async (): Promise<boolean> => {
  try {
    await withTransaction(
      [CHALLENGES_STORE, METADATA_STORE],
      'readwrite',
      (tx) => {
        tx.objectStore(CHALLENGES_STORE).clear();
        tx.objectStore(METADATA_STORE).delete(CHALLENGES_LIST_KEY);
      }
    );
    console.log('All challenges cleared from IndexedDB');
    return true;
  } catch (error) {
    console.error('Error clearing challenges from IndexedDB:', error);
    return false;
  }
};

export const hasChallenge = async (
  challengeId: string
): Promise<boolean> => {
  try {
    const db = await initDB();
    const challengeData = await db.get(CHALLENGES_STORE, challengeId);
    return challengeData !== undefined;
  } catch (error) {
    console.error('Error checking challenge in storage:', error);
    return false;
  }
};

export const updateChallengeName = async (
  challengeId: string,
  newName: string
): Promise<boolean> => {
  try {
    const success = await withTransaction(
      CHALLENGES_STORE,
      'readwrite',
      async (tx) => {
        const store = tx.objectStore(CHALLENGES_STORE);
        const challengeData = await store.get(challengeId);

        if (!challengeData) {
          console.warn(
            `Challenge ${challengeId} not found in storage for name update`
          );
          return false;
        }

        const updatedData: StoredChallenge = {
          ...challengeData,
          name: newName,
          lastModified: Date.now(),
        };

        store.put(updatedData);
        return true;
      }
    );

    return success;
  } catch (error) {
    console.error('Error updating challenge name in IndexedDB:', error);
    return false;
  }
};

export const appendChallengeList = async (
  challengeId: string
): Promise<boolean> => {
  try {
    await withTransaction(METADATA_STORE, 'readwrite', async (tx) => {
      const store = tx.objectStore(METADATA_STORE);
      const challengesList =
        (await store.get(CHALLENGES_LIST_KEY)) || [];
      if (!challengesList.includes(challengeId)) {
        challengesList.push(challengeId);
        store.put(challengesList, CHALLENGES_LIST_KEY);
      }
    });
    return true;
  } catch (error) {
    console.error('Error appending to challenges list:', error);
    return false;
  }
};

export const batchSaveChallenges = async (
  challengesData: ChallengeData[]
): Promise<{ addedCount: number; totalProcessed: number }> => {
  try {
    const db = await initDB();
    const currentChallengesList = await getChallengesList();
    const existingChallengesIds = new Set(currentChallengesList);

    const challengesToSave: StoredChallenge[] = [];
    const newChallengeIds: string[] = [];

    for (const challengeData of challengesData) {
      if (!existingChallengesIds.has(challengeData.id)) {
        const dataToStore: StoredChallenge = {
          ...challengeData,
          cachedAt: Date.now(),
          version: '1.0',
        };
        challengesToSave.push(dataToStore);
        newChallengeIds.push(challengeData.id);
      }
    }

    if (challengesToSave.length === 0) {
      return { addedCount: 0, totalProcessed: challengesData.length };
    }

    await withTransaction(
      [CHALLENGES_STORE, METADATA_STORE],
      'readwrite',
      (tx) => {
        const challengesStore = tx.objectStore(CHALLENGES_STORE);
        const metadataStore = tx.objectStore(METADATA_STORE);

        for (const challenge of challengesToSave) {
          challengesStore.put(challenge);
        }

        const updatedChallengesList = [
          ...currentChallengesList,
          ...newChallengeIds,
        ];
        metadataStore.put(updatedChallengesList, CHALLENGES_LIST_KEY);
      }
    );

    return {
      addedCount: challengesToSave.length,
      totalProcessed: challengesData.length,
    };
  } catch (error) {
    console.error('Error batch saving challenges:', error);
    return { addedCount: 0, totalProcessed: challengesData.length };
  }
}; 