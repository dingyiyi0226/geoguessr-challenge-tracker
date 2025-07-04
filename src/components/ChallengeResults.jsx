import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import ChallengeCard from './ChallengeCard';
import ChallengeFilterPanel from './ChallengeFilterPanel';
import { Button, Group } from '@mantine/core';

const TableContainer = styled.div`
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-top: 30px;
`;

const TableHeader = styled.div`
  padding: 20px 25px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 15px;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const TableTitle = styled.h2`
  color: #333;
  font-size: 1.3rem;
  font-weight: 600;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 25px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
`;

const PaginationInfo = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PageNumber = styled.span`
  color: #666;
  font-size: 0.9rem;
  margin: 0 5px;
`;

function ChallengeResults({ 
  allChallenges,
  challenges,
  pagination,
  onRemoveChallenge, 
  onClearAll, 
  onUpdateChallengeName, 
  onReorderChallenges, 
  onImportChallenges,
  onSortChallenges,
  onFilterChange,
  onStatusUpdate
}) {
  const [expandedChallenges, setExpandedChallenges] = useState(new Set());
  const [expandedPlayers, setExpandedPlayers] = useState(new Set());
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [editName, setEditName] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states - now using arrays instead of Sets
  const [selectedMapNames, setSelectedMapNames] = useState([]);
  const [selectedGameModes, setSelectedGameModes] = useState([]);
  
  // Apply filters whenever filter values change
  useEffect(() => {
    const filtered = allChallenges.filter(challenge => {
      const mapNameMatch = selectedMapNames.length === 0 || selectedMapNames.includes(challenge.mapName);
      const gameModeMatch = selectedGameModes.length === 0 || selectedGameModes.includes(challenge.mode);
      return mapNameMatch && gameModeMatch;
    });

    if (onFilterChange) {
      onFilterChange(filtered);
    }
  }, [allChallenges, selectedMapNames, selectedGameModes, onFilterChange]);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (allChallenges.length === 0) {
    return null;
  }

  const hasActiveFilters = selectedMapNames.length > 0 || selectedGameModes.length > 0;

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
    return new Set(
      allChallenges
        .flatMap(challenge => challenge.participants || [])
        .map(participant => participant.userId)
        .filter(Boolean)
    ).size;
  };

  const handlePageChange = (page) => {
    pagination.goToPage(page);
    setExpandedChallenges(new Set());
    setExpandedPlayers(new Set());
  };

  const handleNextPage = () => {
    pagination.nextPage();
    setExpandedChallenges(new Set());
    setExpandedPlayers(new Set());
  };

  const handlePrevPage = () => {
    pagination.prevPage();
    setExpandedChallenges(new Set());
    setExpandedPlayers(new Set());
  };

  const collapseAll = () => {
    setExpandedChallenges(new Set());
    setExpandedPlayers(new Set());
  };

  const handleExportChallenges = () => {
    try {
      exportChallenges(allChallenges);
      console.log(`Exported ${allChallenges.length} challenges`);
    } catch (error) {
      console.error('Error exporting challenges:', error);
      alert(error.message || 'Failed to export challenges. Please try again.');
    }
  };

  const handleImportChallenges = async () => {
    try {
      const importedChallenges = await importChallenges();
      
      if (importedChallenges === null) {
        return;
      }
      
      if (onImportChallenges) {
        const addedCount = await onImportChallenges(importedChallenges);
        console.log(`Imported ${importedChallenges.length} challenges, ${addedCount} added (duplicates skipped)`);
        
        // Show user-friendly message
        if (addedCount > 0) {
          onStatusUpdate?.({ type: 'info', content: `Successfully imported ${addedCount} challenges!` });
        } else {
          onStatusUpdate?.({ type: 'info', content: 'All challenges from the file already exist.' });
        }
      }
    } catch (error) {
      console.error('Error importing challenges:', error);
      onStatusUpdate?.({ type: 'error', content: error.message || 'Failed to import challenges. Please try again.' });
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
      const challenge = challenges[editingChallenge];
      const fullArrayIndex = allChallenges.findIndex(c => c.id === challenge.id);
      onUpdateChallengeName(fullArrayIndex, editName.trim());
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
      const oldIndex = allChallenges.findIndex((challenge) => challenge.id === active.id);
      const newIndex = allChallenges.findIndex((challenge) => challenge.id === over.id);

      onReorderChallenges(oldIndex, newIndex);
      
      const newFilteredIndex = challenges.findIndex((challenge) => challenge.id === active.id);
      if (newFilteredIndex >= 0) {
        const newPage = pagination.getPageFromIndex(newFilteredIndex);
        if (newPage !== pagination.currentPage) {
          pagination.goToPage(newPage);
        }
      }
    }
  }

  const currentChallengeIds = pagination.currentPageItems.map(challenge => challenge.id);
  const isFiltered = allChallenges.length !== challenges.length;

  return (
    <TableContainer>
      <TableHeader>
        <TitleRow>
          <TableTitle>
            Challenge Results ({allChallenges.length} challenges, {getTotalParticipants()} players)
            {isFiltered && (
              <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: '#667eea', marginLeft: '10px' }}>
                - Filtered: {challenges.length} shown
              </span>
            )}
            {pagination.isPagedView && (
              <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: '#666', marginLeft: '10px' }}>
                - Page {pagination.currentPage} of {pagination.totalPages}
              </span>
            )}
          </TableTitle>
        </TitleRow>
        <ButtonRow>
          <Group gap="md">
            <Button 
              onClick={handleImportChallenges}
              color="teal"
              size="sm"
              radius="md"
            >
              Import
            </Button>
            <Button 
              onClick={handleExportChallenges}
              color="teal"
              size="sm"
              radius="md"
            >
              Export
            </Button>
            <Button 
              onClick={() => setShowFilters(!showFilters)}
              color={showFilters || hasActiveFilters ? "violet" : "gray"}
              size="sm"
              radius="md"
            >
              🔍 Filter {hasActiveFilters && `(${selectedMapNames.length + selectedGameModes.length})`}
            </Button>
            <Button 
              onClick={onSortChallenges}
              color="gray"
              size="sm"
              radius="md"
            >
              ↑↓ Sort A-Z
            </Button>
            <Button 
              onClick={collapseAll}
              color="gray"
              size="sm"
              radius="md"
            >
              Collapse All
            </Button>
            <Button 
              onClick={onClearAll}
              color="red"
              size="sm"
              radius="md"
            >
              Clear All
            </Button>
          </Group>
        </ButtonRow>
      </TableHeader>

      <ChallengeFilterPanel
        challenges={allChallenges}
        visible={showFilters}
        selectedMapNames={selectedMapNames}
        selectedGameModes={selectedGameModes}
        onMapNamesChange={setSelectedMapNames}
        onGameModesChange={setSelectedGameModes}
      />
      
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      >
        <SortableContext items={currentChallengeIds} strategy={verticalListSortingStrategy}>
          {pagination.currentPageItems.map((challenge, pageIndex) => {
            const globalIndex = pagination.startIndex + pageIndex;
            return (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                challengeIndex={globalIndex}
                expandedChallenges={expandedChallenges}
                expandedPlayers={expandedPlayers}
                editingChallenge={editingChallenge}
                editName={editName}
                setEditName={setEditName}
                toggleChallenge={toggleChallenge}
                togglePlayer={togglePlayer}
                onRemoveChallenge={(index) => {
                  const challenge = challenges[index];
                  const fullArrayIndex = allChallenges.findIndex(c => c.id === challenge.id);
                  onRemoveChallenge(fullArrayIndex);
                }}
                startEditingName={startEditingName}
                saveEditingName={saveEditingName}
                cancelEditingName={cancelEditingName}
                handleNameInputKeyDown={handleNameInputKeyDown}
              />
            );
          })}
        </SortableContext>
      </DndContext>
      
      {pagination.isPagedView && (
        <PaginationContainer>
          <PaginationInfo>
            Showing {pagination.startIndex + 1}-{Math.min(pagination.endIndex, challenges.length)} of {challenges.length} challenges
            {hasActiveFilters && (
              <span style={{ color: '#667eea', marginLeft: '8px' }}>
                (filtered from {allChallenges.length} total)
              </span>
            )}
          </PaginationInfo>
          <PaginationControls>
            <Button 
              onClick={handlePrevPage} 
              disabled={!pagination.hasPrevPage}
              variant="outline"
              size="sm"
              color="gray"
            >
              Previous
            </Button>
            
            {pagination.getVisiblePageNumbers().map((page, index) => (
              page === '...' ? (
                <PageNumber key={`dots-${index}`}>...</PageNumber>
              ) : (
                <Button
                  key={page}
                  variant={page === pagination.currentPage ? "filled" : "outline"}
                  color={page === pagination.currentPage ? "blue" : "gray"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              )
            ))}
            
            <Button 
              onClick={handleNextPage} 
              disabled={!pagination.hasNextPage}
              variant="outline"
              size="sm"
              color="gray"
            >
              Next
            </Button>
          </PaginationControls>
        </PaginationContainer>
      )}
    </TableContainer>
  );
}

export default ChallengeResults; 