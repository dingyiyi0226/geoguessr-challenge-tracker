import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import Chart from 'react-apexcharts';
import { formatScore } from '../utils/formatters';

const TrendsContainer = styled.div`
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-top: 30px;
`;

const TrendsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  flex-wrap: wrap;
  gap: 15px;
`;

const TrendsTitle = styled.h3`
  color: #333;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
`;

const MetricSelector = styled.select`
  padding: 8px 12px;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  background: white;
  font-size: 0.9rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const PlayerFilter = styled.select`
  padding: 8px 12px;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  background: white;
  font-size: 0.9rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const ChartContainer = styled.div`
  padding: 20px 25px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 1.1rem;
`;

function ChallengeTrends({ challenges, isPagedView = false, currentPage = 1, totalPages = 1, totalChallenges = 0 }) {
  const [selectedMetric, setSelectedMetric] = useState('totalScore');
  const [selectedPlayers, setSelectedPlayers] = useState('all');

  // Process data to extract trends
  const processedData = useMemo(() => {
    if (!challenges || challenges.length === 0) return null;

    // Get all unique players across all challenges
    const allPlayers = new Map();
    challenges.forEach((challenge, challengeIndex) => {
      challenge.participants?.forEach(participant => {
        if (!allPlayers.has(participant.userId)) {
          allPlayers.set(participant.userId, {
            userId: participant.userId,
            nick: participant.nick,
            performances: [],
            participations: 0,
            totalChallengeScore: 0,
            averageChallengeScore: 0,
          });
        }
      });
    });

    // Populate performance data for each player
    challenges.forEach((challenge, challengeIndex) => {
      challenge.participants?.forEach(participant => {
        const player = allPlayers.get(participant.userId);
        if (player) {
          player.performances[challengeIndex] = {
            challengeName: challenge.name || `Challenge ${challengeIndex + 1}`,
            challengeIndex,
            totalScore: participant.totalScore || 0,
            averageScore: participant.rounds ? 
              participant.rounds.reduce((sum, round) => sum + (round.score || 0), 0) / participant.rounds.length : 0,
            totalTime: participant.totalTime || 0,
            averageTime: participant.rounds ? 
              participant.rounds.reduce((sum, round) => sum + (round.time || 0), 0) / participant.rounds.length : 0,
            totalDistance: participant.totalDistance || 0,
            averageDistance: participant.rounds ? 
              participant.rounds.reduce((sum, round) => sum + (round.distance || 0), 0) / participant.rounds.length : 0,
            rank: participant.rank || 0,
            scorePercentage: participant.scorePercentage || 0
          };
          player.participations++;
          player.totalChallengeScore += player.performances[challengeIndex].totalScore;
        }
      });
    });

    // Fill missing data points with null for players who didn't participate in all challenges
    allPlayers.forEach(player => {
      for (let i = 0; i < challenges.length; i++) {
        if (!player.performances[i]) {
          player.performances[i] = {
            challengeName: challenges[i]?.name || `Challenge ${i + 1}`,
            challengeIndex: i,
            totalScore: null,
            averageScore: null,
            totalTime: null,
            averageTime: null,
            totalDistance: null,
            averageDistance: null,
            rank: null,
            scorePercentage: null
          };
        }
      }
    });

    // Post processing
    allPlayers.forEach(player => {
      player.averageChallengeScore = player.totalChallengeScore / player.participations;
    })

    return Array.from(allPlayers.values());
  }, [challenges]);

  // Filter players based on selection
  const filteredPlayers = useMemo(() => {
    if (!processedData) return [];
    
    if (selectedPlayers === 'all') {
      return processedData;
    }
    
    return processedData.filter(player => player.userId === selectedPlayers);
  }, [processedData, selectedPlayers]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!filteredPlayers.length || !challenges.length) return null;

    const categories = challenges.map((challenge, index) => 
      challenge.name || `Challenge ${index + 1}`
    );

    const series = filteredPlayers.map(player => ({
      name: player.nick,
      data: player.performances.map(performance => {
        switch (selectedMetric) {
          case 'totalScore':
            return performance.totalScore;
          case 'averageScore':
            return Math.round(performance.averageScore || 0);
          case 'totalTime':
            return performance.totalTime;
          case 'averageTime':
            return Math.round(performance.averageTime || 0);
          case 'averageDistance':
            return Math.round((performance.averageDistance || 0) / 1000); // Convert to km
          case 'rank':
            return performance.rank;
          case 'scorePercentage':
            return Math.round(performance.scorePercentage || 0);
          default:
            return performance.totalScore;
        }
      })
    }));

    return { categories, series };
  }, [filteredPlayers, challenges, selectedMetric]);

  // Calculate overall stats
  const overallStats = useMemo(() => {
    if (!processedData || !challenges.length) return null;

    const totalChallenges = challenges.length;
    const totalPlayers = processedData.length;
    
    // Calculate average scores across all challenges and players
    let totalScoreSum = 0;
    let totalParticipations = 0;
    
    processedData.forEach(player => {
      player.performances.forEach(performance => {
        if (performance.totalScore !== null) {
          totalScoreSum += performance.totalScore;
          totalParticipations++;
        }
      });
    });

    const averageScore = totalParticipations > 0 ? Math.round(totalScoreSum / totalParticipations) : 0;

    // Find best performing player
    const bestPlayer = processedData
      .filter(player => player.participations > totalChallenges/4)
      .reduce((best, player) => {
      const playerAvg = player.averageChallengeScore;
      const bestAvg = best ? best.averageChallengeScore : 0;
      
      return playerAvg > bestAvg ? player : best;
    }, null);

    return {
      totalChallenges,
      totalPlayers,
      averageScore,
      bestPlayer: bestPlayer?.nick || 'N/A',
      bestScore: Math.round(bestPlayer?.averageChallengeScore) || 0
    };
  }, [processedData, challenges]);

  const getMetricLabel = (metric) => {
    const labels = {
      totalScore: 'Total Score',
      averageScore: 'Avg Score per Round',
      totalTime: 'Total Time (s)',
      averageTime: 'Avg Time per Round (s)',
      averageDistance: 'Avg Distance (km)',
      rank: 'Rank',
      scorePercentage: 'Score Percentage (%)'
    };
    return labels[metric] || metric;
  };

  const getChartOptions = () => ({
    chart: {
      type: 'line',
      height: 400,
      zoom: {
        enabled: true
      },
      toolbar: {
        show: true
      }
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    markers: {
      size: 6,
      strokeWidth: 2,
      fillOpacity: 1,
      strokeOpacity: 1,
      hover: {
        size: 8
      }
    },
    xaxis: {
      categories: chartData?.categories || [],
      title: {
        text: 'Challenges'
      }
    },
    yaxis: {
      title: {
        text: getMetricLabel(selectedMetric)
      },
      reversed: selectedMetric === 'rank' // Lower rank is better
    },
    legend: {
      position: 'top'
    },
    grid: {
      borderColor: '#e7e7e7',
      row: {
        colors: ['#f3f3f3', 'transparent'],
        opacity: 0.5
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function (val, { seriesIndex, dataPointIndex, w }) {
          if (val === null || val === undefined) return 'Did not participate';
          
          switch (selectedMetric) {
            case 'totalTime':
            case 'averageTime':
              const minutes = Math.floor(val / 60);
              const seconds = val % 60;
              return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
            case 'averageDistance':
              return `${val} km`;
            case 'scorePercentage':
              return `${val}%`;
            case 'rank':
              return `#${val}`;
            default:
              return val?.toLocaleString() || val;
          }
        }
      }
    },
    colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#43e97b', '#fa709a', '#ffecd2']
  });

  if (!challenges || challenges.length === 0) {
    return (
      <TrendsContainer>
        <TrendsHeader>
          <TrendsTitle>Performance Trends</TrendsTitle>
        </TrendsHeader>
        <NoDataMessage>
          Add multiple challenges to see performance trends
        </NoDataMessage>
      </TrendsContainer>
    );
  }

  if (!processedData || processedData.length === 0) {
    return (
      <TrendsContainer>
        <TrendsHeader>
          <TrendsTitle>Performance Trends</TrendsTitle>
        </TrendsHeader>
        <NoDataMessage>
          No player data available for trend analysis
        </NoDataMessage>
      </TrendsContainer>
    );
  }

  return (
    <TrendsContainer>
      <TrendsHeader>
        <TrendsTitle>
          Performance Trends
          {isPagedView && totalPages > 1 && (
            <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#666', marginLeft: '10px' }}>
              (Page {currentPage} of {totalPages} - {challenges.length} of {totalChallenges} challenges)
            </span>
          )}
        </TrendsTitle>
        <ControlsContainer>
          <MetricSelector
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
          >
            <option value="totalScore">Total Score</option>
            <option value="averageScore">Average Score per Round</option>
            <option value="totalTime">Total Time</option>
            <option value="averageTime">Average Time per Round</option>
            <option value="averageDistance">Average Distance</option>
            <option value="rank">Rank</option>
            <option value="scorePercentage">Score Percentage</option>
          </MetricSelector>
          
          <PlayerFilter
            value={selectedPlayers}
            onChange={(e) => setSelectedPlayers(e.target.value)}
          >
            <option value="all">All Players</option>
            {processedData.map(player => (
              <option key={player.userId} value={player.userId}>
                {player.nick}
              </option>
            ))}
          </PlayerFilter>
        </ControlsContainer>
      </TrendsHeader>

      <ChartContainer>
        {overallStats && (
          <StatsGrid>
            <StatCard>
              <StatValue>{overallStats.totalChallenges}</StatValue>
              <StatLabel>Total Challenges</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{overallStats.totalPlayers}</StatValue>
              <StatLabel>Unique Players</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{formatScore(overallStats.averageScore)}</StatValue>
              <StatLabel>Average Score</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{overallStats.bestPlayer}</StatValue>
              <StatLabel>Top Performer - {formatScore(overallStats.bestScore)}</StatLabel>
            </StatCard>
          </StatsGrid>
        )}

        {chartData && chartData.series.length > 0 ? (
          <Chart
            options={getChartOptions()}
            series={chartData.series}
            type="line"
            height={400}
          />
        ) : (
          <NoDataMessage>
            No data available for the selected filters
          </NoDataMessage>
        )}
      </ChartContainer>
    </TrendsContainer>
  );
}

export default ChallengeTrends; 