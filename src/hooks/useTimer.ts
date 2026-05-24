import { useEffect, useRef, useCallback } from 'react'
import { GameState } from '../types'
import {
  playWarningBeep, playUrgentBeep, playCountdownBeep, playTimeUpSound
} from '../utils/sound'
import {
  vibrateWarning, vibrateUrgent, vibrateTimeUp
} from '../utils/vibration'

export function useTimer(
  state: GameState,
  onTick: (playerIndex: number) => void,
  onTimeUp: (playerIndex: number) => void,
) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const alertedRef = useRef<Set<string>>(new Set())

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // アクティブプレイヤーが変わったらそのプレイヤーのアラート履歴をリセット
  useEffect(() => {
    const player = state.players[state.activePlayerIndex]
    if (!player) return
    const keysToDelete = [...alertedRef.current].filter(k => k.startsWith(`${player.id}-`))
    keysToDelete.forEach(k => alertedRef.current.delete(k))
  }, [state.activePlayerIndex])

  useEffect(() => {
    clearTimer()

    if (state.phase !== 'game' || state.isPaused) return

    const activePlayer = state.players[state.activePlayerIndex]
    if (!activePlayer || activePlayer.isEliminated || activePlayer.remainingSeconds <= 0) return

    intervalRef.current = setInterval(() => {
      onTick(state.activePlayerIndex)
    }, 1000)

    return clearTimer
  }, [state.phase, state.isPaused, state.activePlayerIndex, clearTimer, onTick])

  useEffect(() => {
    if (state.phase !== 'game') return

    const activePlayer = state.players[state.activePlayerIndex]
    if (!activePlayer || activePlayer.isEliminated) return

    const { remainingSeconds, totalSeconds, id } = activePlayer
    const pct = remainingSeconds / totalSeconds

    const key30 = `${id}-30`
    const key10 = `${id}-10`
    const key0 = `${id}-0`

    if (pct <= 0.25 && pct > 0 && !alertedRef.current.has(`${id}-25pct`)) {
      alertedRef.current.add(`${id}-25pct`)
      playWarningBeep()
      vibrateWarning()
    }
    if (remainingSeconds === 30 && !alertedRef.current.has(key30)) {
      alertedRef.current.add(key30)
      playWarningBeep()
      vibrateWarning()
    }
    if (remainingSeconds === 10 && !alertedRef.current.has(key10)) {
      alertedRef.current.add(key10)
      playUrgentBeep()
      vibrateUrgent()
    }
    if (remainingSeconds <= 5 && remainingSeconds > 0) {
      playCountdownBeep(remainingSeconds)
    }
    if (remainingSeconds === 0 && !alertedRef.current.has(key0)) {
      alertedRef.current.add(key0)
      playTimeUpSound()
      vibrateTimeUp()
      onTimeUp(state.activePlayerIndex)
    }
  }, [state.players, state.activePlayerIndex, state.phase, onTimeUp])
}
