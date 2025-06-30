import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
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

const CustomDropdown = styled.div`
  position: relative;
`;

const DropdownButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  background: white;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;

  &:hover, &:focus {
    border-color: #667eea;
    outline: none;
  }

  &.open {
    border-color: #667eea;
    border-radius: 8px 8px 0 0;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #667eea;
  border-top: none;
  border-radius: 0 0 8px 8px;
  max-height: 250px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const DropdownHeader = styled.div`
  padding: 8px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e1e5e9;
  display: flex;
  gap: 8px;
  font-size: 0.85rem;
`;

const HeaderButton = styled.button`
  padding: 4px 8px;
  background: ${props => props.$type === 'select' ? '#667eea' : '#dc3545'};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: ${props => props.$type === 'select' ? '#5a67d8' : '#c82333'};
  }
`;

const DropdownItem = styled.div`
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;

  &:hover {
    background: #f8f9fa;
  }

  &:last-child {
    border-radius: 0 0 6px 6px;
  }

  input[type="checkbox"] {
    margin: 0;
    cursor: pointer;
  }
`;

const SelectedChipsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
`;

const SelectedChip = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #667eea;
  color: white;
  border-radius: 16px;
  font-size: 0.8rem;
`;

const RemoveChipButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  
  &:hover {
    color: #ffcccb;
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
  const [dropdownOpen, setDropdownOpen] = useState({ maps: false, modes: false });

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setDropdownOpen({ maps: false, modes: false });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleSelection = (item, type) => {
    const currentArray = type === 'map' ? selectedMapNames : selectedGameModes;
    const updateFunction = type === 'map' ? onMapNamesChange : onGameModesChange;
    
    const newArray = currentArray.includes(item)
      ? _.without(currentArray, item)  // Remove item
      : _.union(currentArray, [item]); // Add item
      
    updateFunction(newArray);
  };

  const removeSelection = (item, type) => {
    const currentArray = type === 'map' ? selectedMapNames : selectedGameModes;
    const updateFunction = type === 'map' ? onMapNamesChange : onGameModesChange;
    
    const newArray = _.without(currentArray, item);
    updateFunction(newArray);
  };

  const selectAllMaps = () => {
    onMapNamesChange([...uniqueMapNames]);
  };

  const deselectAllMaps = () => {
    onMapNamesChange([]);
  };

  const selectAllModes = () => {
    onGameModesChange([...uniqueGameModes]);
  };

  const deselectAllModes = () => {
    onGameModesChange([]);
  };

  const clearAllFilters = () => {
    onMapNamesChange([]);
    onGameModesChange([]);
    setDropdownOpen({ maps: false, modes: false });
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
          <CustomDropdown className="dropdown-container">
            <DropdownButton 
              className={dropdownOpen.maps ? 'open' : ''}
              onClick={() => setDropdownOpen(prev => ({ ...prev, maps: !prev.maps }))}
            >
              <span>
                {selectedMapNames.length === 0 
                  ? `Select maps... (${uniqueMapNames.length} available)` 
                  : `${selectedMapNames.length} of ${uniqueMapNames.length} selected`
                }
              </span>
              <span>{dropdownOpen.maps ? '▲' : '▼'}</span>
            </DropdownButton>
            {dropdownOpen.maps && (
              <DropdownMenu>
                <DropdownHeader>
                  <HeaderButton $type="select" onClick={selectAllMaps}>
                    Select All
                  </HeaderButton>
                  <HeaderButton $type="deselect" onClick={deselectAllMaps}>
                    Clear All
                  </HeaderButton>
                </DropdownHeader>
                {uniqueMapNames.map(mapName => (
                  <DropdownItem key={mapName} onClick={() => toggleSelection(mapName, 'map')}>
                    <input 
                      type="checkbox" 
                      checked={selectedMapNames.includes(mapName)} 
                      onChange={() => {}} 
                    />
                    <span title={mapName}>{mapName}</span>
                  </DropdownItem>
                ))}
                {uniqueMapNames.length === 0 && (
                  <DropdownItem style={{ color: '#999', fontStyle: 'italic' }}>
                    No map names available
                  </DropdownItem>
                )}
              </DropdownMenu>
            )}
          </CustomDropdown>
          
          {selectedMapNames.length > 0 && (
            <SelectedChipsContainer>
              {selectedMapNames.map(mapName => (
                <SelectedChip key={mapName}>
                  📍 {mapName}
                  <RemoveChipButton onClick={() => removeSelection(mapName, 'map')}>
                    ×
                  </RemoveChipButton>
                </SelectedChip>
              ))}
            </SelectedChipsContainer>
          )}
        </FilterSection>

        <FilterSection>
          <FilterLabel>🎮 Game Modes</FilterLabel>
          <CustomDropdown className="dropdown-container">
            <DropdownButton 
              className={dropdownOpen.modes ? 'open' : ''}
              onClick={() => setDropdownOpen(prev => ({ ...prev, modes: !prev.modes }))}
            >
              <span>
                {selectedGameModes.length === 0 
                  ? `Select modes... (${uniqueGameModes.length} available)` 
                  : `${selectedGameModes.length} of ${uniqueGameModes.length} selected`
                }
              </span>
              <span>{dropdownOpen.modes ? '▲' : '▼'}</span>
            </DropdownButton>
            {dropdownOpen.modes && (
              <DropdownMenu>
                <DropdownHeader>
                  <HeaderButton $type="select" onClick={selectAllModes}>
                    Select All
                  </HeaderButton>
                  <HeaderButton $type="deselect" onClick={deselectAllModes}>
                    Clear All
                  </HeaderButton>
                </DropdownHeader>
                {uniqueGameModes.map(gameMode => (
                  <DropdownItem key={gameMode} onClick={() => toggleSelection(gameMode, 'mode')}>
                    <input 
                      type="checkbox" 
                      checked={selectedGameModes.includes(gameMode)} 
                      onChange={() => {}} 
                    />
                    <span>{gameMode}</span>
                  </DropdownItem>
                ))}
                {uniqueGameModes.length === 0 && (
                  <DropdownItem style={{ color: '#999', fontStyle: 'italic' }}>
                    No game modes available
                  </DropdownItem>
                )}
              </DropdownMenu>
            )}
          </CustomDropdown>
          
          {selectedGameModes.length > 0 && (
            <SelectedChipsContainer>
              {selectedGameModes.map(gameMode => (
                <SelectedChip key={gameMode}>
                  🎮 {gameMode}
                  <RemoveChipButton onClick={() => removeSelection(gameMode, 'mode')}>
                    ×
                  </RemoveChipButton>
                </SelectedChip>
              ))}
            </SelectedChipsContainer>
          )}
        </FilterSection>
      </FilterRow>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
        <ClearFiltersButton 
          onClick={clearAllFilters}
          disabled={!hasActiveFilters}
        >
          Clear All Filters
        </ClearFiltersButton>
        
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