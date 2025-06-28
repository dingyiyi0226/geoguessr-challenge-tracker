import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import AddChallengeForm from './components/AddChallengeForm';
import ChallengeResults from './components/ChallengeResults';
import ChallengeTrends from './components/ChallengeTrends';
import Header from './components/Header';
import { 
  loadAllChallenges, 
  clearAllChallenges,
  removeChallenge,
  updateChallengeName,
  updateChallengeOrder,
  saveChallenge 
} from './utils/sessionStorage';

const AppContainer = styled.div`
  min-height: 100vh;
  padding: 20px;
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const ContentBody = styled.div`
  padding: 30px;
`;

function App() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load challenges from session storage on component mount
  useEffect(() => {
    const storedChallenges = loadAllChallenges();
    if (storedChallenges.length > 0) {
      setChallenges(storedChallenges);
      console.log(`Restored ${storedChallenges.length} challenges from session storage`);
    }
  }, []);

  const addChallenge = (challengeData, addAtStart = false) => {
    setChallenges(prev => {
      // Check if challenge already exists to avoid duplicates
      const exists = prev.some(challenge => challenge.id === challengeData.id);
      if (exists) {
        console.log(`Challenge ${challengeData.id} already exists, not adding duplicate`);
        return prev;
      }
      return addAtStart ? [challengeData, ...prev] : [...prev, challengeData];
    });
  };

  const removeChallengeFromList = (index) => {
    setChallenges(prev => {
      const challengeToRemove = prev[index];
      if (challengeToRemove) {
        // Remove from session storage as well
        removeChallenge(challengeToRemove.id);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const clearAll = () => {
    setChallenges([]);
    setError('');
    // Clear session storage as well
    clearAllChallenges();
  };

  const handleUpdateChallengeName = (challengeIndex, newName) => {
    setChallenges(prev => {
      const updatedChallenges = [...prev];
      const challenge = updatedChallenges[challengeIndex];
      
      if (challenge) {
        // Update in state
        updatedChallenges[challengeIndex] = {
          ...challenge,
          name: newName
        };
        
        // Update in session storage
        updateChallengeName(challenge.id, newName);
      }
      
      return updatedChallenges;
    });
  };

  const handleReorderChallenges = (sourceIndex, destinationIndex) => {
    setChallenges(prev => {
      const updatedChallenges = [...prev];
      const [reorderedChallenge] = updatedChallenges.splice(sourceIndex, 1);
      updatedChallenges.splice(destinationIndex, 0, reorderedChallenge);
      
      // Update the order in session storage
      const challengeIds = updatedChallenges.map(challenge => challenge.id);
      updateChallengeOrder(challengeIds);
      
      return updatedChallenges;
    });
  };

  const handleImportChallenges = (importedChallenges) => {
    let addedCount = 0;
    
    setChallenges(prev => {
      const updatedChallenges = [...prev];
      const existingIds = new Set(prev.map(challenge => challenge.id));
      
      // Add only new challenges (avoid duplicates)
      for (const challenge of importedChallenges) {
        if (!existingIds.has(challenge.id)) {
          saveChallenge(challenge);
          updatedChallenges.push(challenge);
          addedCount++;
        }
      }
      
      return updatedChallenges;
    });
    
    return addedCount;
  };

  return (
    <AppContainer>
      <MainContent>
        <Header />
        <ContentBody>
          <AddChallengeForm 
            onAddChallenge={addChallenge}
            loading={loading}
            setLoading={setLoading}
            error={error}
            setError={setError}
            hasExistingChallenges={challenges.length > 0}
          />
          {challenges.length > 0 && (
            <>
              <ChallengeResults 
                challenges={challenges}
                onRemoveChallenge={removeChallengeFromList}
                onClearAll={clearAll}
                onUpdateChallengeName={handleUpdateChallengeName}
                onReorderChallenges={handleReorderChallenges}
                onImportChallenges={handleImportChallenges}
              />
              <ChallengeTrends challenges={challenges} />
            </>
          )}
        </ContentBody>
      </MainContent>
    </AppContainer>
  );
}

export default App; 