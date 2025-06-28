import React, { useState } from 'react';
import styled from 'styled-components';

const TableContainer = styled.div`
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-top: 30px;
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
`;

const TableTitle = styled.h3`
  color: #333;
  font-size: 1.3rem;
  font-weight: 600;
`;

const ClearButton = styled.button`
  padding: 8px 16px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #c82333;
  }
`;

const ChallengeCard = styled.div`
  border-bottom: 1px solid #e9ecef;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ChallengeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  background: ${props => props.$isSimulated ? '#fff3cd' : props.$isPrivate ? '#f8d7da' : '#ffffff'};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: ${props => 
      props.$isSimulated ? '#ffeaa7' : 
      props.$isPrivate ? '#f5c6cb' : '#f8f9fa'
    };
  }
`;

const ChallengeInfo = styled.div`
  flex: 1;
`;

const ChallengeName = styled.h4`
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 5px;
`;

const ChallengeDetails = styled.div`
  color: #666;
  font-size: 0.9rem;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
`;

const Badge = styled.span`
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 10px;
`;

const SimulatedBadge = styled(Badge)`
  background: #ffc107;
  color: #212529;
`;

const PrivateBadge = styled(Badge)`
  background: #dc3545;
  color: white;
`;

const ExpandIcon = styled.div`
  color: #666;
  font-size: 1.2rem;
  transition: transform 0.2s ease;
  transform: ${props => props.$expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-left: 10px;

  &:hover {
    background: #5a6268;
  }
`;

const PlayersContainer = styled.div`
  max-height: ${props => props.$expanded ? '1000px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background: #f8f9fa;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background: #f8f9fa;
  }

  &:hover {
    background: #e9ecef;
  }
`;

const TableHeaderCell = styled.th`
  padding: 12px 15px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #dee2e6;
`;

const TableCell = styled.td`
  padding: 12px 15px;
  color: #333;
  font-size: 0.9rem;
  border-bottom: 1px solid #f8f9fa;
`;

const RankCell = styled(TableCell)`
  font-weight: 700;
  font-size: 1.1rem;
  color: ${props => {
    if (props.$rank === 1) return '#ffd700';
    if (props.$rank === 2) return '#c0c0c0';
    if (props.$rank === 3) return '#cd7f32';
    return '#666';
  }};
  text-align: center;
  width: 60px;
`;

const PlayerNameCell = styled(TableCell)`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CountryFlag = styled.span`
  font-size: 1.2rem;
`;

const VerifiedIcon = styled.span`
  color: #28a745;
  font-size: 0.8rem;
`;

const ScoreCell = styled(TableCell)`
  font-weight: 600;
  color: ${props => {
    if (props.$score >= 24000) return '#28a745';
    if (props.$score >= 20000) return '#ffc107';
    if (props.$score >= 15000) return '#fd7e14';
    return '#dc3545';
  }};
`;

const PlayerRow = styled(TableRow)`
  cursor: pointer;
`;

const RoundsContainer = styled.tr`
  td {
    padding: 0;
    background: #f8f9fa;
  }
`;

const RoundsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0;
`;

const RoundRow = styled.tr`
  &:nth-child(even) {
    background: #ffffff;
  }
`;

const RoundCell = styled.td`
  padding: 8px 15px;
  font-size: 0.8rem;
  color: #666;
  border-bottom: 1px solid #e9ecef;
`;

const RoundScoreCell = styled(RoundCell)`
  font-weight: 600;
  color: ${props => {
    if (props.$score >= 4800) return '#28a745';
    if (props.$score >= 4000) return '#ffc107';
    if (props.$score >= 3000) return '#fd7e14';
    return '#dc3545';
  }};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #6c757d;
  font-style: italic;
`;

