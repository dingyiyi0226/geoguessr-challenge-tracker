import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button, Group, Loader, TextInput, Switch } from '@mantine/core';
import { fetchChallengeData, hasAuthToken, setAuthToken, clearAuthToken, getChallengeIDFromUrl } from '../utils/geoguessrApi';
import { hasChallenge, getChallengesList, updateChallengeName, updateChallengeOrder, saveChallenge, appendChallengeList, batchSaveChallenges } from '../utils/indexedDbStorage';
import { importChallenges } from '../utils/fileOperations';

import AuthSection from './AuthSection';
import DiscordImporter from './DiscordImporter';
import CorsNotice from './CorsNotice';

const FormContainer = styled.div`
  margin-bottom: 30px;
`;

const FormTitle = styled.h2`
  color: #333;
  margin-bottom: 20px;
  font-size: 1.5rem;
  font-weight: 600;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const InstructionsText = styled.div`
  font-size: 0.9rem;
  color: #666;
  line-height: 1.5;
  margin-top: 10px;

  strong {
    color: #333;
  }

  ol {
    margin: 10px 0;
    padding-left: 20px;
  }

  li {
    margin: 5px 0;
  }
`;

const ChallengeImportOptionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 15px;
  padding-left: 15px;
  padding-right: 15px;
`;



const OptionsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  justify-content: flex-start;

  &:not(:first-child) {
    margin-top: 0;
  }
