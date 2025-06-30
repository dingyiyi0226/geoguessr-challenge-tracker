import React from 'react';
import styled from 'styled-components';
import { Button, ActionIcon, MultiSelect } from '@mantine/core';
import _ from 'lodash';

const FilterContainer = styled.div`
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin: 15px 25px 0;
  padding: 20px 25px;
  display: ${props => props.$visible ? 'block' : 'none'};
`;

const FilterTitle = styled.h3`
  color: #333;
  margin-bottom: 15px;
  font-size: 1.1rem;
  font-weight: 600;
`;

const FilterRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const FilterSection = styled.div`
  margin-bottom: 15px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const FilterLabel = styled.div`
  font-weight: 500;
  color: #555;
  margin-bottom: 8px;
  font-size: 0.95rem;
`;



const ResultCount = styled.div`
  color: #666;
  font-size: 0.9rem;
  font-style: italic;
`;

function ChallengeFilterPanel({ 
  challenges, 
  visible, 
  selectedMapNames, 
  selectedGameModes, 
  onMapNamesChange, 
  onGameModesChange,
  onClearFilters 
}) {
  const uniqueMapNames = React.useMemo(() => {
    return _(challenges)
      .map('mapName')
      .compact()
      .uniq()
      .sort()
      .value();
  }, [challenges]);

  const uniqueGameModes = React.useMemo(() => {
    return _(challenges)
      .map('mode')
      .compact()
      .uniq()
      .sort()
      .value();
  }, [challenges]);

  const clearAllFilters = () => {
    onMapNamesChange([]);
    onGameModesChange([]);
    if (onClearFilters) {
      onClearFilters();
    }
  };

  const hasActiveFilters = selectedMapNames.length > 0 || selectedGameModes.length > 0;
  const filteredCount = challenges.filter(challenge => {
    const mapNameMatch = selectedMapNames.length === 0 || selectedMapNames.includes(challenge.mapName);
    const gameModeMatch = selectedGameModes.length === 0 || selectedGameModes.includes(challenge.mode);
    return mapNameMatch && gameModeMatch;
  }).length;

  return (
    <FilterContainer $visible={visible}>
      <FilterTitle>Filter Challenges</FilterTitle>
      
      <FilterRow>
        <FilterSection>
          <FilterLabel>📍 Map Names</FilterLabel>
          <MultiSelect
            value={selectedMapNames}
            onChange={onMapNamesChange}
            data={uniqueMapNames}
            placeholder={`Select maps... (${uniqueMapNames.length} available)`}
            searchable
            clearable
            size="sm"
            radius="md"
            comboboxProps={{ withinPortal: false }}
          />
        </FilterSection>

        <FilterSection>
          <FilterLabel>🎮 Game Modes</FilterLabel>
          <MultiSelect
            value={selectedGameModes}
            onChange={onGameModesChange}
            data={uniqueGameModes}
            placeholder={`Select modes... (${uniqueGameModes.length} available)`}
            searchable
            clearable
            size="sm"
            radius="md"
            comboboxProps={{ withinPortal: false }}
          />
        </FilterSection>
      </FilterRow>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
        <Button 
          onClick={clearAllFilters}
          disabled={!hasActiveFilters}
          color="gray"
          size="sm"
          variant="filled"
        >
          Clear All Filters
        </Button>
        
        <ResultCount>
          {hasActiveFilters ? (
            <>Showing <strong>{filteredCount}</strong> of <strong>{challenges.length}</strong> challenges</>
          ) : (
            <><strong>{challenges.length}</strong> challenges total</>
          )}
          {hasActiveFilters && (
            <div style={{ fontSize: '0.8rem', marginTop: '2px' }}>
              {selectedMapNames.length > 0 && `${selectedMapNames.length} map${selectedMapNames.length !== 1 ? 's' : ''}`}
              {selectedMapNames.length > 0 && selectedGameModes.length > 0 && ' • '}
              {selectedGameModes.length > 0 && `${selectedGameModes.length} mode${selectedGameModes.length !== 1 ? 's' : ''}`}
            </div>
          )}
        </ResultCount>
      </div>
    </FilterContainer>
  );
}

export default ChallengeFilterPanel; 