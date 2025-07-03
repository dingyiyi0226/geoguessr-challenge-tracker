import React, { useRef } from 'react';
import { Button, Group, Tooltip } from '@mantine/core';
import { IconBrandDiscord } from '@tabler/icons-react';
import { importChallengesFromUrls } from '../services';
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
        const fetchResult = await importChallengesFromUrls(
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



  return (
    <Group gap="xs">
      <Tooltip 
        label={
          <>
            Export the Discord message as JSON by DiscordChatExporter.
            <br />
            We fetch all challenge links from each message.
          </>
        }
        multiline
        w={300}
        withArrow
      >
        <Button
          leftSection={<IconBrandDiscord size={16} />}
          variant="filled"
          color="grape"
          size="sm"
          onClick={handleImportFromDiscord}
          disabled={disabled}
        >
          Import from Discord message
        </Button>
      </Tooltip>
      
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