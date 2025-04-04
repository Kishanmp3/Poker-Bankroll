export interface Session {
  id: string;
  date: Date;
  location: string;
  buyIn: number;
  cashOut: number;
  duration: number;
  game: string;
  notes?: string;
}

export interface Location {
  id: string;
  name: string;
  totalSessions: number;
  totalProfit: number;
}

export interface MonthSummary {
  month: string;
  profit: number;
  sessions: number;
}

export interface StakingArrangement {
  id: string;
  friend: string;
  percent: number;
  active: boolean;
}

export interface Summary {
  totalProfit: number;
  totalSessions: number;
  averageProfit: number;
  winRate: number;
  biggestWin: number;
  biggestLoss: number;
}
