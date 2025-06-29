import React from 'react';
import styled from 'styled-components';
import {formatScore, formatTime, formatDistance} from '../utils/formatters';

const RoundsContainer = styled.tr`
  td {
    background: #f8f9fa;
    border-top: 2px solid #e9ecef;
  }
`;

const RoundsWrapper = styled.div`
  margin: 20px 15px 20px 15px;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e6ed;
`;

const RoundsHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 24px;
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const RoundsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  margin-bottom: 4px;
`;

const RoundHeaderRow = styled.tr`
  background: #f8f9fa;
`;

const RoundRow = styled.tr`
  transition: all 0.2s ease;
  height: 60px;
  
  &:nth-child(even) {
    background: #fafbfc;
  }
  
  &:nth-child(odd) {
    background: white;
  }

  &:hover {
    background: #e3f2fd;
    transform: translateX(3px);
    box-shadow: 0 2px 4px rgba(102, 126, 234, 0.1);
  }
`;

const RoundHeaderCell = styled.th`
  padding: 16px 15px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #dee2e6;
  background: #f8f9fa;
  height: 50px;
  
  &:first-child {
    border-radius: 0;
  }
  
  &:last-child {
    border-radius: 0;
  }
`;

const RoundCell = styled.td`
  padding: 18px 15px;
  font-size: 0.9rem;
  color: #495057;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
  
  &:first-child {
    font-weight: 600;
    color: #667eea;
    width: 120px;
  }
`;

const RoundScoreCell = styled(RoundCell)`
  font-weight: 700;
  font-size: 1rem;
  color: ${props => {
    if (props.$score >= 4800) return '#28a745';
    if (props.$score >= 4000) return '#ffc107';
    if (props.$score >= 3000) return '#fd7e14';
    return '#dc3545';
  }};
  
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${props => {
      if (props.$score >= 4800) return '#28a745';
      if (props.$score >= 4000) return '#ffc107';
      if (props.$score >= 3000) return '#fd7e14';
      return '#dc3545';
    }};
  }
`;

const RoundDistanceCell = styled(RoundCell)`
  color: ${props => {
    const distance = props.$distance;
    if (distance < 100) return '#28a745'; // Great guess
    if (distance < 1000) return '#ffc107'; // Good guess
    if (distance < 10000) return '#fd7e14'; // Okay guess
    return '#dc3545'; // Poor guess
  }};
  font-weight: 600;
`;

const RoundTimeCell = styled(RoundCell)`
  font-weight: 600;
  font-size: 0.95rem;
  color: #6c757d;
`;

const RoundNumber = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  
  &::before {
    content: '🎯';
    font-size: 1rem;
  }
`;

function PlayerRoundDetails({ participant, isExpanded }) {
  if (!isExpanded || !participant.rounds || participant.rounds.length === 0) {
    return null;
  }

  return (
    <RoundsContainer>
      <td colSpan="6">
        <RoundsWrapper>
          <RoundsHeader>
            🎮 Round Details for {participant.nick || 'Anonymous'}
            <span style={{ 
              background: 'rgba(255,255,255,0.2)', 
              padding: '2px 8px', 
              borderRadius: '12px', 
              fontSize: '0.8rem' 
            }}>
              {participant.rounds.length} rounds
            </span>
          </RoundsHeader>
          <RoundsTable>
            <thead>
              <RoundHeaderRow>
                <RoundHeaderCell>Round</RoundHeaderCell>
                <RoundHeaderCell>Score</RoundHeaderCell>
                <RoundHeaderCell>Time</RoundHeaderCell>
                <RoundHeaderCell>Distance</RoundHeaderCell>
              </RoundHeaderRow>
            </thead>
            <tbody>
              {participant.rounds.map((round, roundIndex) => (
                <RoundRow key={roundIndex}>
                  <RoundCell>
                    <RoundNumber>
                      Round {round.roundNumber || roundIndex + 1}
                    </RoundNumber>
                  </RoundCell>
                  <RoundScoreCell $score={round.score}>
                    {formatScore(round.score)}
                  </RoundScoreCell>
                  <RoundTimeCell>
                    {formatTime(round.time)}
                  </RoundTimeCell>
                  <RoundDistanceCell $distance={round.distance}>
                    {formatDistance(round.distance)}
                  </RoundDistanceCell>
                </RoundRow>
              ))}
            </tbody>
          </RoundsTable>
        </RoundsWrapper>
      </td>
    </RoundsContainer>
  );
}

export default PlayerRoundDetails; 