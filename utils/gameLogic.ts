import { Player, RoundRecord, StakeConfig } from '../types';

/**
 * Calculates the score based on the finish order and stakes configuration.
 */
export const calculateRound = (
  finishOrder: string[], 
  players: Player[], 
  stakes: StakeConfig
): Omit<RoundRecord, 'id' | 'timestamp'> | null => {
  
  if (finishOrder.length < 3) return null; // Need at least 3 to determine result (4th is implied)

  // Ensure we have the full order (if 3 finished, 4th is the remaining one)
  const fullOrder = [...finishOrder];
  if (fullOrder.length === 3) {
    const playedIds = new Set(finishOrder);
    const lastPlayer = players.find(p => !playedIds.has(p.id));
    if (lastPlayer) {
      fullOrder.push(lastPlayer.id);
    }
  }

  const winnerId = fullOrder[0];
  const winner = players.find(p => p.id === winnerId)!;
  const partner = players.find(p => p.teamId === winner.teamId && p.id !== winnerId)!;
  
  const partnerIndex = fullOrder.indexOf(partner.id);

  let winAmount = 0;
  let resultType: '双扣' | '次扣' | '单扣' = '单扣';

  if (partnerIndex === 1) {
    // Partner finished 2nd (Indices: 0 & 1)
    winAmount = stakes.double;
    resultType = '双扣';
  } else if (partnerIndex === 2) {
    // Partner finished 3rd (Indices: 0 & 2)
    winAmount = stakes.second;
    resultType = '次扣';
  } else {
    // Partner finished 4th (Indices: 0 & 3)
    winAmount = stakes.single;
    resultType = '单扣';
  }

  const scores: Record<string, number> = {};

  players.forEach(p => {
    if (p.teamId === winner.teamId) {
      scores[p.id] = winAmount;
    } else {
      scores[p.id] = -winAmount;
    }
  });

  return {
    finishOrder: fullOrder,
    scores,
    resultType,
    stakeConfig: stakes
  };
};