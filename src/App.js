import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ChallengeImportForm from './components/ChallengeImportForm';
import ChallengeResults from './components/ChallengeResults';
import ChallengeTrends from './components/ChallengeTrends';
import Header from './components/Header';
import { useChallengeData } from './hooks/useChallengeData';

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
  const {
    challenges,
    addChallenge,
    removeChallengeFromList,
    clearAll,
    handleUpdateChallengeName,
    handleReorderChallenges,
    handleImportChallenges,
    loadDemoData,
  } = useChallengeData();

  const [currentPage, setCurrentPage] = useState(1);
  const CHALLENGES_PER_PAGE = 20;

  // Reset to valid page when challenges change
  useEffect(() => {
    const totalPages = Math.ceil(challenges.length / CHALLENGES_PER_PAGE);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (currentPage < 1 && challenges.length > 0) {
      setCurrentPage(1);
    }
  }, [challenges.length, currentPage, CHALLENGES_PER_PAGE]);

  // Calculate pagination
  const totalPages = Math.ceil(challenges.length / CHALLENGES_PER_PAGE);
  const startIndex = (currentPage - 1) * CHALLENGES_PER_PAGE;
  const endIndex = startIndex + CHALLENGES_PER_PAGE;
  const currentPageChallenges = challenges.slice(startIndex, endIndex);

  return (
    <AppContainer>
      <MainContent>
        <Header />
        <ContentBody>
          <ChallengeImportForm 
            onAddChallenge={addChallenge}
            hasExistingChallenges={challenges.length > 0}
            onLoadDemoData={loadDemoData}
          />
          {challenges.length > 0 && (
            <>
              <ChallengeResults 
                challenges={challenges}
                currentPageChallenges={currentPageChallenges}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
                challengesPerPage={CHALLENGES_PER_PAGE}
                startIndex={startIndex}
                endIndex={endIndex}
                onRemoveChallenge={removeChallengeFromList}
                onClearAll={clearAll}
                onUpdateChallengeName={handleUpdateChallengeName}
                onReorderChallenges={handleReorderChallenges}
                onImportChallenges={handleImportChallenges}
              />
              <ChallengeTrends 
                challenges={currentPageChallenges} 
                isPagedView={totalPages > 1}
                currentPage={currentPage}
                totalPages={totalPages}
                totalChallenges={challenges.length}
              />
            </>
          )}
        </ContentBody>
      </MainContent>
    </AppContainer>
  );
}

export default App; 