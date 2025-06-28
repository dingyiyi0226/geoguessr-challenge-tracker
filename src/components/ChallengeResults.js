import React, { useState } from 'react';
import styled from 'styled-components';
import { loadAllChallenges } from '../utils/sessionStorage';
import { exportChallenges, importChallenges } from '../utils/fileOperations';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import ChallengeCard from './ChallengeCard';

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

const CollapseButton = styled.button`
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #5a6268;
  }
`;

const ExportButton = styled.button`
  padding: 8px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #218838;
  }
`;

const ImportButton = styled.button`
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #0056b3;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

function ChallengeResults({ challenges, onRemoveChallenge, onClearAll, onUpdateChallengeName, onReorderChallenges, onImportChallenges }) {
  const [expandedChallenges, setExpandedChallenges] = useState(new Set());
  const [expandedPlayers, setExpandedPlayers] = useState(new Set());
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [editName, setEditName] = useState('');
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (challenges.length === 0) {
    return null;
  }

  const formatScore = (score) => {
    return score ? score.toLocaleString() : '0';
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0s';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  const formatDistance = (distance) => {
    if (distance === null || distance === undefined) return 'N/A';
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  };

  const getCountryFlag = (countryCode) => {
    if (!countryCode) return '🌍';
    
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
  };

  const getRankDisplay = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  const toggleChallenge = (challengeIndex) => {
    setExpandedChallenges(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(challengeIndex)) {
        newExpanded.delete(challengeIndex);
      } else {
        newExpanded.add(challengeIndex);
      }
      return newExpanded;
    });
  };

  const togglePlayer = (playerKey) => {
    setExpandedPlayers(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(playerKey)) {
        newExpanded.delete(playerKey);
      } else {
        newExpanded.add(playerKey);
      }
      return newExpanded;
    });
  };

  const getTotalParticipants = () => {
    return challenges.reduce((total, challenge) => {
      return total + (challenge.participants?.length || 0);
    }, 0);
  };

  const collapseAll = () => {
    setExpandedChallenges(new Set());
    setExpandedPlayers(new Set());
  };

  const handleExportChallenges = () => {
    try {
      // Get all challenges from session storage
      const allChallenges = loadAllChallenges();
      
      // Use the utility function to export
      exportChallenges(allChallenges);
      
      console.log(`Exported ${allChallenges.length} challenges`);
    } catch (error) {
      console.error('Error exporting challenges:', error);
      alert(error.message || 'Failed to export challenges. Please try again.');
    }
  };

  const handleImportChallenges = async () => {
    try {
      // Use the utility function to import
      const importedChallenges = await importChallenges();
      
      // Pass the imported challenges to the parent component
      if (onImportChallenges) {
        const addedCount = onImportChallenges(importedChallenges);
        console.log(`Imported ${importedChallenges.length} challenges, ${addedCount} added (duplicates skipped)`);
      }
    } catch (error) {
      console.error('Error importing challenges:', error);
      alert(error.message || 'Failed to import challenges. Please try again.');
    }
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
    if (editingChallenge !== null && editName.trim() !== '') {
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

  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = challenges.findIndex((challenge) => challenge.id === active.id);
      const newIndex = challenges.findIndex((challenge) => challenge.id === over.id);

      onReorderChallenges(oldIndex, newIndex);
    }
  }

  const challengeIds = challenges.map(challenge => challenge.id);

  return (
    <TableContainer>
      <TableHeader>
        <TableTitle>
          Challenge Results ({challenges.length} challenges, {getTotalParticipants()} players)
        </TableTitle>
        <ButtonGroup>
          <ImportButton onClick={handleImportChallenges}>Import</ImportButton>
          <ExportButton onClick={handleExportChallenges}>Export</ExportButton>
          <CollapseButton onClick={collapseAll}>Collapse All</CollapseButton>
          <ClearButton onClick={onClearAll}>Clear All</ClearButton>
        </ButtonGroup>
      </TableHeader>
      
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      >
        <SortableContext items={challengeIds} strategy={verticalListSortingStrategy}>
          {challenges.map((challenge, challengeIndex) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              challengeIndex={challengeIndex}
              expandedChallenges={expandedChallenges}
              expandedPlayers={expandedPlayers}
              editingChallenge={editingChallenge}
              editName={editName}
              setEditName={setEditName}
              toggleChallenge={toggleChallenge}
              togglePlayer={togglePlayer}
              onRemoveChallenge={onRemoveChallenge}
              formatScore={formatScore}
              formatTime={formatTime}
              formatDistance={formatDistance}
              getCountryFlag={getCountryFlag}
              getRankDisplay={getRankDisplay}
              startEditingName={startEditingName}
              saveEditingName={saveEditingName}
              cancelEditingName={cancelEditingName}
              handleNameInputKeyDown={handleNameInputKeyDown}
            />
          ))}
        </SortableContext>
      </DndContext>
    </TableContainer>
  );
}

export default ChallengeResults; 