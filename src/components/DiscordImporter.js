import React, { useRef } from 'react';
import styled from 'styled-components';
import { FaQuestionCircle } from 'react-icons/fa';
import { fetchChallengesData } from '../utils/geoguessrApi';
import { parseDiscordMessages } from '../utils/discord';

const ImportFromDiscordButton = styled.button`
  padding: 10px 16px;
  background: linear-gradient(135deg, #8e44ad 0%, #6c3483 100%);
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
    box-shadow: 0 4px 12px rgba(142, 68, 173, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const QuestionMarkButton = styled.button`
  background: none;
  border: none;
  padding: 0 4px;
  margin-left: -6px;
  color: #8e44ad;
  cursor: pointer;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  transition: color 0.2s;
  
  &:hover {
    color: #5e3370;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

function DiscordImporter({ onAddChallenge, onStatusUpdate, disabled = false }) {
  const fileInputRef = useRef(null);

  const handleImportFromDiscord = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleDiscordFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const result = parseDiscordMessages(json);
        console.log('Discord message import:', result);

        // Prepare data for parallel fetching
        const challengeEntries = Object.entries(result);
        const challengeUrls = challengeEntries.map(([date, link]) => link);
        const challengeNames = challengeEntries.map(([date, link]) => date);
        
        // Set initial progress
        onStatusUpdate?.({ 
          type: 'info', 
          content: `Starting import of ${challengeUrls.length} challenges...`
        });

        // Parallel fetch with progress tracking and names
        const fetchResult = await fetchChallengesData(
          challengeUrls,
          (progress) => {
            onStatusUpdate?.({ 
              type: 'info', 
              content: `Imported: ${progress.addedCount}, ` +
                `Failed: ${progress.failedCount}, ` +
                `Remaining: ${progress.remainingCount}`
            });
          },
          false, // forceRefresh
          challengeNames // names array
        );

        // Process successful results - names are already set!
        fetchResult.results.forEach((challengeData) => {
          onAddChallenge?.(challengeData, false);
        });

        // Final status message
        onStatusUpdate?.({
          type: 'info',
          content: `Successfully imported ${fetchResult.addedCount} challenge${fetchResult.addedCount !== 1 ? 's' : ''} from Discord message!${
            fetchResult.failedCount > 0 
              ? ` ${fetchResult.failedCount} challenge${fetchResult.failedCount !== 1 ? 's' : ''} failed. You cannot import challenges you have not played.`
              : ''
          }`
        });
      } catch (err) {
        console.error('Error parsing Discord message JSON:', err);
        onStatusUpdate?.({ 
          type: 'error', 
          content: 'Failed to parse Discord message JSON.' 
        });
      }
    };
    
    reader.readAsText(file);
  };

  const handleShowHint = () => {
    onStatusUpdate?.({ 
      type: 'info', 
      content: 'Export the Discord message as JSON by DiscordChatExporter. We fetch the first challenge link from each message.' 
    });
  };

  return (
    <>
      <ImportFromDiscordButton
        type="button"
        onClick={handleImportFromDiscord}
        disabled={disabled}
      >
        💬 Import from Discord message
      </ImportFromDiscordButton>
      
      <QuestionMarkButton
        type="button"
        aria-label="Show hint for Discord import"
        onClick={handleShowHint}
      >
        <FaQuestionCircle />
      </QuestionMarkButton>
      
      <HiddenFileInput
        type="file"
        accept="application/json"
        ref={fileInputRef}
        onChange={handleDiscordFileChange}
      />
    </>
  );
}

export default DiscordImporter; 