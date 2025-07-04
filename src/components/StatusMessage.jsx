import React from 'react';
import { Alert } from '@mantine/core';
import { IconInfoCircle, IconAlertTriangle, IconExclamationCircle } from '@tabler/icons-react';

function StatusMessage({ type, content, onClose }) {
  if (!content) return null;

  const getAlertProps = () => {
    switch (type) {
      case 'info':
        return {
          color: 'blue',
          icon: <IconInfoCircle size={24} />,
          title: 'Info'
        };
      case 'warning':
        return {
          color: 'yellow',
          icon: <IconAlertTriangle size={24} />,
          title: 'Warning'
        };
      case 'error':
        return {
          color: 'red',
          icon: <IconExclamationCircle size={24} />,
          title: 'Error'
        };
      default:
        return {
          color: 'blue',
          icon: <IconInfoCircle size={24} />
        };
    }
  };

  const alertProps = getAlertProps();

  return (
    <Alert
      {...alertProps}
      mt="md"
      radius="md"
      withCloseButton
      onClose={onClose}
    >
      {content}
    </Alert>
  );
}

export default StatusMessage; 