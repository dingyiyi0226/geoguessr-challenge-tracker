import React from 'react';
import styled from 'styled-components';
import { Button, MultiSelect } from '@mantine/core';
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

const FilterRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 10px;
`;

const FilterColumn = styled.div`
  flex: 1;
`;

const COMMON_MAP_NAMES = [
  "A Community World",
  "An Official World",
  "A Varied World",
  "A Rainbolt World",
  "A Competitive World",
  "An Arbitrary World"
]

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

  const handleSelectCommonMaps = () => {
    const availableCommonMaps = COMMON_MAP_NAMES.filter(mapName => 
      uniqueMapNames.includes(mapName)
    );
    onMapNamesChange(availableCommonMaps);
  };

  return (
    <FilterPanel $visible={visible}>      
      <div>
        <FilterLabel>📍 Map Names</FilterLabel>
        <FilterRow>
          <FilterColumn>
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
          </FilterColumn>
          <Button
            onClick={handleSelectCommonMaps}
            size="sm"
            radius="md"
            variant="outline"
            color="blue"
          >
            Common Maps
          </Button>
        </FilterRow>
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