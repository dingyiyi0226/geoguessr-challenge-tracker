import React from 'react';
import { Alert, Button, Group, Stack, Text } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { IconBookmark, IconInfoCircle, IconCopy, IconCheck } from '@tabler/icons-react';
import { BOOKMARKLET_CODE } from '../utils/bookmarklet';

function BookmarkletGuide() {
  const clipboard = useClipboard({ timeout: 2000 });

  return (
    <Stack spacing="md" mb="md">
      {process.env.NODE_ENV === 'development' && (
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
        title="Quick Import with Bookmarklet"
        color="blue"
        variant="light"
        radius="md"
      >
      <Stack spacing="sm">
        <Text size="sm">
          <strong>Import challenges instantly</strong> from any GeoGuessr page with our one-click bookmarklet:
        </Text>
        
        <Text size="sm"><strong>1. Create a bookmarklet:</strong> Right-click bookmarks bar → "Add bookmark" → Name: "Import GeoGuessr Challenge" → URL: [paste copied code]</Text>
        
        <Button
          size="sm"
          variant={clipboard.copied ? "filled" : "outline"}
          color={clipboard.copied ? "teal" : "blue"}
          leftSection={clipboard.copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
          onClick={() => clipboard.copy(BOOKMARKLET_CODE)}
          style={{ marginLeft: '20px', alignSelf: 'flex-start' }}
        >
          {clipboard.copied ? 'Copied!' : 'Copy Bookmarklet'}
        </Button>
        
        <Text size="sm">
          <strong>2. Usage:</strong> Go to any GeoGuessr challenge page → Click bookmarklet to copy the data → Return here and paste
        </Text>
        
      </Stack>
      </Alert>
    </Stack>
  );
}

export default BookmarkletGuide; 