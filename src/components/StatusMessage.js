import React from 'react';
import styled from 'styled-components';

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

function StatusMessage({ type, content }) {
  if (!content) return null;

  switch (type) {
    case 'info':
      return <InfoMessage>{content}</InfoMessage>;
    case 'warning':
      return <WarningMessage>{content}</WarningMessage>;
    case 'error':
      return <ErrorMessage>{content}</ErrorMessage>;
    default:
      return null;
  }
}

export default StatusMessage; 