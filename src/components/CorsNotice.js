import React from 'react';
import styled from 'styled-components';

const CorsNoticeContainer = styled.div`
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border: 1px solid #ffd93d;
  border-radius: 10px;
  padding: 15px 20px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #856404;
  
  strong {
    font-weight: 600;
    color: #664d03;
  }
  
  .highlight {
    color: #dc3545;
    font-weight: 500;
  }
  
  .action {
    color: #0066cc;
    font-weight: 500;
  }
`;

function CorsNotice() {
  return (
    <CorsNoticeContainer>
      ⚠️ <strong>API Access Limitation:</strong> Due to CORS restrictions, direct Geoguessr API access only works in local development. 
      For production use, please <span className="action">📁 import challenges from exported JSON files</span> or 
      try the <span className="action">🎮 demo data</span> below to explore all features.
    </CorsNoticeContainer>
  );
}

export default CorsNotice; 