function ResultsTable({ challenges, onRemoveChallenge, onClearAll }) {
  const [expandedChallenges, setExpandedChallenges] = useState(new Set());
  const [expandedPlayers, setExpandedPlayers] = useState(new Set());

  if (challenges.length === 0) {
    return null;
  }

  const formatScore = (score) => {
    return score ? score.toLocaleString() : 'N/A';
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDistance = (distance) => {
    if (distance === undefined || distance === null) return 'N/A';
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  const getCountryFlag = (countryCode) => {
    if (!countryCode) return '🌍';
    try {
      return countryCode.toUpperCase().replace(/./g, char => 
        String.fromCodePoint(127397 + char.charCodeAt())
      );
    } catch {
      return '🌍';
    }
  };

  const getRankDisplay = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const toggleChallenge = (challengeIndex) => {
    const newExpanded = new Set(expandedChallenges);
    if (newExpanded.has(challengeIndex)) {
      newExpanded.delete(challengeIndex);
    } else {
      newExpanded.add(challengeIndex);
    }
    setExpandedChallenges(newExpanded);
  };

  const togglePlayer = (playerKey) => {
    const newExpanded = new Set(expandedPlayers);
    if (newExpanded.has(playerKey)) {
      newExpanded.delete(playerKey);
    } else {
      newExpanded.add(playerKey);
    }
    setExpandedPlayers(newExpanded);
  };

  const getTotalParticipants = () => {
    return challenges.reduce((total, challenge) => {
      return total + (challenge.participants ? challenge.participants.length : 1);
    }, 0);
  };

  return (
    <TableContainer>
      <TableHeader>
        <TableTitle>
          Challenge Results ({challenges.length} challenges, {getTotalParticipants()} players)
        </TableTitle>
        <ClearButton onClick={onClearAll}>Clear All</ClearButton>
      </TableHeader>
      
      {challenges.map((challenge, challengeIndex) => (
        <ChallengeCard key={challengeIndex}>
          <ChallengeHeader 
            onClick={() => toggleChallenge(challengeIndex)}
            $isSimulated={challenge.isSimulated}
            $isPrivate={challenge.isPrivate}
          >
            <ChallengeInfo>
              <ChallengeName>
                {challenge.name || 'Unknown Challenge'}
                {challenge.isSimulated && <SimulatedBadge>DEMO</SimulatedBadge>}
                {challenge.isPrivate && <PrivateBadge>PRIVATE</PrivateBadge>}
              </ChallengeName>
              <ChallengeDetails>
                <span>🏆 {challenge.highscoreCount || challenge.participants?.length || 0} results</span>
                <span>👥 {challenge.totalParticipants || 0} players</span>
                <span>📍 {challenge.mapName || 'Unknown Map'}</span>
                <span>👤 Creator: {challenge.creator || 'Unknown'}</span>
                <span>📅 {challenge.created ? new Date(challenge.created).toLocaleDateString() : 'N/A'}</span>
                {challenge.maxParticipants && challenge.maxParticipants !== 'unlimited' && (
                  <span>📊 Max: {challenge.maxParticipants}</span>
                )}
                {challenge.mode && <span>🎮 {challenge.mode}</span>}
                {challenge.timeLimit && <span>⏱️ {challenge.timeLimit}s</span>}
              </ChallengeDetails>
            </ChallengeInfo>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ActionButton onClick={(e) => { e.stopPropagation(); onRemoveChallenge(challengeIndex); }}>
                Remove
              </ActionButton>
              <ExpandIcon $expanded={expandedChallenges.has(challengeIndex)}>
                ▼
              </ExpandIcon>
            </div>
          </ChallengeHeader>
          
          <PlayersContainer $expanded={expandedChallenges.has(challengeIndex)}>
            {challenge.participants && challenge.participants.length > 0 ? (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Rank</TableHeaderCell>
                    <TableHeaderCell>Player</TableHeaderCell>
                    <TableHeaderCell>Score</TableHeaderCell>
                    <TableHeaderCell>Time</TableHeaderCell>
                    <TableHeaderCell>Played</TableHeaderCell>
                    <TableHeaderCell>Details</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <tbody>
                  {challenge.participants.map((participant, playerIndex) => {
                    const playerKey = `${challengeIndex}-${playerIndex}`;
                    return (
                      <React.Fragment key={playerIndex}>
                        <PlayerRow onClick={() => togglePlayer(playerKey)}>
                          <RankCell $rank={participant.rank || playerIndex + 1}>
                            {getRankDisplay(participant.rank || playerIndex + 1)}
                          </RankCell>
                          <PlayerNameCell>
                            <CountryFlag>{getCountryFlag(participant.countryCode)}</CountryFlag>
                            <span>{participant.nick || 'Anonymous'}</span>
                            {participant.isVerified && <VerifiedIcon>✓</VerifiedIcon>}
                          </PlayerNameCell>
                          <ScoreCell $score={participant.totalScore}>
                            {formatScore(participant.totalScore)}
                          </ScoreCell>
                          <TableCell>{formatTime(participant.totalTime)}</TableCell>
                          <TableCell>
                            {participant.created ? new Date(participant.created).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <span style={{ cursor: 'pointer', color: '#667eea' }}>
                              {expandedPlayers.has(playerKey) ? '▼ Hide Rounds' : '▶ Show Rounds'}
                              {participant.rounds && participant.rounds.length > 0 && (
                                <span style={{ color: '#999', fontSize: '0.8rem', marginLeft: '5px' }}>
                                  ({participant.rounds.length})
                                </span>
                              )}
                            </span>
                          </TableCell>
                        </PlayerRow>
                        {expandedPlayers.has(playerKey) && participant.rounds && participant.rounds.length > 0 && (
                          <RoundsContainer>
                            <td colSpan="6">
                              <RoundsTable>
                                <thead>
                                  <tr>
                                    <TableHeaderCell>Round</TableHeaderCell>
                                    <TableHeaderCell>Score</TableHeaderCell>
                                    <TableHeaderCell>Time</TableHeaderCell>
                                    <TableHeaderCell>Distance</TableHeaderCell>
                                  </tr>
                                </thead>
                                <tbody>
                                  {participant.rounds.map((round, roundIndex) => (
                                    <RoundRow key={roundIndex}>
                                      <RoundCell>Round {round.roundNumber}</RoundCell>
                                      <RoundScoreCell $score={round.score}>
                                        {formatScore(round.score)}
                                      </RoundScoreCell>
                                      <RoundCell>{formatTime(round.time)}</RoundCell>
                                      <RoundCell>{formatDistance(round.distance)}</RoundCell>
                                    </RoundRow>
                                  ))}
                                </tbody>
                              </RoundsTable>
                            </td>
                          </RoundsContainer>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </Table>
            ) : (
              <EmptyState>
                {challenge.isPrivate ? (
                  <>
                    🔒 This challenge is private or has no public results.
                    <br />
                    <small>{challenge.warning}</small>
                  </>
                ) : (
                  'No participants found for this challenge.'
                )}
              </EmptyState>
            )}
          </PlayersContainer>
        </ChallengeCard>
      ))}
    </TableContainer>
  );
}

export default ResultsTable; 