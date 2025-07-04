import React from 'react';
import { Box, Title, Text } from '@mantine/core';

function Header() {
  return (
    <Box
      component="header"
      bg="gray.1"
      c="dark.7"
      p="xl"
      ta="center"
    >
      <Title 
        order={1}
        size="2.5rem"
        fw={700}
        mb="sm"
        c="dark.8"
      >
        🌍 Geoguessr Challenge Tracker
      </Title>
      <Text 
        size="lg"
        fw={300}
        c="dark.6"
      >
        Track and visualize your Geoguessr challenge results
      </Text>
    </Box>
  );
}

export default Header; 