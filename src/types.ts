export type Phase = 'setup' | 'game' | 'result'
export type TimerMode = 'total' | 'turn'

export interface Player {
  id: number
  name: string
  totalSeconds: number
  remainingSeconds: number
  isActive: boolean
  isEliminated: boolean
}

export interface GameState {
  phase: Phase
  mode: TimerMode
  players: Player[]
  activePlayerIndex: number
  isPaused: boolean
  roundCount: number
  turnSeconds: number
}
