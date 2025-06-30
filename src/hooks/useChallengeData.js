import { useState, useEffect, useCallback } from 'react';
import { 
  loadAllChallenges, 
  clearAllChallenges,
  removeChallenge,
  updateChallengeName,
  updateChallengeOrder,
  saveChallenge,
  appendChallengeList
} from '../utils/indexedDbStorage';
import demoChallenges from '../data/demoChallenges.json';

/**
 * Custom hook for managing challenge data and operations
 *
 */
export const useChallengeData = () => {
  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadChallenges = async () => {
      try {
        // Load challenges from IndexedDB
        const storedChallenges = await loadAllChallenges();
        if (storedChallenges.length > 0) {
          setChallenges(storedChallenges);
          console.log(`Restored ${storedChallenges.length} challenges from IndexedDB`);
        }
      } catch (error) {
        console.error('Error loading challenges:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChallenges();
  }, []);

  const addChallenge = useCallback((challengeData, addAtStart = false) => {
    setChallenges(prev => {
      const exists = prev.some(challenge => challenge.id === challengeData.id);
      if (exists) {
        console.log(`Challenge ${challengeData.id} already exists, not adding duplicate`);
        return prev;
      }
      return addAtStart ? [challengeData, ...prev] : [...prev, challengeData];
    });
  }, []);

  const removeChallengeFromList = useCallback(async (index) => {
    setChallenges(prev => {
      const challengeToRemove = prev[index];
      if (challengeToRemove) {
        // Remove from IndexedDB asynchronously
        removeChallenge(challengeToRemove.id).catch(error => {
          console.error('Error removing challenge from IndexedDB:', error);
        });
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // Clear all challenges
  const clearAll = useCallback(async () => {
    setChallenges([]);
    try {
      await clearAllChallenges();
    } catch (error) {
      console.error('Error clearing challenges from IndexedDB:', error);
    }
  }, []);

  // Update challenge name
  const handleUpdateChallengeName = useCallback(async (challengeIndex, newName) => {
    setChallenges(prev => {
      const updatedChallenges = [...prev];
      const challenge = updatedChallenges[challengeIndex];
      
      if (challenge) {
        // Update in state
        updatedChallenges[challengeIndex] = {
          ...challenge,
          name: newName
        };
        
        // Update in IndexedDB asynchronously
        updateChallengeName(challenge.id, newName).catch(error => {
          console.error('Error updating challenge name in IndexedDB:', error);
        });
      }
      
      return updatedChallenges;
    });
  }, []);

  const handleReorderChallenges = useCallback(async (sourceIndex, destinationIndex) => {
    setChallenges(prev => {
      const updatedChallenges = [...prev];
      const [reorderedChallenge] = updatedChallenges.splice(sourceIndex, 1);
      updatedChallenges.splice(destinationIndex, 0, reorderedChallenge);
      
      // Update the order in IndexedDB asynchronously
      const challengeIds = updatedChallenges.map(challenge => challenge.id);
      updateChallengeOrder(challengeIds).catch(error => {
        console.error('Error updating challenge order in IndexedDB:', error);
      });
      
      return updatedChallenges;
    });
  }, []);

  const handleImportChallenges = useCallback(async (importedChallenges) => {
    let addedCount = 0;
    
    const updatedChallenges = [...challenges];
    const existingIds = new Set(challenges.map(challenge => challenge.id));
    
    // Add only new challenges (avoid duplicates)
    for (const challenge of importedChallenges) {
      if (!existingIds.has(challenge.id)) {
        try {
          await saveChallenge(challenge);
          await appendChallengeList(challenge.id);
          updatedChallenges.push(challenge);
          addedCount++;
        } catch (error) {
          console.error(`Error saving challenge ${challenge.id} to IndexedDB:`, error);
        }
      }
    }
    
    setChallenges(updatedChallenges);
    return addedCount;
  }, [challenges]);

  const loadDemoData = useCallback(async () => {
    if (demoChallenges && demoChallenges.challenges && demoChallenges.challenges.length > 0) {
      let addedCount = 0;
      
      const updatedChallenges = [...challenges];
      const existingIds = new Set(challenges.map(challenge => challenge.id));
      
      for (const challenge of demoChallenges.challenges) {
        if (!existingIds.has(challenge.id)) {
          try {
            await saveChallenge(challenge);
            await appendChallengeList(challenge.id);
            updatedChallenges.push(challenge);
            addedCount++;
          } catch (error) {
            console.error(`Error saving demo challenge ${challenge.id} to IndexedDB:`, error);
          }
        }
      }
      
      setChallenges(updatedChallenges);
      console.log(`Loaded ${addedCount} demo challenges`);
      return addedCount;
    }
    return 0;
  }, [challenges]);

  const sortChallengesAscending = useCallback(async () => {
    setChallenges(prev => {
      const sortedChallenges = [...prev].sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
      
      // Update the order in IndexedDB asynchronously
      const challengeIds = sortedChallenges.map(challenge => challenge.id);
      updateChallengeOrder(challengeIds).catch(error => {
        console.error('Error updating challenge order in IndexedDB:', error);
      });
      
      return sortedChallenges;
    });
  }, []);

  return {
    challenges,
    isLoading,
    addChallenge,
    removeChallengeFromList,
    clearAll,
    handleUpdateChallengeName,
    handleReorderChallenges,
    handleImportChallenges,
    loadDemoData,
    sortChallengesAscending,
  };
}; 