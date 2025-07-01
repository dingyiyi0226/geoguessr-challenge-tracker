import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button, Group, Loader, TextInput, Switch, Textarea } from '@mantine/core';
import { fetchChallengeData, hasAuthToken, setAuthToken, clearAuthToken, getChallengeIDFromUrl, processRawChallengeData } from '../utils/geoguessrApi';
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
  
  // Bookmarklet paste area state
  const [pasteData, setPasteData] = useState('');
  const [pasteLoading, setPasteLoading] = useState(false);

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
    } catch (err) {
      onStatusUpdate?.({ type: 'error', content: err.message || 'Failed to fetch challenge data. Please check the URL and try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDiscordStatusUpdate = (status) => {
    onStatusUpdate?.(status);
  };

  const handlePasteImport = async (e) => {
    e.preventDefault();
    
    if (!pasteData.trim()) {
      onStatusUpdate?.({ type: 'error', content: 'Please paste bookmarklet data' });
      return;
    }

    setPasteLoading(true);
    onStatusUpdate?.({ type: '', content: '' });

    try {
      // Parse JSON data
      let rawApiData;
      try {
        rawApiData = JSON.parse(pasteData.trim());
      } catch (parseError) {
        throw new Error('Invalid JSON format. Please make sure you copied the complete data from the bookmarklet.');
      }

      // Validate required fields
      if (!rawApiData.challengeId || !rawApiData.challengeResponse || !rawApiData.highscoresResponse) {
        throw new Error('Invalid bookmarklet data format. Please make sure you copied the complete data.');
      }

      onStatusUpdate?.({ type: 'info', content: 'Processing bookmarklet data...' });

      // Process raw API data using existing function
      const processedChallengeData = processRawChallengeData(
        rawApiData.challengeId,
        rawApiData.challengeResponse,
        rawApiData.highscoresResponse
      );

      // Add timestamp and metadata
      const challengeWithTimestamp = {
        ...processedChallengeData,
        cachedAt: rawApiData.timestamp || Date.now(),
        version: "1.0",
        lastModified: Date.now()
      };

      // Apply custom name if provided
      const finalChallengeData = {
        ...challengeWithTimestamp,
        name: customName.trim() || challengeWithTimestamp.name
      };

      // Save to IndexedDB
      await saveChallenge(finalChallengeData);
      
      if (addAtStart) {
        const currentChallenges = await getChallengesList();
        const updatedOrder = [finalChallengeData.id, ...currentChallenges.filter(id => id !== finalChallengeData.id)];
        await updateChallengeOrder(updatedOrder);
      } else {
        await appendChallengeList(finalChallengeData.id);
      }

      if (customName.trim()) {
        await updateChallengeName(finalChallengeData.id, customName.trim());
      }

      // Update UI
      onAddChallenge(finalChallengeData, addAtStart);
      
      // Clear form
      setPasteData('');
      setCustomName('');
      setShowCustomNameInput(false);
      
      onStatusUpdate?.({ type: 'success', content: `Successfully imported "${finalChallengeData.name}"!` });
    } catch (err) {
      console.error('Error importing bookmarklet data:', err);
      onStatusUpdate?.({ type: 'error', content: err.message || 'Failed to import bookmarklet data. Please try again.' });
    } finally {
      setPasteLoading(false);
    }
  };

  return (
    <FormContainer>
      <FormTitle>Add Challenge</FormTitle>
      
      <CorsNotice />
      {process.env.NODE_ENV === 'development' && (
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
      )}

      <form onSubmit={handlePasteImport}>
        <InputGroup>
          <Textarea
            value={pasteData}
            onChange={(e) => setPasteData(e.target.value)}
            placeholder="Paste the JSON data copied from the bookmarklet here..."
            disabled={pasteLoading}
            size="md"
            radius="md"
            minRows={1}
            maxRows={6}
            autosize
            style={{ flex: 1, minWidth: '300px' }}
          />
          <Button
            type="submit"
            disabled={pasteLoading || !pasteData.trim()}
            color="blue"
            size="md"
            radius="md"
            leftSection={pasteLoading ? <Loader size="xs" color="white" /> : null}
            style={{ minWidth: '160px' }}
          >
            {pasteLoading ? 'Processing...' : 'Import Data'}
          </Button>
        </InputGroup>
      </form>

      {process.env.NODE_ENV === 'production' && (
        <ChallengeImportOptionsContainer>
          <OptionsRow>
            {!hasExistingChallenges && (
              <>
                <Button
                  type="button"
                  onClick={handleLoadDemoData}
                  disabled={loading || pasteLoading}
                  color="teal"
                  size="sm"
                  radius="md"
                >
                  🎮 Load Demo Data
                </Button>
                <Button
                  type="button"
                  onClick={handleImportFromFile}
                  disabled={loading || pasteLoading}
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
              disabled={loading || pasteLoading}
            />
          </OptionsRow>
        </ChallengeImportOptionsContainer>
      )}

      {process.env.NODE_ENV === 'development' && (
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
              color="teal"
              size="md"
              radius="md"
              leftSection={loading ? <Loader size="xs" color="white" /> : null}
              style={{ minWidth: '130px' }}
            >
              {loading ? 'Fetching...' : (isCached ? 'Load Cached' : 'Add Challenge')}
            </Button>
            {isCached && (
              <Button 
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
                color="orange"
                size="md"
                radius="md"
                leftSection={loading ? <Loader size="xs" color="white" /> : null}
                style={{ minWidth: '160px' }}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
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
                    disabled={loading || pasteLoading}
                    color="teal"
                    size="sm"
                    radius="md"
                  >
                    🎮 Load Demo Data
                  </Button>
                  <Button
                    type="button"
                    onClick={handleImportFromFile}
                    disabled={loading || pasteLoading}
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
                disabled={loading || pasteLoading}
              />
              
            </OptionsRow>
          </ChallengeImportOptionsContainer>
        </form>
      )}
    </FormContainer>
  );
}

export default ChallengeImportForm; 