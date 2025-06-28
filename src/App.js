import React, { useState } from 'react';
import styled from 'styled-components';
import ChallengeForm from './components/ChallengeForm';
import ResultsTable from './components/ResultsTable';
import Header from './components/Header';

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

  const addChallenge = (challengeData) => {
    setChallenges(prev => [...prev, challengeData]);
  };

  const removeChallenge = (index) => {
    setChallenges(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setChallenges([]);
    setError('');
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
              onRemoveChallenge={removeChallenge}
              onClearAll={clearAll}
            />
          )}
        </ContentBody>
      </MainContent>
    </AppContainer>
  );
}

export default App; 