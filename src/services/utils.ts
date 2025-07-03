import { 
  GeoguessrChallengeResponse, 
  GeoguessrHighscoreResponse,
} from '../api/types';
import { 
  ChallengeData, 
  Participant, 
  Round,
  GameMode
} from './types/application';

/**
 * Get game mode from challenge data
 */
export const getGameMode = (challengeResp: GeoguessrChallengeResponse): GameMode => {
  if (challengeResp.challenge.forbidMoving && challengeResp.challenge.forbidRotating && challengeResp.challenge.forbidZooming) {
    return 'NMPZ';
  } else if (challengeResp.challenge.forbidMoving) {
    return 'No move';
  } else {
    return 'Moving';
  }
};

/**
 * Convert raw API responses into challenge data format
 */
export const convertRespToChallengeData = (
  challengeId: string, 
  challengeResp: GeoguessrChallengeResponse, 
  highscoresResp: GeoguessrHighscoreResponse
): ChallengeData => {
  // Process highscores items to get detailed results
  const participants: Participant[] = highscoresResp.items.map((item, index) => {
    const game = item.game;
    const player = game.player;

    const rounds: Round[] = game.rounds.map((round, roundIndex) => {
      const guess = player.guesses[roundIndex];
      return {
        roundNumber: roundIndex + 1,
        lat: round.lat,
        lng: round.lng,
        guessLat: guess.lat,
        guessLng: guess.lng,
        distance: guess.distanceInMeters,
        score: guess.roundScoreInPoints,
        time: guess.time,
        timedOut: guess.timedOut,
        skippedRound: guess.skippedRound,
      };
    });

    return {
      rank: index + 1,
      userId: player.id,
      nick: player.nick,
      totalScore: parseFloat(player.totalScore.amount),
      totalTime: player.totalTime,
      playedAt: game.rounds[0]?.startTime,
      countryCode: player.countryCode,
      isVerified: player.isVerified,
      totalDistance: player.totalDistanceInMeters,
      scorePercentage: player.totalScore.percentage,
      rounds,
    };
  });

  return {
    id: challengeId,
    name: challengeResp.map.name,
    creator: challengeResp.creator.nick,
    mode: getGameMode(challengeResp),
    timeLimit: challengeResp.challenge.timeLimit,
    mapName: challengeResp.map.name,
    mapId: challengeResp.map.id,
    roundCount: challengeResp.challenge.roundCount,
    participants,
  };
}; 