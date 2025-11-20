
export enum Position {
  UP = 'Up',
  DOWN = 'Down',
  LEFT = 'Left',
  RIGHT = 'Right',
}

export interface Player {
  id: string;
  name: string;
  position: Position;
  totalScore: number;
  teamId: 1 | 2; // 1 for Up/Down (Blue), 2 for Left/Right (Red)
}

export interface StakeConfig {
  double: number;
  second: number;
  single: number;
}

export interface RoundRecord {
  id: number;
  finishOrder: string[]; // array of player IDs
  scores: Record<string, number>; // playerId -> score change
  timestamp: number;
  resultType: '双扣' | '次扣' | '单扣';
  stakeConfig: StakeConfig;
}

export const INITIAL_PLAYERS: Player[] = [
  { id: 'p1', name: '阿龙', position: Position.UP, totalScore: 0, teamId: 1 },
  { id: 'p2', name: '阿虎', position: Position.DOWN, totalScore: 0, teamId: 1 },
  { id: 'p3', name: '阿豹', position: Position.RIGHT, totalScore: 0, teamId: 2 },
  { id: 'p4', name: '阿凤', position: Position.LEFT, totalScore: 0, teamId: 2 },
];
