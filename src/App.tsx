import { useState, useCallback } from 'react'
import { GameState, Player, TimerMode } from './types'
import SetupScreen from './components/Setup/SetupScreen'
import TimerScreen from './components/Timer/TimerScreen'

const initialGameState = (): GameState => ({
  phase: 'setup',
  mode: 'turn',
  players: [],
  activePlayerIndex: 0,
  isPaused: false,
  roundCount: 1,
  turnSeconds: 30,
})

export default function App() {
  const [gameState, setGameState] = useState<GameState>(initialGameState)

  const handleStart = useCallback((players: Player[], mode: TimerMode, turnSeconds: number) => {
    setGameState({
      phase: 'game',
      mode,
      players,
      activePlayerIndex: 0,
      isPaused: false,
      roundCount: 1,
      turnSeconds,
    })
  }, [])

  const handleReset = useCallback(() => {
    setGameState(initialGameState())
  }, [])

  if (gameState.phase === 'setup') {
    return <SetupScreen onStart={handleStart} />
  }

  return (
    <TimerScreen
      state={gameState}
      onStateChange={setGameState}
      onReset={handleReset}
    />
  )
}
