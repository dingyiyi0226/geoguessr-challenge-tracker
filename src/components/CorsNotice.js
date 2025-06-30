import React from 'react';
import { Alert } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

function CorsNotice() {
  return (
    <Alert
      icon={<IconAlertTriangle size={20} />}
      title="API Access Limitation"
      color="orange"
      variant="light"
      mb="md"
      radius="md"
    >
      Due to CORS restrictions, direct Geoguessr API access only works in local development. 
      For production use, please{' '}
      <span style={{ fontWeight: 700 }}>
        import challenges from exported JSON files
      </span>{' '}
      or try the{' '}
      <span style={{ fontWeight: 700 }}>
        demo data
      </span>{' '}
      below to explore all features.
    </Alert>
  );
}

export default CorsNotice; 