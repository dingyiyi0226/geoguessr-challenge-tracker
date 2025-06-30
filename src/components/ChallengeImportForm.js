import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
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

const Input = styled.input`
  flex: 1;
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  min-width: 300px;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const Button = styled.button`
  padding: 15px 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SmallButton = styled(Button)`
  padding: 8px 16px;
  font-size: 0.9rem;
`;

const ErrorMessage = styled.div`
  background: #fee;
  border: 1px solid #fcc;
  color: #c66;
  padding: 15px;
  border-radius: 10px;
  margin-top: 15px;
`;

const InfoMessage = styled.div`
  background: #e7f3ff;
  border: 1px solid #b3d9ff;
  color: #0066cc;
  padding: 15px;
  border-radius: 10px;
  margin-top: 15px;
`;

const WarningMessage = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
  padding: 15px;
  border-radius: 10px;
  margin-top: 15px;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 10px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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

const ToggleLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 500;
  color: #333;
  user-select: none;
`;

const ToggleSwitch = styled.div`
  position: relative;
  width: 48px;
  height: 24px;
  background: ${props => props.$checked ? '#667eea' : '#ccc'};
  border-radius: 12px;
  transition: background 0.3s ease;
  cursor: pointer;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.$checked ? '26px' : '2px'};
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: left 0.3s ease;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
`;

const OptionButton = styled.button`
  margin-left: 10px;
  padding: 8px 12px;
  background: ${props => props.$active ? '#667eea' : '#ffffff'};
  color: ${props => props.$active ? 'white' : '#667eea'};
  border: 2px solid #667eea;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? '#5a67d8' : '#f7fafc'};
  }
`;

const CustomNameInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: border-color 0.3s ease;
  max-width: 300px;

  &:focus {
    outline: none;
    border-color: #667eea;
  }

  &::placeholder {
    color: #999;
  }
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

const ImportFromFileButton = styled.button`
  padding: 10px 16px;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  }
`;

const LoadDemoButton = styled.button`
  padding: 10px 16px;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

function ChallengeImportForm({ onAddChallenge, hasExistingChallenges, onLoadDemoData }) {
  const [challengeUrl, setChallengeUrl] = useState('');
  const [authToken, setAuthTokenInput] = useState('');
  const [showAuthInput, setShowAuthInput] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(hasAuthToken());
  const [forceRefresh, setForceRefresh] = useState(false);
  const [addAtStart, setAddAtStart] = useState(false);
  const [showCustomNameInput, setShowCustomNameInput] = useState(false);
  const [customName, setCustomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState({ type: '', content: '' });
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
      setHint({ type: '', content: '' });
    }
  };

  const handleAuthClear = () => {
    clearAuthToken();
    setIsAuthenticated(false);
    setHint({ type: '', content: '' });
  };

  const handleImportFromFile = async () => {
    try {
      setLoading(true);
      setHint({ type: '', content: '' });
      
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
        setHint({ type: 'info', content: `Successfully imported ${addedCount} challenges!` });
      } else {
        setHint({ type: 'info', content: 'All challenges from the file already exist.' });
      }
      
      console.log(`Imported ${addedCount} out of ${totalProcessed} challenges using batch insert`);
    } catch (err) {
      console.error('Error importing challenges:', err);
      setHint({ type: 'error', content: err.message || 'Failed to import challenges. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDemoData = async () => {
    try {
      setLoading(true);
      setHint({ type: '', content: '' });
      
      const addedCount = onLoadDemoData();
      
      if (addedCount > 0) {
        setHint({ type: 'info', content: `Successfully loaded ${addedCount} demo challenges!` });
      } else {
        setHint({ type: 'warning', content: 'All demo challenges already exist.' });
      }
      
      console.log(`Loaded ${addedCount} demo challenges`);
    } catch (err) {
      console.error('Error loading demo data:', err);
      setHint({ type: 'error', content: err.message || 'Failed to load demo data. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e, forceRefreshParam = false, addAtStart = false) => {
    e.preventDefault();
    
    if (!challengeUrl.trim()) {
      setHint({ type: 'error', content: 'Please enter a challenge URL' });
      return;
    }

    setLoading(true);
    setHint({ type: '', content: '' });

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
        setHint({ type: 'info', content: `Note: Loaded from cache (${cacheAge} minute${cacheAge !== 1 ? 's' : ''} old). Use "Refresh" for latest data.` });
      }
      
      // Show info if using simulated data
      if (challengeData.isSimulated) {
        setHint({ type: 'warning', content: `Note: ${challengeData.simulationReason} Displaying simulated data for demonstration.` });
      }
    } catch (err) {
      setHint({ type: 'error', content: err.message || 'Failed to fetch challenge data. Please check the URL and try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (status) => {
    setHint(status);
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
          <Input
            type="text"
            value={challengeUrl}
            onChange={(e) => setChallengeUrl(e.target.value)}
            placeholder="Enter Geoguessr challenge URL (e.g., https://www.geoguessr.com/challenge/...)"
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !challengeUrl.trim()}>
            {loading && <LoadingSpinner />}
            {loading ? 'Fetching...' : (isCached ? 'Load Cached' : 'Add Challenge')}
          </Button>
          {isCached && (
            <SmallButton 
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading}
              style={{ background: '#fd7e14' }}
            >
              {loading && <LoadingSpinner />}
              {loading ? 'Refreshing...' : '🔄 Refresh'}
            </SmallButton>
          )}
        </InputGroup>
        
        <ChallengeImportOptionsContainer>
          <OptionsRow>
            <ToggleLabel onClick={() => setAddAtStart(!addAtStart)}>
              <ToggleSwitch $checked={addAtStart} />
              <span>Add at {addAtStart ? 'start' : 'end'}</span>
            </ToggleLabel>
            
            <OptionButton
              type="button"
              $active={showCustomNameInput}
              onClick={() => {
                setShowCustomNameInput(!showCustomNameInput);
                if (showCustomNameInput) {
                  setCustomName('');
                }
              }}
              >
              Challenge Name
            </OptionButton>
            {showCustomNameInput && (
              <CustomNameInput
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Custom challenge name"
              />
            )}
            {!hasExistingChallenges && (
              <>
                <LoadDemoButton
                  type="button"
                  onClick={handleLoadDemoData}
                  disabled={loading}
                >
                  🎮 Load Demo Data
                </LoadDemoButton>
                <ImportFromFileButton
                  type="button"
                  onClick={handleImportFromFile}
                  disabled={loading}
                >
                  📁 Import from file
                </ImportFromFileButton>
              </>
            )}
            <DiscordImporter
              onAddChallenge={onAddChallenge}
              onStatusUpdate={handleStatusUpdate}
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

      {hint.content && (
        hint.type === 'info' ? <InfoMessage>{hint.content}</InfoMessage> :
        hint.type === 'warning' ? <WarningMessage>{hint.content}</WarningMessage> :
        <ErrorMessage>{hint.content}</ErrorMessage>
      )}
    </FormContainer>
  );
}

export default ChallengeImportForm; 