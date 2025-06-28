import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ChallengeForm from './components/ChallengeForm';
import ResultsTable from './components/ResultsTable';
import Header from './components/Header';
import { 
  loadAllChallenges, 
  clearAllChallenges,
  removeChallenge 
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

  const addChallenge = (challengeData) => {
    setChallenges(prev => {
      // Check if challenge already exists to avoid duplicates
      const exists = prev.some(challenge => challenge.id === challengeData.id);
      if (exists) {
        console.log(`Challenge ${challengeData.id} already exists, not adding duplicate`);
        return prev;
      }
      return [...prev, challengeData];
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

  return (
    <AppContainer>
      <MainContent>
        <Header />
        <ContentBody>
          <ChallengeForm 
            onAddChallenge={addChallenge}
            loading={loading}
            setLoading={setLoading}
            error={error}
            setError={setError}
          />
          {challenges.length > 0 && (
            <ResultsTable 
              challenges={challenges}
              onRemoveChallenge={removeChallengeFromList}
              onClearAll={clearAll}
            />
          )}
        </ContentBody>
      </MainContent>
    </AppContainer>
  );
}

export default App; 