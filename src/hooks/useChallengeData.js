import { useState, useEffect, useCallback } from 'react';
import { 
  loadAllChallenges, 
  clearAllChallenges,
  removeChallenge,
  updateChallengeName,
  updateChallengeOrder,
  saveChallenge,
  appendChallengeList
} from '../utils/sessionStorage';
import demoChallenges from '../data/demoChallenges.json';

/**
 * Custom hook for managing challenge data and operations
 *
 */
export const useChallengeData = () => {
  const [challenges, setChallenges] = useState([]);

  useEffect(() => {
    const storedChallenges = loadAllChallenges();
    if (storedChallenges.length > 0) {
      setChallenges(storedChallenges);
      console.log(`Restored ${storedChallenges.length} challenges from session storage`);
    }
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

  const removeChallengeFromList = useCallback((index) => {
    setChallenges(prev => {
      const challengeToRemove = prev[index];
      if (challengeToRemove) {
        // Remove from session storage as well
        removeChallenge(challengeToRemove.id);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // Clear all challenges
  const clearAll = useCallback(() => {
    setChallenges([]);
    // Clear session storage as well
    clearAllChallenges();
  }, []);

  // Update challenge name
  const handleUpdateChallengeName = useCallback((challengeIndex, newName) => {
    setChallenges(prev => {
      const updatedChallenges = [...prev];
      const challenge = updatedChallenges[challengeIndex];
      
      if (challenge) {
        // Update in state
        updatedChallenges[challengeIndex] = {
          ...challenge,
          name: newName
        };
        
        updateChallengeName(challenge.id, newName);
      }
      
      return updatedChallenges;
    });
  }, []);

  const handleReorderChallenges = useCallback((sourceIndex, destinationIndex) => {
    setChallenges(prev => {
      const updatedChallenges = [...prev];
      const [reorderedChallenge] = updatedChallenges.splice(sourceIndex, 1);
      updatedChallenges.splice(destinationIndex, 0, reorderedChallenge);
      
      // Update the order in session storage
      const challengeIds = updatedChallenges.map(challenge => challenge.id);
      updateChallengeOrder(challengeIds);
      
      return updatedChallenges;
    });
  }, []);

  const handleImportChallenges = useCallback((importedChallenges) => {
    let addedCount = 0;
    
    setChallenges(prev => {
      const updatedChallenges = [...prev];
      const existingIds = new Set(prev.map(challenge => challenge.id));
      
      // Add only new challenges (avoid duplicates)
      for (const challenge of importedChallenges) {
        if (!existingIds.has(challenge.id)) {
          saveChallenge(challenge);
          appendChallengeList(challenge.id);
          updatedChallenges.push(challenge);
          addedCount++;
        }
      }
      
      return updatedChallenges;
    });
    
    return addedCount;
  }, []);

  const loadDemoData = useCallback(() => {
    if (demoChallenges && demoChallenges.challenges && demoChallenges.challenges.length > 0) {
      let addedCount = 0;
      
      setChallenges(prev => {
        const updatedChallenges = [...prev];
        const existingIds = new Set(prev.map(challenge => challenge.id));
        
        for (const challenge of demoChallenges.challenges) {
          if (!existingIds.has(challenge.id)) {
            saveChallenge(challenge);
            appendChallengeList(challenge.id);
            updatedChallenges.push(challenge);
            addedCount++;
          }
        }
        
        return updatedChallenges;
      });
      
      console.log(`Loaded ${addedCount} demo challenges`);
      return addedCount;
    }
    return 0;
  }, []);

  return {
    challenges,
    addChallenge,
    removeChallengeFromList,
    clearAll,
    handleUpdateChallengeName,
    handleReorderChallenges,
    handleImportChallenges,
    loadDemoData,
  };
}; 