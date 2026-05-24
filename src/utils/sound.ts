let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  return audioCtx
}

function playTone(frequency: number, duration: number, volume = 0.5, type: OscillatorType = 'sine') {
  try {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') ctx.resume()

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

    gainNode.gain.setValueAtTime(volume, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
  } catch {
    // audio not available
  }
}

export function playWarningBeep() {
  playTone(880, 0.15, 0.4, 'square')
}

export function playUrgentBeep() {
  playTone(1100, 0.1, 0.6, 'square')
  setTimeout(() => playTone(1100, 0.1, 0.6, 'square'), 180)
}

export function playCountdownBeep(seconds: number) {
  // 5→1で音程が上がる、1秒だけ二重ビープ
  const freqs: Record<number, number> = { 5: 700, 4: 800, 3: 900, 2: 1050, 1: 1320 }
  const freq = freqs[seconds] ?? 1000
  playTone(freq, 0.1, 0.7, 'square')
  if (seconds === 1) {
    setTimeout(() => playTone(1600, 0.12, 0.8, 'square'), 150)
  }
}

export function playTimeUpSound() {
  playTone(440, 0.2, 0.8, 'sawtooth')
  setTimeout(() => playTone(330, 0.2, 0.8, 'sawtooth'), 250)
  setTimeout(() => playTone(220, 0.4, 0.8, 'sawtooth'), 500)
}

export function playTurnStartSound() {
  playTone(660, 0.12, 0.4, 'sine')
  setTimeout(() => playTone(880, 0.15, 0.4, 'sine'), 150)
}
