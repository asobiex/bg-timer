import { useState } from 'react'
import { Player, TimerMode } from '../../types'
import styles from './SetupScreen.module.css'

const PLAYER_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#e91e8c']

interface Props {
  onStart: (players: Player[], mode: TimerMode, turnSeconds: number) => void
}

export default function SetupScreen({ onStart }: Props) {
  const [mode, setMode] = useState<TimerMode>('turn')
  const [playerCount, setPlayerCount] = useState(4)
  const [names, setNames] = useState<string[]>(Array(8).fill(''))
  const [minutes, setMinutes] = useState(5)
  const [turnSec, setTurnSec] = useState(30)

  const handleStart = () => {
    const baseSeconds = mode === 'turn' ? turnSec : minutes * 60
    const players: Player[] = Array.from({ length: playerCount }, (_, i) => ({
      id: i,
      name: names[i].trim() || `プレイヤー ${i + 1}`,
      totalSeconds: baseSeconds,
      remainingSeconds: baseSeconds,
      isActive: i === 0,
      isEliminated: false,
    }))
    onStart(players, mode, turnSec)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>🎲 プレッシャータイマー</h1>
        <p className={styles.subtitle}>考えすぎを防ぐボードゲーム用タイマー</p>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>モード</label>
        <div className={styles.modeToggle}>
          <button
            className={`${styles.modeBtn} ${mode === 'turn' ? styles.modeBtnActive : ''}`}
            onClick={() => setMode('turn')}
          >
            <span className={styles.modeIcon}>⏱</span>
            <span className={styles.modeName}>ターン制</span>
            <span className={styles.modeDesc}>毎ターン同じ時間</span>
          </button>
          <button
            className={`${styles.modeBtn} ${mode === 'total' ? styles.modeBtnActive : ''}`}
            onClick={() => setMode('total')}
          >
            <span className={styles.modeIcon}>⏳</span>
            <span className={styles.modeName}>持ち時間制</span>
            <span className={styles.modeDesc}>全体の残り時間を管理</span>
          </button>
        </div>
      </div>

      {mode === 'turn' ? (
        <div className={styles.section}>
          <label className={styles.label}>1ターンの制限時間</label>
          <div className={styles.timeRow}>
            <button
              className={styles.timeBtn}
              onClick={() => setTurnSec(s => Math.max(5, s - 5))}
            >−</button>
            <div className={styles.timeValueBlock}>
              <span className={styles.timeValue}>{turnSec}</span>
              <span className={styles.timeUnit}>秒</span>
            </div>
            <button
              className={styles.timeBtn}
              onClick={() => setTurnSec(s => Math.min(300, s + 5))}
            >＋</button>
          </div>
          <div className={styles.timePresets}>
            {[10, 15, 20, 30, 45, 60, 90].map(s => (
              <button
                key={s}
                className={`${styles.presetBtn} ${turnSec === s ? styles.presetBtnActive : ''}`}
                onClick={() => setTurnSec(s)}
              >
                {s}秒
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.section}>
          <label className={styles.label}>持ち時間（分）</label>
          <div className={styles.timeRow}>
            <button
              className={styles.timeBtn}
              onClick={() => setMinutes(m => Math.max(1, m - 1))}
            >−</button>
            <div className={styles.timeValueBlock}>
              <span className={styles.timeValue}>{minutes}</span>
              <span className={styles.timeUnit}>分</span>
            </div>
            <button
              className={styles.timeBtn}
              onClick={() => setMinutes(m => Math.min(60, m + 1))}
            >＋</button>
          </div>
          <div className={styles.timePresets}>
            {[3, 5, 10, 15, 20].map(m => (
              <button
                key={m}
                className={`${styles.presetBtn} ${minutes === m ? styles.presetBtnActive : ''}`}
                onClick={() => setMinutes(m)}
              >
                {m}分
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.section}>
        <label className={styles.label}>プレイヤー人数</label>
        <div className={styles.countButtons}>
          {[2, 3, 4, 5, 6, 7, 8].map(n => (
            <button
              key={n}
              className={`${styles.countBtn} ${playerCount === n ? styles.countBtnActive : ''}`}
              onClick={() => setPlayerCount(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>プレイヤー名（省略可）</label>
        <div className={styles.playerList}>
          {Array.from({ length: playerCount }, (_, i) => (
            <div key={i} className={styles.playerRow}>
              <span className={styles.colorDot} style={{ background: PLAYER_COLORS[i] }} />
              <input
                className={styles.nameInput}
                type="text"
                placeholder={`プレイヤー ${i + 1}`}
                value={names[i]}
                maxLength={12}
                onChange={e => {
                  const next = [...names]
                  next[i] = e.target.value
                  setNames(next)
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <button className={styles.startBtn} onClick={handleStart}>
        ゲーム開始
      </button>
    </div>
  )
}
