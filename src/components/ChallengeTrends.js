import React, { useMemo } from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import { formatScore } from '../utils/formatters';
import PlayerAveragesChart from './PlayerAveragesChart';
import PerformanceTrendsChart from './PerformanceTrendsChart';

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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  padding: 20px 25px;
  margin-bottom: 10px;
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

  // Process data to extract trends
  const allPlayers = useMemo(() => {
    if (!challenges || challenges.length === 0) return null;

    // Get all unique players across all challenges
    const allPlayers = new Map();
    challenges.forEach((challenge, challengeIndex) => {
      challenge.participants?.forEach(participant => {
        if (!allPlayers.has(participant.userId)) {
          allPlayers.set(participant.userId, {
            userId: participant.userId,
            nick: participant.nick,
            challenges: [],
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
          player.challenges[challengeIndex] = {
            challengeName: challenge.name || `Challenge ${challengeIndex + 1}`,
            challengeIndex,
            totalScore: participant.totalScore || 0,
            totalTime: participant.totalTime || 0,
            totalDistance: participant.totalDistance || 0,
            averageScore: participant.totalScore / participant.rounds?.length || 0,
            averageTime: participant.totalTime / participant.rounds?.length || 0,
            averageDistance: participant.totalDistance / participant.rounds?.length || 0,
            rank: participant.rank || 0,
            scorePercentage: participant.scorePercentage || 0
          };
          player.participations++;
          player.totalChallengeScore += player.challenges[challengeIndex].totalScore;
        }
      });
    });

    // Fill missing data points with null for players who didn't participate in all challenges
    allPlayers.forEach(player => {
      for (let i = 0; i < challenges.length; i++) {
        if (!player.challenges[i]) {
          player.challenges[i] = {
            challengeName: challenges[i]?.name || `Challenge ${i + 1}`,
            challengeIndex: i,
            totalScore: null,
            totalTime: null,
            totalDistance: null,
            averageScore: null,
            averageTime: null,
            averageDistance: null,
            rank: null,
            scorePercentage: null
          };
        }
      }
    });

    allPlayers.forEach(player => {
      player.averageChallengeScore = player.totalChallengeScore / player.participations;
      player.qualified = player.participations > challenges.length / 4;
    })

    return Array.from(allPlayers.values());
  }, [challenges]);



  // Calculate overall stats
  const overallStats = useMemo(() => {
    if (!allPlayers || !challenges.length) return null;
    
    // Calculate average scores across all challenges and players
    let totalScoreSum = 0;
    let totalParticipations = 0;
    
    allPlayers.forEach(player => {
      totalScoreSum += player.totalChallengeScore;
      totalParticipations += player.participations;
    });

    const averageScore = totalParticipations > 0 ? Math.round(totalScoreSum / totalParticipations) : 0;
    const bestPlayer = _.maxBy(allPlayers.filter(player => player.qualified), 'averageChallengeScore');

    return {
      totalChallenges: challenges.length,
      totalPlayers: allPlayers.length,
      averageScore,
      bestPlayer: bestPlayer?.nick || 'N/A',
      bestScore: Math.round(bestPlayer?.averageChallengeScore) || 0
    };
  }, [allPlayers, challenges]);



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

  if (!allPlayers || allPlayers.length === 0) {
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
      </TrendsHeader>

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

      <PerformanceTrendsChart allPlayers={allPlayers} challenges={challenges} />
      <PlayerAveragesChart allPlayers={allPlayers} />
    </TrendsContainer>
  );
}

export default ChallengeTrends; 