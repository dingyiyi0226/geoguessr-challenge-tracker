import React, { useState } from 'react';
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

const TableTitle = styled.h2`
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

const PaginationButton = styled.button`
  padding: 8px 12px;
  background: ${props => props.$active ? '#667eea' : '#fff'};
  color: ${props => props.$active ? '#fff' : '#333'};
  border: 1px solid ${props => props.$active ? '#667eea' : '#dee2e6'};
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${props => props.$active ? '#5a67d8' : '#e9ecef'};
    border-color: ${props => props.$active ? '#5a67d8' : '#adb5bd'};
  }
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
  onImportChallenges 
}) {
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
    // Clear expanded states when changing pages
    setExpandedChallenges(new Set());
    setExpandedPlayers(new Set());
  };

  const handleNextPage = () => {
    pagination.nextPage();
    // Clear expanded states when changing pages
    setExpandedChallenges(new Set());
    setExpandedPlayers(new Set());
  };

  const handlePrevPage = () => {
    pagination.prevPage();
    // Clear expanded states when changing pages
    setExpandedChallenges(new Set());
    setExpandedPlayers(new Set());
  };

  const collapseAll = () => {
    setExpandedChallenges(new Set());
    setExpandedPlayers(new Set());
  };

  const handleExportChallenges = () => {
    try {
      // Use the full challenges array for export
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
      // Find the challenge in the full challenges array to get the correct index
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
      // Find the indices in the original full challenges array
      const oldIndex = allChallenges.findIndex((challenge) => challenge.id === active.id);
      const newIndex = allChallenges.findIndex((challenge) => challenge.id === over.id);

      onReorderChallenges(oldIndex, newIndex);
      
      // After reordering, we might need to adjust the current page
      // to keep the dragged item visible in the filtered view
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

  // Check if we're showing filtered results
  const isFiltered = allChallenges.length !== challenges.length;

  return (
    <TableContainer>
      <TableHeader>
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
        <SortableContext items={currentChallengeIds} strategy={verticalListSortingStrategy}>
          {pagination.currentPageItems.map((challenge, pageIndex) => {
            const globalIndex = pagination.startIndex + pageIndex; // Calculate global index for proper functionality
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
                  // Find the challenge in the full array and remove it
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
            {isFiltered && (
              <span style={{ color: '#667eea', marginLeft: '8px' }}>
                (filtered from {allChallenges.length} total)
              </span>
            )}
          </PaginationInfo>
          <PaginationControls>
            <PaginationButton onClick={handlePrevPage} disabled={!pagination.hasPrevPage}>
              Previous
            </PaginationButton>
            
            {pagination.getVisiblePageNumbers().map((page, index) => (
              page === '...' ? (
                <PageNumber key={`dots-${index}`}>...</PageNumber>
              ) : (
                <PaginationButton
                  key={page}
                  $active={page === pagination.currentPage}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </PaginationButton>
              )
            ))}
            
            <PaginationButton onClick={handleNextPage} disabled={!pagination.hasNextPage}>
              Next
            </PaginationButton>
          </PaginationControls>
        </PaginationContainer>
      )}
    </TableContainer>
  );
}

export default ChallengeResults; 