import React from 'react';
import styled from 'styled-components';
import { MultiSelect } from '@mantine/core';
import _ from 'lodash';

const FilterPanel = styled.div`
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin: 15px 25px 0;
  padding: 20px 25px;
  display: ${props => props.$visible ? 'grid' : 'none'};
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const FilterLabel = styled.div`
  font-weight: 500;
  color: #555;
  margin-bottom: 8px;
  font-size: 0.95rem;
`;

function ChallengeFilterPanel({ 
  challenges, 
  visible, 
  selectedMapNames, 
  selectedGameModes, 
  onMapNamesChange, 
  onGameModesChange
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

  return (
    <FilterPanel $visible={visible}>      
      <div>
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
      </div>

      <div>
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
      </div>
    </FilterPanel>
  );
}

export default ChallengeFilterPanel; 