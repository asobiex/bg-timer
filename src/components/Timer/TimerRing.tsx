import styles from './TimerRing.module.css'

interface Props {
  remaining: number
  total: number
  size?: number
  isActive: boolean
}

function getColor(pct: number): string {
  if (pct > 0.5) return '#2ecc71'
  if (pct > 0.25) return '#f39c12'
  if (pct > 0.1) return '#e67e22'
  return '#e74c3c'
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function TimerRing({ remaining, total, size = 140, isActive }: Props) {
  const pct = total > 0 ? Math.max(0, remaining / total) : 0
  const color = getColor(pct)
  const isUrgent = pct <= 0.1 && remaining > 0
  const isCountdown = isActive && remaining <= 5 && remaining > 0

  const stroke = 10
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - pct)

  return (
    <div className={`${styles.wrapper} ${isUrgent && isActive ? styles.pulse : ''}`}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1e1e30"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.5s' }}
        />
      </svg>
      <div className={styles.center}>
        {isCountdown ? (
          <span
            key={remaining}
            className={styles.countdown}
            style={{ color, fontSize: size * 0.38 }}
          >
            {remaining}
          </span>
        ) : (
          <span className={styles.time} style={{ color: isActive ? color : '#555' }}>
            {formatTime(remaining)}
          </span>
        )}
      </div>
    </div>
  )
}
