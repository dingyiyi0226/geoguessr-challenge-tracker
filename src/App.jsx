import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { Text, List, Stack } from '@mantine/core';
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
    isLoading,
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

  // Show welcome message in production mode when app first loads with no challenges
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && !isLoading && challenges.length === 0) {
        setStatusMessage({
          type: 'info',
          content: (
            <Stack gap="xs">
              <Text size="sm">Run the website locally to unlock extra features like direct API access and advanced imports. See the <a href="https://github.com/dingyiyi0226/geoguessr-challenge-tracker" target="_blank">GitHub repo</a> for more information.</Text>
              <Text size="sm">You can import challenges by:</Text>
              <List size="sm" spacing="xs">
                <List.Item>GeoGuessr challenge URL</List.Item>
                <List.Item>Discord messages containing multiple challenge URLs</List.Item>
              </List>
            </Stack>
          )
        });
    }
  }, [isLoading, challenges.length]);

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