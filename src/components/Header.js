import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 30px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  font-weight: 300;
`;

function Header() {
  return (
    <HeaderContainer>
      <Title>🌍 Geoguessr Challenge Tracker</Title>
      <Subtitle>Track and visualize your Geoguessr challenge results</Subtitle>
    </HeaderContainer>
  );
}

export default Header; 