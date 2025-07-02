import { useState, useEffect, useCallback } from 'react';
import { 
  loadAllChallenges, 
  clearAllChallenges,
  removeChallenge,
  updateChallengeName,
  updateChallengeOrder,
  batchSaveChallenges
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

  const addChallenge = useCallback((challengeData, addAtStart = false, forceUpdate = false) => {
    setChallenges(prev => {
      const existingIndex = prev.findIndex(challenge => challenge.id === challengeData.id);
      if (existingIndex !== -1) {
        if (forceUpdate) {
          // Update existing challenge with new data
          const updatedChallenges = [...prev];
          updatedChallenges[existingIndex] = challengeData;
          console.log(`Challenge ${challengeData.id} updated with fresh data`);
          return updatedChallenges;
        } else {
          console.log(`Challenge ${challengeData.id} already exists, not adding duplicate`);
          return prev;
        }
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
    const existingIds = new Set(challenges.map(challenge => challenge.id));
    
    // Filter out challenges that already exist in React state
    const newChallenges = importedChallenges.filter(challenge => !existingIds.has(challenge.id));
    
    if (newChallenges.length === 0) {
      return 0;
    }
    
    // Use batch insert for better performance
    const result = await batchSaveChallenges(newChallenges);
    
    if (result.error) {
      console.error('Error batch saving challenges:', result.error);
      return 0;
    }
    
    // Add successfully saved challenges to React state
    if (result.addedCount > 0) {
      setChallenges(prev => [...prev, ...newChallenges]);
    }
    
    return result.addedCount;
  }, [challenges]);

  const loadDemoData = useCallback(async () => {
    if (demoChallenges && demoChallenges.challenges && demoChallenges.challenges.length > 0) {
      const existingIds = new Set(challenges.map(challenge => challenge.id));
      
      // Filter out demo challenges that already exist
      const newDemoChallenges = demoChallenges.challenges.filter(challenge => !existingIds.has(challenge.id));
      
      if (newDemoChallenges.length === 0) {
        console.log('All demo challenges already exist');
        return 0;
      }
      
      // Use batch insert for better performance
      const result = await batchSaveChallenges(newDemoChallenges);
      
      if (result.error) {
        console.error('Error batch saving demo challenges:', result.error);
        return 0;
      }
      
      // Add successfully saved demo challenges to React state
      if (result.addedCount > 0) {
        setChallenges(prev => [...prev, ...newDemoChallenges]);
      }
      
      console.log(`Loaded ${result.addedCount} demo challenges using batch insert`);
      return result.addedCount;
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