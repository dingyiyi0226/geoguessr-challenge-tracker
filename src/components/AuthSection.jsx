import React from 'react';
import { Paper, Title, Group, Text, Button, TextInput, List, Box } from '@mantine/core';
import { IconLock, IconCheck, IconX } from '@tabler/icons-react';

function AuthSection({
  isAuthenticated,
  showAuthInput,
  authToken,
  setAuthTokenInput,
  handleAuthSubmit,
  handleAuthClear,
  setShowAuthInput,
  loading
}) {
  return (
    <Paper
      p="md"
      mb="md"
      radius="md"
      withBorder
      bg="gray.1"
    >
      <Title order={3} size="h4" mb="md" c="dark.7">
        <Group gap="xs">
          <IconLock size={20} />
          API Authentication
        </Group>
      </Title>
      
      <Group gap="xs" mb="md">
        {isAuthenticated ? (
          <IconCheck size={16} color="green" />
        ) : (
          <IconX size={16} color="red" />
        )}
        <Text
          size="sm"
          fw={600}
          c={isAuthenticated ? "green.6" : "red.6"}
        >
          {isAuthenticated ? 'Connected to Geoguessr API' : 'Not authenticated - try importing from file'}
        </Text>
      </Group>

      {!isAuthenticated && !showAuthInput && (
        <>
          <Button
            size="sm"
            mb="md"
            onClick={() => setShowAuthInput(true)}
          >
            Setup API Access
          </Button>
          
          <Box c="dark.6" fz="sm" lh={1.5}>
            <Text fw={600} mb="xs">To use real Geoguessr data:</Text>
            <List size="sm" spacing="xs">
              <List.Item>Open Geoguessr in your browser and log in</List.Item>
              <List.Item>Open browser Developer Tools (F12)</List.Item>
              <List.Item>Go to Application/Storage → Cookies → geoguessr.com</List.Item>
              <List.Item>Find the <Text component="span" fw={600}>_ncfa</Text> cookie and copy its value</List.Item>
              <List.Item>Paste it above to connect to the real API</List.Item>
            </List>
            <Text mt="xs">
              Without authentication, the app cannot fetch real data. But you can import challenges from an existing file.
            </Text>
          </Box>
        </>
      )}

      {showAuthInput && (
        <form onSubmit={handleAuthSubmit}>
          <Group gap="md" mb="md" align="flex-end">
            <TextInput
              type="password"
              value={authToken}
              onChange={(e) => setAuthTokenInput(e.target.value)}
              placeholder="Paste your _ncfa cookie value here"
              disabled={loading}
              style={{ flex: 1, minWidth: 300 }}
            />
            <Button type="submit" disabled={loading} size="sm">
              Connect
            </Button>
            <Button
              type="button"
              variant="filled"
              color="gray.5"
              onClick={() => setShowAuthInput(false)}
              disabled={loading}
              size="sm"
            >
              Cancel
            </Button>
          </Group>
        </form>
      )}

      {isAuthenticated && (
        <Button
          color="red"
          variant="light"
          onClick={handleAuthClear}
          disabled={loading}
          size="sm"
        >
          Disconnect
        </Button>
      )}
    </Paper>
  );
}

export default AuthSection; 