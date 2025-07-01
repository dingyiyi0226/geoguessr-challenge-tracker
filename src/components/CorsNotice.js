import React from 'react';
import { Alert, Code, Group, Stack, Text } from '@mantine/core';
import { IconBookmark, IconInfoCircle } from '@tabler/icons-react';
import { BOOKMARKLET_CODE } from '../utils/bookmarklet';

function CorsNotice() {
  // Check if we're in development (localhost)
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  // Get current origin for the bookmarklet
  const currentOrigin = window.location.origin;

  return (
    <Stack spacing="md" mb="xl">
      {isDevelopment && (
        <Alert
          icon={<IconInfoCircle size={20} />}
          title="Development Mode"
          color="green"
          variant="light"
          radius="md"
        >
          You're running in development mode. Direct API access to GeoGuessr is available for testing.
        </Alert>
      )}
      
      <Alert
        icon={<IconBookmark size={20} />}
        title="🔖 Quick Import with Bookmarklet"
        color="blue"
        variant="light"
        radius="md"
      >
      <Stack spacing="sm">
        <Text size="sm">
          <strong>Import challenges instantly</strong> from any GeoGuessr page with our one-click bookmarklet:
        </Text>
        
        <Group spacing="xs">
          <Text size="sm" weight={500}>1. Add this bookmarklet:</Text>
          <Text size="xs" color="dimmed">
            (Click to copy)
          </Text>
        </Group>
        
        <Code 
          block 
          style={{ 
            fontSize: '10px', 
            wordBreak: 'break-all',
            maxHeight: '60px',
            overflowY: 'auto',
            cursor: 'pointer'
          }}
          onClick={() => {
            // Replace just the origin part (protocol + domain + port) 
            const bookmarkletCode = BOOKMARKLET_CODE.replace(
              'https://dingyiyi0226.github.io',
              currentOrigin
            );
            navigator.clipboard.writeText(bookmarkletCode);
          }}
          title="Click to copy bookmarklet"
        >
          Import GeoGuessr Challenge
        </Code>
        
        <Text size="sm">
          <strong>2. Usage:</strong> Go to any GeoGuessr challenge page → Click bookmarklet → Return here and paste
        </Text>
        
        <Text size="xs" color="dimmed">
          💡 Add to bookmarks: Right-click bookmarks bar → "Add bookmark" → Name: "Import GeoGuessr Challenge" → URL: [paste copied code]
        </Text>
      </Stack>
      </Alert>
    </Stack>
  );
}

export default CorsNotice; 