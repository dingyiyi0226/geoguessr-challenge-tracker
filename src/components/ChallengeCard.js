import React from 'react';
import styled from 'styled-components';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {formatScore, formatTime, getCountryFlag, getRankDisplay} from '../utils/formatters';
import PlayerRoundDetails from './PlayerRoundDetails';
import { Button, ActionIcon, Anchor } from '@mantine/core';

const ChallengeCardContainer = styled.div`
  border-bottom: 1px solid #e9ecef;
  transition: all 0.2s ease;
  
  &:last-child {
    border-bottom: none;
  }
  
  ${props => props.$isDragging && `
    box-shadow: 0 8px 16px rgba(102, 126, 234, 0.15);
    transform: rotate(5deg);
    border-radius: 8px;
    background: #f8f9ff;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  `}
`;

const DragHandle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 40px;
  cursor: ${props => props.$isDragging ? 'grabbing' : 'grab'};
  color: #999;
  font-size: 1.2rem;
  margin-right: 10px;
  transition: color 0.2s ease;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  
  &:hover {
    color: #667eea;
  }
  
  &:active {
    cursor: grabbing;
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
  
  ${props => props.$isDragging && `
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  `}
`;

const ChallengeHeaderContent = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
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
  margin-left: 4px;
`;

const EmptyState = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: #666;
  font-style: italic;
`;

function ChallengeCard({ 
  challenge, 
  challengeIndex, 
  expandedChallenges, 
  expandedPlayers, 
  editingChallenge,
  editName,
  setEditName,
  toggleChallenge,
  togglePlayer,
  onRemoveChallenge,
  startEditingName,
  saveEditingName,
  cancelEditingName,
  handleNameInputKeyDown
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: challenge.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <ChallengeCardContainer
      ref={setNodeRef}
      style={style}
      $isDragging={isDragging}
    >
      <ChallengeHeader 
        onClick={() => toggleChallenge(challengeIndex)}
        $isSimulated={challenge.isSimulated}
        $isPrivate={challenge.isPrivate}
        $isDragging={isDragging}
      >
        <ChallengeHeaderContent>
          <DragHandle 
            {...attributes}
            {...listeners}
            title="Drag to reorder challenges"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            $isDragging={isDragging}
          >
            ⋮⋮
          </DragHandle>
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
                  <ActionIcon 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      saveEditingName(); 
                    }}
                    title="Save"
                    color="teal"
                    size="sm"
                    variant="filled"
                  >
                    ✓
                  </ActionIcon>
                  <ActionIcon 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      cancelEditingName(); 
                    }}
                    title="Cancel"
                    color="gray"
                    size="sm"
                    variant="filled"
                  >
                    ✕
                  </ActionIcon>
                </>
              ) : (
                <>
                  <ChallengeName>
                    {challenge.name || 'Unknown Challenge'}
                  </ChallengeName>
                  <ActionIcon 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      startEditingName(challengeIndex, challenge.name || 'Unknown Challenge'); 
                    }}
                    title="Edit challenge name"
                    color="gray.8"
                    size="sm"
                    variant="light"
                  >
                    ✎
                  </ActionIcon>
                  <ActionIcon 
                    component="a"
                    href={`https://www.geoguessr.com/challenge/${challenge.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    title="View original challenge"
                    color="gray.8"
                    size="sm"
                    variant="light"
                  >
                    🔗
                  </ActionIcon>
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
              <span>🎮 {challenge.mode}</span>
              <span>⏱️ {challenge.timeLimit == 0 ? 'No time limit' : `${challenge.timeLimit}s`}</span>
            </ChallengeDetails>
          </ChallengeInfo>
        </ChallengeHeaderContent>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ActionIcon 
            onClick={(e) => { 
              e.stopPropagation(); 
              toggleChallenge(challengeIndex); 
            }}
            color="blue"
            size="lg"
            variant="filled"
          >
            {expandedChallenges.has(challengeIndex) ? '▼' : '▶'}
          </ActionIcon>
          <Button 
            onClick={(e) => { e.stopPropagation(); onRemoveChallenge(challengeIndex); }}
            color="red"
            size="xs"
            variant="filled"
          >
            Remove
          </Button>
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
    </ChallengeCardContainer>
  );
}

export default ChallengeCard; 