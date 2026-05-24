export function vibrateWarning() {
  navigator.vibrate?.([100, 50, 100])
}

export function vibrateUrgent() {
  navigator.vibrate?.([200, 100, 200, 100, 200])
}

export function vibrateTimeUp() {
  navigator.vibrate?.([500, 200, 500, 200, 500])
}

export function vibrateTurnStart() {
  navigator.vibrate?.(80)
}
