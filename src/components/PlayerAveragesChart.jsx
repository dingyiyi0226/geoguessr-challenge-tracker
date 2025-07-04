import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import Chart from 'react-apexcharts';
import { formatScore } from '../utils/formatters';
import { Switch } from '@mantine/core';

const ChartSection = styled.div`
  padding: 20px 25px;
  margin-bottom: 30px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e9ecef;
`;

const SectionTitleWithControls = styled.h3`
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 1.1rem;
`;

function PlayerAveragesChart({ allPlayers }) {
  const [showUnqualified, setShowUnqualified] = useState(true);

  // Prepare player averages data for bar chart
  const playerAveragesData = useMemo(() => {
    if (!allPlayers || allPlayers.length === 0) return null;
    
    // Filter players based on showUnqualified toggle and sort by average score
    const filteredPlayers = showUnqualified 
      ? allPlayers
      : allPlayers.filter(player => player.qualified);
    
    const playersWithData = filteredPlayers.sort((a, b) => b.averageChallengeScore - a.averageChallengeScore);
    
    return {
      categories: playersWithData.map(player => player.nick),
      series: [{
        name: 'Average Score',
        data: playersWithData.map(player => Math.round(player.averageChallengeScore))
      }],
      participations: playersWithData.map(player => player.participations),
      qualified: playersWithData.map(player => player.qualified)
    };
  }, [allPlayers, showUnqualified]);

  const playerAveragesChartOptions = useMemo(() => {
    // Generate colors based on qualification status
    const barColors = playerAveragesData?.qualified.map(isQualified => 
      isQualified ? '#27AE60' : '#2980B9'  // Dark Green for qualified, Dark Blue for unqualified
    ) || [];

    return {
      chart: {
        type: 'bar',
        height: 400,
        toolbar: {
          show: true
        }
      },
      plotOptions: {
        bar: {
          borderRadius: 8,
          horizontal: false,
          columnWidth: '60%',
          dataLabels: {
            position: 'top'
          },
          distributed: true,
          states: {
            hover: {
              filter: {
                type: 'none',
              }
            },
            active: {
              filter: {
                type: 'none',
              }
            }
          }
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return formatScore(val);
        },
        offsetY: -20,
        style: {
          fontSize: '12px',
          colors: ['#304758']
        }
      },
      xaxis: {
        categories: playerAveragesData?.categories || [],
        title: {
          text: 'Players'
        },
        labels: {
          rotate: -45,
          style: {
            fontSize: '11px'
          }
        }
      },
      yaxis: {
        title: {
          text: 'Average Score'
        },
        labels: {
          formatter: function (val) {
            return formatScore(val);
          }
        }
      },
      colors: barColors,
      grid: {
        borderColor: '#e7e7e7',
        yaxis: {
          lines: {
            show: true
          }
        }
      },
      legend: {
        show: false
      },
      tooltip: {
        y: {
          formatter: function (val, { dataPointIndex }) {
            const participations = playerAveragesData?.participations[dataPointIndex] || 0;
            return `${formatScore(val)} (${participations} challenges)`;
          }
        }
      }
    };
  }, [playerAveragesData]);

  if (!allPlayers || allPlayers.length === 0) {
    return (
      <ChartSection>
        <SectionHeader>
          <SectionTitleWithControls>Player Average Scores</SectionTitleWithControls>
        </SectionHeader>
        <NoDataMessage>
          No player data available for averages comparison
        </NoDataMessage>
      </ChartSection>
    );
  }

  return (
    <ChartSection>
      <SectionHeader>
        <SectionTitleWithControls>Player Average Scores</SectionTitleWithControls>
        <ToggleContainer>
          <Switch
            checked={showUnqualified}
            onChange={(event) => setShowUnqualified(event.currentTarget.checked)}
            label="Show low participation players"
            color="gray"
            size="sm"
          />
        </ToggleContainer>
      </SectionHeader>
      {playerAveragesData && playerAveragesData.series[0].data.length > 0 ? (
        <Chart
          options={playerAveragesChartOptions}
          series={playerAveragesData.series}
          type="bar"
          height={400}
        />
      ) : (
        <NoDataMessage>
          No player data available for averages comparison
        </NoDataMessage>
      )}
    </ChartSection>
  );
}

export default PlayerAveragesChart; 