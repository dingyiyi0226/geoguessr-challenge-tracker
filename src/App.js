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
  saveChallenge,
  appendChallengeList
} from './utils/sessionStorage';
import demoChallenges from './data/demoChallenges.json';

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
  const [currentPage, setCurrentPage] = useState(1);
  const CHALLENGES_PER_PAGE = 20;

  // Load challenges from session storage on component mount
  useEffect(() => {
    const storedChallenges = loadAllChallenges();
    if (storedChallenges.length > 0) {
      setChallenges(storedChallenges);
      console.log(`Restored ${storedChallenges.length} challenges from session storage`);
    }
  }, []);

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
          appendChallengeList(challenge.id);
          updatedChallenges.push(challenge);
          addedCount++;
        }
      }
      
      return updatedChallenges;
    });
    
    return addedCount;
  };

  const loadDemoData = () => {
    if (demoChallenges && demoChallenges.challenges && demoChallenges.challenges.length > 0) {
      let addedCount = 0;
      
      setChallenges(prev => {
        const updatedChallenges = [...prev];
        const existingIds = new Set(prev.map(challenge => challenge.id));
        
        // Add only new demo challenges (avoid duplicates)
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
  };

  return (
    <AppContainer>
      <MainContent>
        <Header />
        <ContentBody>
          <AddChallengeForm 
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