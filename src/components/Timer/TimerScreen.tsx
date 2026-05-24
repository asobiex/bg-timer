import { useState, useCallback, Dispatch, SetStateAction } from 'react'
import { GameState, Player } from '../../types'
import { useTimer } from '../../hooks/useTimer'
import { playTurnStartSound } from '../../utils/sound'
import { vibrateTurnStart } from '../../utils/vibration'
import TimerRing from './TimerRing'
import styles from './TimerScreen.module.css'

const PLAYER_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#e91e8c']

interface Props {
  state: GameState
  onStateChange: Dispatch<SetStateAction<GameState>>
  onReset: () => void
}

function findNextAlive(players: Player[], fromIdx: number): number {
  const n = players.length
  for (let i = 1; i <= n; i++) {
    const idx = (fromIdx + i) % n
    if (!players[idx].isEliminated) return idx
  }
  return fromIdx
}

export default function TimerScreen({ state, onStateChange, onReset }: Props) {
  const [showConfirmReset, setShowConfirmReset] = useState(false)
  const isTurn = state.mode === 'turn'

  const handleTick = useCallback((idx: number) => {
    onStateChange(prev => {
      const players = prev.players.map((p, i) =>
        i === idx ? { ...p, remainingSeconds: Math.max(0, p.remainingSeconds - 1) } : p
      )
      return { ...prev, players }
    })
  }, [onStateChange])

  const advanceToNext = useCallback((fromIdx: number) => {
    onStateChange(prev => {
      const nextIdx = findNextAlive(prev.players, fromIdx)
      const players = prev.players.map((p, i) => ({
        ...p,
        isActive: i === nextIdx,
        // ターン制は次のプレイヤーのタイマーをリセット
        remainingSeconds: (prev.mode === 'turn' && i === nextIdx)
          ? prev.turnSeconds
          : p.remainingSeconds,
        totalSeconds: (prev.mode === 'turn' && i === nextIdx)
          ? prev.turnSeconds
          : p.totalSeconds,
      }))
      playTurnStartSound()
      vibrateTurnStart()
      return {
        ...prev,
        players,
        activePlayerIndex: nextIdx,
        isPaused: false,
        roundCount: nextIdx <= fromIdx ? prev.roundCount + 1 : prev.roundCount,
      }
    })
  }, [onStateChange])

  const handleTimeUp = useCallback((idx: number) => {
    onStateChange(prev => {
      if (prev.mode === 'turn') {
        // ターン制: 自動で次へ（脱落なし）
        const nextIdx = findNextAlive(prev.players, idx)
        const players = prev.players.map((p, i) => ({
          ...p,
          isActive: i === nextIdx,
          remainingSeconds: i === nextIdx ? prev.turnSeconds : p.remainingSeconds,
          totalSeconds: i === nextIdx ? prev.turnSeconds : p.totalSeconds,
        }))
        playTurnStartSound()
        vibrateTurnStart()
        return {
          ...prev,
          players,
          activePlayerIndex: nextIdx,
          isPaused: false,
          roundCount: nextIdx <= idx ? prev.roundCount + 1 : prev.roundCount,
        }
      }

      // 持ち時間制: 時間切れで脱落
      const players = prev.players.map((p, i) =>
        i === idx ? { ...p, isEliminated: true, remainingSeconds: 0 } : p
      )
      const alive = players.filter(p => !p.isEliminated)
      if (alive.length <= 1) {
        return { ...prev, players, phase: 'result' }
      }
      const nextIdx = findNextAlive(players, idx)
      return { ...prev, players, activePlayerIndex: nextIdx, isPaused: true }
    })
  }, [onStateChange])

  useTimer(state, handleTick, handleTimeUp)

  const handlePassTurn = () => {
    advanceToNext(state.activePlayerIndex)
  }

  const handleTogglePause = () => {
    onStateChange(prev => ({ ...prev, isPaused: !prev.isPaused }))
  }

  const activePlayer = state.players[state.activePlayerIndex]
  const aliveCount = state.players.filter(p => !p.isEliminated).length

  if (state.phase === 'result') {
    const survivors = state.players.filter(p => !p.isEliminated)
    return (
      <div className={styles.resultScreen}>
        <div className={styles.resultContent}>
          <div className={styles.resultEmoji}>⏱️</div>
          <h2 className={styles.resultTitle}>時間切れ！</h2>
          {survivors.length > 0 && (
            <p className={styles.resultSurvivor}>
              残り: {survivors.map(p => p.name).join('、')}
            </p>
          )}
          <div className={styles.resultList}>
            {state.players.map((p, i) => (
              <div key={p.id} className={`${styles.resultRow} ${p.isEliminated ? styles.eliminated : ''}`}>
                <span className={styles.resultDot} style={{ background: PLAYER_COLORS[i] }} />
                <span className={styles.resultName}>{p.name}</span>
                <span className={styles.resultTime}>
                  {p.isEliminated ? '時間切れ' : formatTime(p.remainingSeconds)}
                </span>
              </div>
            ))}
          </div>
          <button className={styles.resetBtn} onClick={onReset}>もう一度</button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <span className={styles.round}>ラウンド {state.roundCount}</span>
          {isTurn && (
            <span className={styles.modePill}>ターン制 · {state.turnSeconds}秒</span>
          )}
        </div>
        <button className={styles.menuBtn} onClick={() => setShowConfirmReset(true)}>✕</button>
      </div>

      <div className={styles.activeSection}>
        <div
          className={styles.activeBadge}
          style={{
            background: PLAYER_COLORS[state.activePlayerIndex] + '22',
            borderColor: PLAYER_COLORS[state.activePlayerIndex],
          }}
        >
          <span className={styles.activeDot} style={{ background: PLAYER_COLORS[state.activePlayerIndex] }} />
          <span className={styles.activeName}>{activePlayer?.name}</span>
          {state.isPaused && <span className={styles.pauseLabel}>一時停止中</span>}
        </div>

        <TimerRing
          remaining={activePlayer?.remainingSeconds ?? 0}
          total={activePlayer?.totalSeconds ?? 1}
          size={200}
          isActive={!state.isPaused}
        />
      </div>

      <div className={isTurn ? styles.waitingList : styles.grid}>
        {state.players.map((p, i) => {
          if (i === state.activePlayerIndex) return null
          return isTurn ? (
            <div
              key={p.id}
              className={styles.waitingCard}
              style={{ borderColor: PLAYER_COLORS[i] + '44' }}
            >
              <span className={styles.waitingDot} style={{ background: PLAYER_COLORS[i] }} />
              <span className={styles.waitingName}>{p.name}</span>
              <span className={styles.waitingLabel}>待機中</span>
            </div>
          ) : (
            <div
              key={p.id}
              className={`${styles.playerCard} ${p.isEliminated ? styles.playerCardEliminated : ''}`}
            >
              <span className={styles.cardDot} style={{ background: p.isEliminated ? '#333' : PLAYER_COLORS[i] }} />
              <span className={styles.cardName}>{p.name}</span>
              <TimerRing
                remaining={p.remainingSeconds}
                total={p.totalSeconds}
                size={80}
                isActive={false}
              />
            </div>
          )
        })}
      </div>

      <div className={styles.controls}>
        <button className={styles.pauseBtn} onClick={handleTogglePause}>
          {state.isPaused ? '▶ 再開' : '⏸ 停止'}
        </button>
        <button
          className={styles.passBtn}
          onClick={handlePassTurn}
          disabled={aliveCount <= 1}
        >
          {isTurn ? 'パス →' : '次へ →'}
        </button>
      </div>

      {showConfirmReset && (
        <div className={styles.overlay} onClick={() => setShowConfirmReset(false)}>
          <div className={styles.dialog} onClick={e => e.stopPropagation()}>
            <p className={styles.dialogText}>ゲームをリセットしますか？</p>
            <div className={styles.dialogBtns}>
              <button className={styles.dialogCancel} onClick={() => setShowConfirmReset(false)}>
                キャンセル
              </button>
              <button className={styles.dialogConfirm} onClick={onReset}>
                リセット
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function formatTime(s: number): string {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}
