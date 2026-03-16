export type Position = 'Goleiro' | 'Zagueiro' | 'Lateral' | 'Meio-campista' | 'Atacante';

export interface Player {
  id: string;
  name: string;
  position: Position;
  odd: number;
}

export interface Bet {
  playerId: string;
  playerName: string;
  odd: number;
  amount: number;
}
