import React from 'react';
import styled from 'styled-components';

const AuthSectionContainer = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
`;

const AuthTitle = styled.h3`
  color: #333;
  margin-bottom: 15px;
  font-size: 1.2rem;
  font-weight: 600;
`;

const AuthStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
`;

const AuthIndicator = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$authenticated ? '#28a745' : '#dc3545'};
`;

const AuthText = styled.span`
  color: ${props => props.$authenticated ? '#28a745' : '#dc3545'};
  font-weight: 500;
`;

const SmallButton = styled.button`
  padding: 8px 16px;
  font-size: 0.9rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  margin-right: 8px;
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const InputGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const Input = styled.input`
  flex: 1;
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1rem;
  min-width: 300px;
`;

const InstructionsText = styled.div`
  font-size: 0.9rem;
  color: #666;
  line-height: 1.5;
  margin-top: 10px;
  strong { color: #333; }
  ol { margin: 10px 0; padding-left: 20px; }
  li { margin: 5px 0; }
`;

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
    <AuthSectionContainer>
      <AuthTitle>🔐 API Authentication</AuthTitle>
      <AuthStatus>
        <AuthIndicator $authenticated={isAuthenticated} />
        <AuthText $authenticated={isAuthenticated}>
          {isAuthenticated ? 'Connected to Geoguessr API' : 'Not authenticated - try importing from file'}
        </AuthText>
      </AuthStatus>
      {!isAuthenticated && !showAuthInput && (
        <>
          <SmallButton onClick={() => setShowAuthInput(true)}>
            Setup API Access
          </SmallButton>
          <InstructionsText>
            <strong>To use real Geoguessr data:</strong>
            <ol>
              <li>Open Geoguessr in your browser and log in</li>
              <li>Open browser Developer Tools (F12)</li>
              <li>Go to Application/Storage → Cookies → geoguessr.com</li>
              <li>Find the <strong>_ncfa</strong> cookie and copy its value</li>
              <li>Paste it above to connect to the real API</li>
            </ol>
            Without authentication, the app cannot fetch real data. But you can import challenges from an existing file.
          </InstructionsText>
        </>
      )}
      {showAuthInput && (
        <form onSubmit={handleAuthSubmit}>
          <InputGroup>
            <Input
              type="password"
              value={authToken}
              onChange={(e) => setAuthTokenInput(e.target.value)}
              placeholder="Paste your _ncfa cookie value here"
              disabled={loading}
            />
            <SmallButton type="submit" disabled={loading}>Connect</SmallButton>
            <SmallButton 
              type="button" 
              onClick={() => setShowAuthInput(false)}
              style={{ background: '#6c757d' }}
              disabled={loading}
            >
              Cancel
            </SmallButton>
          </InputGroup>
        </form>
      )}
      {isAuthenticated && (
        <SmallButton 
          onClick={handleAuthClear}
          style={{ background: '#dc3545' }}
          disabled={loading}
        >
          Disconnect
        </SmallButton>
      )}
    </AuthSectionContainer>
  );
}

export default AuthSection; 