`;

function ChallengeImportForm({ onAddChallenge, hasExistingChallenges, onLoadDemoData, onStatusUpdate }) {
  const [challengeUrl, setChallengeUrl] = useState('');
  const [authToken, setAuthTokenInput] = useState('');
  const [showAuthInput, setShowAuthInput] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(hasAuthToken());
  const [forceRefresh, setForceRefresh] = useState(false);
  const [addAtStart, setAddAtStart] = useState(false);
  const [showCustomNameInput, setShowCustomNameInput] = useState(false);
  const [customName, setCustomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCached, setIsCached] = useState(false);

  // Update cache status when URL changes
  useEffect(() => {
    const checkCacheStatus = async () => {
      const currentChallengeId = getChallengeIDFromUrl(challengeUrl);
      if (currentChallengeId) {
        const cached = await hasChallenge(currentChallengeId);
        setIsCached(cached);
      } else {
        setIsCached(false);
      }
    };

    if (challengeUrl.trim()) {
      checkCacheStatus();
    } else {
      setIsCached(false);
    }
  }, [challengeUrl]);

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (authToken.trim()) {
      setAuthToken(authToken.trim());
      setIsAuthenticated(true);
      setAuthTokenInput('');
      setShowAuthInput(false);
      onStatusUpdate?.({ type: '', content: '' });
    }
  };

  const handleAuthClear = () => {
    clearAuthToken();
    setIsAuthenticated(false);
    onStatusUpdate?.({ type: '', content: '' });
  };

  const handleImportFromFile = async () => {
    try {
      setLoading(true);
      onStatusUpdate?.({ type: '', content: '' });
      
      // Use the utility function to import
      const importedChallenges = await importChallenges();
      if (importedChallenges === null) {
        return;
      }
      
      // Get existing challenges before batch insert
      const existingChallengeIds = await getChallengesList();
      const existingIdsSet = new Set(existingChallengeIds);
      
      // Use batch insert for better performance
      const result = await batchSaveChallenges(importedChallenges);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      const { addedCount, totalProcessed } = result;
      
      // Add only the newly imported challenges to React state
      if (addedCount > 0) {
        for (const challenge of importedChallenges) {
          // Only add to state if it wasn't already in the database before import
          if (!existingIdsSet.has(challenge.id)) {
            onAddChallenge(challenge, false); // Add to back by default
          }
        }
      }
      
      if (addedCount > 0) {
        onStatusUpdate?.({ type: 'info', content: `Successfully imported ${addedCount} challenges!` });
      } else {
        onStatusUpdate?.({ type: 'info', content: 'All challenges from the file already exist.' });
      }
      
      console.log(`Imported ${addedCount} out of ${totalProcessed} challenges using batch insert`);
    } catch (err) {
      console.error('Error importing challenges:', err);
      onStatusUpdate?.({ type: 'error', content: err.message || 'Failed to import challenges. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDemoData = async () => {
    try {
      setLoading(true);
      onStatusUpdate?.({ type: '', content: '' });
      
      const addedCount = await onLoadDemoData();
      
      if (addedCount > 0) {
        onStatusUpdate?.({ type: 'info', content: `Successfully loaded ${addedCount} demo challenges!` });
      } else {
        onStatusUpdate?.({ type: 'warning', content: 'All demo challenges already exist.' });
      }
      
      console.log(`Loaded ${addedCount} demo challenges`);
    } catch (err) {
      console.error('Error loading demo data:', err);
      onStatusUpdate?.({ type: 'error', content: err.message || 'Failed to load demo data. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e, forceRefreshParam = false, addAtStart = false) => {
    e.preventDefault();
    
    if (!challengeUrl.trim()) {
      onStatusUpdate?.({ type: 'error', content: 'Please enter a challenge URL' });
      return;
    }

    setLoading(true);
    onStatusUpdate?.({ type: '', content: '' });

    try {
      const challengeData = await fetchChallengeData(challengeUrl, forceRefreshParam || forceRefresh);
      
      // Apply custom name if provided
      const finalChallengeData = {
        ...challengeData,
        name: customName.trim() || challengeData.name
      };

      if (addAtStart) {
        const currentChallenges = await getChallengesList();
        const updatedOrder = [challengeData.id, ...currentChallenges.filter(id => id !== challengeData.id)];
        await updateChallengeOrder(updatedOrder);
      }
      if (customName.trim()) {
        await updateChallengeName(challengeData.id, customName.trim());
      }
      
      onAddChallenge(finalChallengeData, addAtStart);
      setChallengeUrl('');
      setCustomName('');
      setShowCustomNameInput(false);
      setForceRefresh(false);
      
      // Show cache status info
      if (challengeData.cachedAt && !forceRefreshParam && !forceRefresh) {
        const cacheAge = Math.round((Date.now() - challengeData.cachedAt) / 60000);
        onStatusUpdate?.({ type: 'info', content: `Note: Loaded from cache (${cacheAge} minute${cacheAge !== 1 ? 's' : ''} old). Use "Refresh" for latest data.` });
      }
      

    } catch (err) {
      onStatusUpdate?.({ type: 'error', content: err.message || 'Failed to fetch challenge data. Please check the URL and try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDiscordStatusUpdate = (status) => {
    onStatusUpdate?.(status);
  };

  return (
    <FormContainer>
      <FormTitle>Add Challenge</FormTitle>
      
      <AuthSection
        isAuthenticated={isAuthenticated}
        showAuthInput={showAuthInput}
        authToken={authToken}
        setAuthTokenInput={setAuthTokenInput}
        handleAuthSubmit={handleAuthSubmit}
        handleAuthClear={handleAuthClear}
        setShowAuthInput={setShowAuthInput}
        loading={loading}
      />
      <CorsNotice />
      
      <form onSubmit={handleSubmit}>
        <InputGroup>
          <TextInput
            value={challengeUrl}
            onChange={(e) => setChallengeUrl(e.target.value)}
            placeholder="Enter Geoguessr challenge URL (e.g., https://www.geoguessr.com/challenge/...)"
            disabled={loading}
            size="md"
            radius="md"
            style={{ flex: 1, minWidth: '300px' }}
          />
          <Button 
            type="submit" 
            disabled={loading || !challengeUrl.trim()}
            color="violet"
            size="md"
            radius="md"
            leftSection={loading ? <Loader size="xs" color="white" /> : null}
          >
            {loading ? 'Fetching...' : (isCached ? 'Load Cached' : 'Add Challenge')}
          </Button>
          {isCached && (
            <Button 
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading}
              color="orange"
              size="sm"
              radius="md"
              leftSection={loading ? <Loader size="xs" color="white" /> : null}
            >
              {loading ? 'Refreshing...' : '🔄 Refresh'}
            </Button>
          )}
        </InputGroup>
        
        <ChallengeImportOptionsContainer>
          <OptionsRow>
            <Switch
              checked={addAtStart}
              onChange={(event) => setAddAtStart(event.currentTarget.checked)}
              label={`Add at ${addAtStart ? 'start' : 'end'}`}
              color="gray"
              size="sm"
            />
            
            <Button
              type="button"
              variant={showCustomNameInput ? "filled" : "outline"}
              color="blue"
              size="sm"
              radius="md"
              onClick={() => {
                setShowCustomNameInput(!showCustomNameInput);
                if (showCustomNameInput) {
                  setCustomName('');
                }
              }}
            >
              Challenge Name
            </Button>
            {showCustomNameInput && (
              <TextInput
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Custom challenge name"
                size="sm"
                radius="md"
                style={{ flex: 1, maxWidth: '300px' }}
              />
            )}
            {!hasExistingChallenges && (
              <>
                <Button
                  type="button"
                  onClick={handleLoadDemoData}
                  disabled={loading}
                  color="teal"
                  size="sm"
                  radius="md"
                >
                  🎮 Load Demo Data
                </Button>
                <Button
                  type="button"
                  onClick={handleImportFromFile}
                  disabled={loading}
                  color="blue"
                  size="sm"
                  radius="md"
                >
                  📁 Import from file
                </Button>
              </>
            )}
            <DiscordImporter
              onAddChallenge={onAddChallenge}
              onStatusUpdate={handleDiscordStatusUpdate}
              disabled={loading}
            />
            
          </OptionsRow>
        </ChallengeImportOptionsContainer>
        
        {challengeUrl.trim() && (
          <InstructionsText style={{ marginTop: '10px', marginLeft: '15px', fontSize: '0.8rem' }}>
            {isCached ? (
              <span style={{ color: '#28a745' }}>
                ✅ This challenge is cached - will load instantly. Use "Refresh" for latest data.
              </span>
            ) : (
              <span style={{ color: '#666' }}>
                💾 This challenge will be cached after first load.
              </span>
            )}
          </InstructionsText>
        )}
      </form>
    </FormContainer>
  );
}

export default ChallengeImportForm; 