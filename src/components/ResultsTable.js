import React from 'react';
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
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TableCell = styled.td`
  padding: 15px;
  color: #333;
  font-size: 0.95rem;
  position: relative;
`;

const ScoreCell = styled(TableCell)`
  font-weight: 600;
  color: ${props => {
    if (props.score >= 24000) return '#28a745';
    if (props.score >= 20000) return '#ffc107';
    if (props.score >= 15000) return '#fd7e14';
    return '#dc3545';
  }};
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

  &:hover {
    background: #5a6268;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #6c757d;
  font-style: italic;
`;

function ResultsTable({ challenges, onRemoveChallenge, onClearAll }) {
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

  return (
    <TableContainer>
      <TableHeader>
        <TableTitle>Challenge Results ({challenges.length})</TableTitle>
        <ClearButton onClick={onClearAll}>Clear All</ClearButton>
      </TableHeader>
      
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Challenge Name</TableHeaderCell>
            <TableHeaderCell>Player</TableHeaderCell>
            <TableHeaderCell>Total Score</TableHeaderCell>
            <TableHeaderCell>Time</TableHeaderCell>
            <TableHeaderCell>Date</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableRow>
        </TableHead>
        <tbody>
          {challenges.map((challenge, index) => (
            <TableRow key={index}>
              <TableCell>{challenge.name || 'Unknown Challenge'}</TableCell>
              <TableCell>{challenge.player || 'Anonymous'}</TableCell>
              <ScoreCell score={challenge.totalScore}>
                {formatScore(challenge.totalScore)}
              </ScoreCell>
              <TableCell>{formatTime(challenge.totalTime)}</TableCell>
              <TableCell>
                {challenge.date ? new Date(challenge.date).toLocaleDateString() : 'N/A'}
              </TableCell>
              <TableCell>
                <ActionButton onClick={() => onRemoveChallenge(index)}>
                  Remove
                </ActionButton>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );
}

export default ResultsTable; 