import React, { useRef } from 'react';
import { Button, ActionIcon, Group } from '@mantine/core';
import { IconMessage, IconQuestionMark } from '@tabler/icons-react';
import { fetchChallengesData } from '../utils/geoguessrApi';
import { parseDiscordMessages } from '../utils/discord';

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

        const challengeUrls = [];
        const challengeNames = [];
        
        Object.entries(result).forEach(([date, links]) => {
          if (Array.isArray(links)) {
            links.forEach((link, index) => {
              challengeUrls.push(link);
              // If multiple challenges on same date, add index suffix
              const challengeName = links.length > 1 ? `${date} (#${index + 1})` : date;
              challengeNames.push(challengeName);
            });
          }
        });
        
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
      content: 'Export the Discord message as JSON by DiscordChatExporter. We fetch all challenge links from each message.' 
    });
  };

  return (
    <Group gap="xs">
      <Button
        leftSection={<IconMessage size={16} />}
        variant="filled"
        color="grape"
        size="sm"
        onClick={handleImportFromDiscord}
        disabled={disabled}
      >
        Import from Discord message
      </Button>
      
      <ActionIcon
        variant="light"
        color="grape"
        size="sm"
        onClick={handleShowHint}
        aria-label="Show hint for Discord import"
      >
        <IconQuestionMark size={20} />
      </ActionIcon>
      
      <input
        type="file"
        accept="application/json"
        ref={fileInputRef}
        onChange={handleDiscordFileChange}
        style={{ display: 'none' }}
      />
    </Group>
  );
}

export default DiscordImporter; 