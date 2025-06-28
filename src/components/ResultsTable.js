import React, { useState } from 'react';
import styled from 'styled-components';
import PlayerRoundDetails from './PlayerRoundDetails';

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

const ChallengeNameContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
`;

const ChallengeName = styled.h4`
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
`;

const ChallengeNameInput = styled.input`
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
  border: 2px solid #667eea;
  border-radius: 4px;
  padding: 4px 8px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #5a67d8;
  }
`;

const EditButton = styled.button`
  background:rgb(221, 221, 221);
  border: none;
  border-radius: 3px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.7rem;
  transition: all 0.2s ease;
  
  &:hover {
    background:rgb(188, 188, 188);
  }
`;

const SaveButton = styled(EditButton)`
  background:rgb(177, 215, 255);

  &:hover {
    background:rgb(105, 177, 253);
  }
`;

const CancelButton = styled(EditButton)`
  background:rgb(221, 221, 221);
  
  &:hover {
    background:rgb(188, 188, 188);
  }
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

const ExpandButton = styled.button`
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: bold;
  transition: all 0.2s ease;
  margin-left: 10px;
  
  &:hover {
    background: #5a67d8;
  }

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



const RoundsToggleButton = styled.span`
  cursor: pointer;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
  font-size: 0.85rem;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f0f4ff;
    transform: translateX(2px);
  }
`;

const RoundCountBadge = styled.span`
  color: #999;
  font-size: 0.75rem;
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 8px;
  font-weight: 600;
  margin-left: auto;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #6c757d;
  font-style: italic;
`;

function ResultsTable({ challenges, onRemoveChallenge, onClearAll, onUpdateChallengeName }) {
  const [expandedChallenges, setExpandedChallenges] = useState(new Set());
  const [expandedPlayers, setExpandedPlayers] = useState(new Set());
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [editName, setEditName] = useState('');

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
      return `${Math.round(distance)} m`;
    }
    return `${(distance / 1000).toFixed(1)} km`;
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

  const startEditingName = (challengeIndex, currentName) => {
    setEditingChallenge(challengeIndex);
    setEditName(currentName);
  };

  const cancelEditingName = () => {
    setEditingChallenge(null);
    setEditName('');
  };

  const saveEditingName = () => {
    if (editName.trim() && onUpdateChallengeName) {
      onUpdateChallengeName(editingChallenge, editName.trim());
    }
    setEditingChallenge(null);
    setEditName('');
  };

  const handleNameInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveEditingName();
    } else if (e.key === 'Escape') {
      cancelEditingName();
    }
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
              <ChallengeNameContainer>
                {editingChallenge === challengeIndex ? (
                  <>
                    <ChallengeNameInput
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={handleNameInputKeyDown}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                    <SaveButton 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        saveEditingName(); 
                      }}
                      title="Save"
                    >
                      ✓
                    </SaveButton>
                    <CancelButton 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        cancelEditingName(); 
                      }}
                      title="Cancel"
                    >
                      ✕
                    </CancelButton>
                  </>
                ) : (
                  <>
                    <ChallengeName>
                      {challenge.name || 'Unknown Challenge'}
                    </ChallengeName>
                    <EditButton 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        startEditingName(challengeIndex, challenge.name || 'Unknown Challenge'); 
                      }}
                      title="Edit challenge name"
                    >
                      ✎
                    </EditButton>
                  </>
                )}
                {challenge.isSimulated && <SimulatedBadge>DEMO</SimulatedBadge>}
                {challenge.isPrivate && <PrivateBadge>PRIVATE</PrivateBadge>}
              </ChallengeNameContainer>
              <ChallengeDetails>
                <span>🏆 {challenge.highscoreCount || challenge.participants?.length || 0} results</span>
                <span>👥 {challenge.totalParticipants || 0} players</span>
                <span>📍 {challenge.mapName || 'Unknown Map'}</span>
                <span>👤 Creator: {challenge.creator || 'Unknown'}</span>
                {challenge.mode && <span>🎮 {challenge.mode}</span>}
                {challenge.timeLimit && <span>⏱️ {challenge.timeLimit}s</span>}
              </ChallengeDetails>
            </ChallengeInfo>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ExpandButton 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  toggleChallenge(challengeIndex); 
                }}
              >
                {expandedChallenges.has(challengeIndex) ? '▼' : '▶'}
              </ExpandButton>
              <ActionButton onClick={(e) => { e.stopPropagation(); onRemoveChallenge(challengeIndex); }}>
                Remove
              </ActionButton>
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
                    <TableHeaderCell>Played at</TableHeaderCell>
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
                            {participant.playedAt ? new Date(participant.playedAt).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <RoundsToggleButton>
                              {expandedPlayers.has(playerKey) ? (
                                <>
                                  <span>▼</span>
                                  <span>Hide Rounds</span>
                                </>
                              ) : (
                                <>
                                  <span>▶</span>
                                  <span>Show Rounds</span>
                                </>
                              )}
                              {participant.rounds && participant.rounds.length > 0 && (
                                <RoundCountBadge>
                                  {participant.rounds.length}
                                </RoundCountBadge>
                              )}
                            </RoundsToggleButton>
                          </TableCell>
                        </PlayerRow>
                        <PlayerRoundDetails
                          participant={participant}
                          isExpanded={expandedPlayers.has(playerKey)}
                          formatScore={formatScore}
                          formatTime={formatTime}
                          formatDistance={formatDistance}
                        />
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