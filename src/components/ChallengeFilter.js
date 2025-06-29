import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const FilterContainer = styled.div`
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  padding: 20px 25px;
`;

const FilterTitle = styled.h3`
  color: #333;
  margin-bottom: 15px;
  font-size: 1.1rem;
  font-weight: 600;
`;

const FilterSection = styled.div`
  margin-bottom: 15px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const FilterLabel = styled.label`
  display: block;
  font-weight: 500;
  color: #555;
  margin-bottom: 8px;
  font-size: 0.9rem;
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }

  &:hover {
    border-color: #c5c9cd;
  }
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

const ClearFiltersButton = styled.button`
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-top: 10px;

  &:hover {
    background: #5a6268;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ResultCount = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-top: 10px;
  font-style: italic;
`;

function ChallengeFilter({ challenges, onFilterChange, filteredCount }) {
  const [mapNameFilter, setMapNameFilter] = useState('');
  const [gameModeFilter, setGameModeFilter] = useState('');

  // Extract unique map names and game modes from challenges
  const uniqueMapNames = React.useMemo(() => {
    const mapNames = challenges
      .map(challenge => challenge.mapName)
      .filter(Boolean)
      .filter((name, index, array) => array.indexOf(name) === index)
      .sort();
    return mapNames;
  }, [challenges]);

  const uniqueGameModes = React.useMemo(() => {
    const gameModes = challenges
      .map(challenge => challenge.mode)
      .filter(Boolean)
      .filter((mode, index, array) => array.indexOf(mode) === index)
      .sort();
    return gameModes;
  }, [challenges]);

  // Apply filters whenever filter values change
  useEffect(() => {
    const filteredChallenges = challenges.filter(challenge => {
      const mapNameMatch = !mapNameFilter || challenge.mapName === mapNameFilter;
      const gameModeMatch = !gameModeFilter || challenge.mode === gameModeFilter;
      return mapNameMatch && gameModeMatch;
    });

    onFilterChange(filteredChallenges);
  }, [challenges, mapNameFilter, gameModeFilter, onFilterChange]);

  const handleMapNameChange = (e) => {
    setMapNameFilter(e.target.value);
  };

  const handleGameModeChange = (e) => {
    setGameModeFilter(e.target.value);
  };

  const clearFilters = () => {
    setMapNameFilter('');
    setGameModeFilter('');
  };

  const hasActiveFilters = mapNameFilter || gameModeFilter;

  if (challenges.length === 0) {
    return null;
  }

  return (
    <FilterContainer>
      <FilterTitle>Filter Challenges</FilterTitle>
      
      <FilterRow>
        <FilterSection>
          <FilterLabel htmlFor="mapNameFilter">Map Name</FilterLabel>
          <FilterSelect
            id="mapNameFilter"
            value={mapNameFilter}
            onChange={handleMapNameChange}
          >
            <option value="">All Maps ({uniqueMapNames.length})</option>
            {uniqueMapNames.map(mapName => (
              <option key={mapName} value={mapName}>
                {mapName}
              </option>
            ))}
          </FilterSelect>
        </FilterSection>

        <FilterSection>
          <FilterLabel htmlFor="gameModeFilter">Game Mode</FilterLabel>
          <FilterSelect
            id="gameModeFilter"
            value={gameModeFilter}
            onChange={handleGameModeChange}
          >
            <option value="">All Modes ({uniqueGameModes.length})</option>
            {uniqueGameModes.map(gameMode => (
              <option key={gameMode} value={gameMode}>
                {gameMode}
              </option>
            ))}
          </FilterSelect>
        </FilterSection>
      </FilterRow>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ClearFiltersButton 
          onClick={clearFilters}
          disabled={!hasActiveFilters}
        >
          Clear Filters
        </ClearFiltersButton>
        
        <ResultCount>
          {hasActiveFilters ? (
            `Showing ${filteredCount} of ${challenges.length} challenges`
          ) : (
            `${challenges.length} challenges total`
          )}
        </ResultCount>
      </div>
    </FilterContainer>
  );
}

export default ChallengeFilter; 