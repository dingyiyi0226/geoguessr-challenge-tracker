import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import ChallengeImportForm from './components/ChallengeImportForm';
import ChallengeResults from './components/ChallengeResults';
import ChallengeTrends from './components/ChallengeTrends';
import Header from './components/Header';
import StatusMessage from './components/StatusMessage';
import { useChallengeData } from './hooks/useChallengeData';
import { usePagination } from './hooks/usePagination';

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
    sortChallengesAscending,
  } = useChallengeData();

  const CHALLENGES_PER_PAGE = 20;

  const [filteredChallenges, setFilteredChallenges] = useState(challenges);
  const pagination = usePagination(filteredChallenges, CHALLENGES_PER_PAGE);
  
  // Global status message state
  const [statusMessage, setStatusMessage] = useState({ type: '', content: '' });

  // Handle filter changes from ChallengeResults
  const handleFilterChange = useCallback((filtered) => {
    setFilteredChallenges(filtered);
  }, []);

  // Handle status message close
  const handleCloseStatusMessage = useCallback(() => {
    setStatusMessage({ type: '', content: '' });
  }, []);

  React.useEffect(() => {
    setFilteredChallenges(challenges);
  }, [challenges]);

  return (
    <AppContainer>
      <MainContent>
        <Header />
        <ContentBody>
          <ChallengeImportForm 
            onAddChallenge={addChallenge}
            hasExistingChallenges={challenges.length > 0}
            onLoadDemoData={loadDemoData}
            onStatusUpdate={setStatusMessage}
          />
          <StatusMessage type={statusMessage.type} content={statusMessage.content} onClose={handleCloseStatusMessage} />
          {challenges.length > 0 && (
            <>
              <ChallengeResults 
                allChallenges={challenges}
                challenges={filteredChallenges}
                pagination={pagination}
                onRemoveChallenge={removeChallengeFromList}
                onClearAll={clearAll}
                onUpdateChallengeName={handleUpdateChallengeName}
                onReorderChallenges={handleReorderChallenges}
                onImportChallenges={handleImportChallenges}
                onSortChallenges={sortChallengesAscending}
                onFilterChange={handleFilterChange}
                onStatusUpdate={setStatusMessage}
              />
              <ChallengeTrends 
                challenges={pagination.currentPageItems} 
                isPagedView={pagination.isPagedView}
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalChallenges={filteredChallenges.length}
              />
            </>
          )}
        </ContentBody>
      </MainContent>
    </AppContainer>
  );
}

export default App; 