import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import Chart from 'react-apexcharts';
import { formatTime, formatDistance, formatScore, getRankDisplay } from '../utils/formatters';

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

const SectionTitleWithControls = styled.h4`
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
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

const NoDataMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 1.1rem;
`;

function PerformanceTrendsChart({ allPlayers, challenges }) {
  const [selectedMetric, setSelectedMetric] = useState('totalScore');
  const [selectedPlayers, setSelectedPlayers] = useState('all');

  // Filter players based on selection
  const filteredPlayers = useMemo(() => {
    if (!allPlayers) return [];
    
    if (selectedPlayers === 'all') {
      return allPlayers;
    }
    
    return allPlayers.filter(player => player.userId === selectedPlayers);
  }, [allPlayers, selectedPlayers]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!filteredPlayers.length || !challenges.length) return null;

    const categories = challenges.map((challenge, index) => 
      challenge.name || `Challenge ${index + 1}`
    );

    const series = filteredPlayers.map(player => ({
      name: player.nick,
      data: player.challenges.map(challenge => {
        switch (selectedMetric) {
          case 'totalScore':
            return challenge.totalScore;
          case 'averageScore':
            return Math.round(challenge.averageScore || 0);
          case 'totalTime':
            return challenge.totalTime;
          case 'averageTime':
            return Math.round(challenge.averageTime || 0);
          case 'averageDistance':
            return Math.round((challenge.averageDistance || 0) / 1000); // Convert to km
          case 'rank':
            return challenge.rank;
          case 'scorePercentage':
            return Math.round(challenge.scorePercentage || 0);
          default:
            return challenge.totalScore;
        }
      })
    }));

    return { categories, series };
  }, [filteredPlayers, challenges, selectedMetric]);

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

  const chartOptions = useMemo(() => ({
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
                return formatTime(val);
            case 'averageDistance':
                return formatDistance(val);
            case 'scorePercentage':
                return `${val}%`;
            case 'rank':
                return getRankDisplay(val);
            default:
                return formatScore(val);
          }
        }
      }
    },
    colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#43e97b', '#fa709a', '#ffecd2']
  }), [chartData, selectedMetric]);

  if (!allPlayers || allPlayers.length === 0) {
    return (
      <ChartSection>
        <SectionHeader>
          <SectionTitleWithControls>Performance Trends Over Challenges</SectionTitleWithControls>
        </SectionHeader>
        <NoDataMessage>
          No player data available for trend analysis
        </NoDataMessage>
      </ChartSection>
    );
  }

  return (
    <ChartSection>
      <SectionHeader>
        <SectionTitleWithControls>Performance Trends Over Challenges</SectionTitleWithControls>
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
            {allPlayers.map(player => (
              <option key={player.userId} value={player.userId}>
                {player.nick}
              </option>
            ))}
          </PlayerFilter>
        </ControlsContainer>
      </SectionHeader>

      {chartData && chartData.series.length > 0 ? (
        <Chart
          options={chartOptions}
          series={chartData.series}
          type="line"
          height={400}
        />
      ) : (
        <NoDataMessage>
          No data available for the selected filters
        </NoDataMessage>
      )}
    </ChartSection>
  );
}

export default PerformanceTrendsChart; 