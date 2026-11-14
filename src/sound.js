// 효과음. 파일 없이 Web Audio로 직접 합성한다. 소리는 항상 사용자의 클릭/입력 뒤에만 난다.
let ctx = null
let master = null
let muted = false
let noiseBuf = null

function ac() {
  if (muted) return null
  try {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext
      if (!C) return null
      ctx = new C()
      master = ctx.createGain()
      master.gain.value = 0.55
      master.connect(ctx.destination)
    }
    if (ctx.state === 'suspended') ctx.resume()
    return ctx
  } catch { return null }
}

export function setMuted(m) {
  muted = m
  if (master) master.gain.value = m ? 0 : 0.55
}

function noise(c) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  const s = c.createBufferSource()
  s.buffer = noiseBuf
  s.loop = true
  return s
}

function env(g, t, attack, peak, decay) {
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(peak, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay)
}

function tone(c, { type = 'sine', f0, f1, t, attack = 0.005, peak = 0.2, decay = 0.2 }) {
  const o = c.createOscillator(), g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(f0, t)
  if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + attack + decay)
  env(g, t, attack, peak, decay)
  o.connect(g).connect(master)
  o.start(t); o.stop(t + attack + decay + 0.05)
}

function burst(c, { t, type = 'bandpass', f0, f1, q = 1, attack = 0.005, peak = 0.3, decay = 0.2 }) {
  const s = noise(c), f = c.createBiquadFilter(), g = c.createGain()
  f.type = type; f.Q.value = q
  f.frequency.setValueAtTime(f0, t)
  if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + attack + decay)
  env(g, t, attack, peak, decay)
  s.connect(f).connect(g).connect(master)
  s.start(t, Math.random()); s.stop(t + attack + decay + 0.05)
}

// 타이핑: 짧은 딸깍
export function tick() {
  const c = ac(); if (!c) return
  tone(c, { type: 'square', f0: 1500 + Math.random() * 500, t: c.currentTime, peak: 0.035, decay: 0.035 })
}

// 팀 선택: 천이 휙 넘어가는 소리
export function swish() {
  const c = ac(); if (!c) return
  const t = c.currentTime
  burst(c, { t, f0: 500, f1: 3200, q: 0.8, attack: 0.03, peak: 0.22, decay: 0.2 })
  tone(c, { f0: 260, f1: 520, t, peak: 0.07, decay: 0.14 })
}

// 묵직한 쿵
export function thud() {
  const c = ac(); if (!c) return
  const t = c.currentTime
  tone(c, { f0: 130, f1: 38, t, attack: 0.004, peak: 0.9, decay: 0.42 })
  burst(c, { t, type: 'lowpass', f0: 420, f1: 80, attack: 0.003, peak: 0.5, decay: 0.16 })
}

// 점점 차오르는 긴장감
export function riser(dur) {
  const c = ac(); if (!c) return
  const t = c.currentTime
  const s = noise(c), f = c.createBiquadFilter(), g = c.createGain()
  f.type = 'bandpass'; f.Q.value = 1.4
  f.frequency.setValueAtTime(260, t); f.frequency.exponentialRampToValueAtTime(5200, t + dur)
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.3, t + dur); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.12)
  s.connect(f).connect(g).connect(master)
  s.start(t); s.stop(t + dur + 0.2)
  const o = c.createOscillator(), og = c.createGain()
  o.type = 'sawtooth'; o.frequency.setValueAtTime(82, t); o.frequency.exponentialRampToValueAtTime(330, t + dur)
  og.gain.setValueAtTime(0.0001, t); og.gain.exponentialRampToValueAtTime(0.07, t + dur); og.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.1)
  o.connect(og).connect(master)
  o.start(t); o.stop(t + dur + 0.2)
}

// 공개 순간: 화음 + 반짝임 + 박수 같은 잔향
export function fanfare() {
  const c = ac(); if (!c) return
  const t = c.currentTime
  tone(c, { f0: 110, f1: 40, t, peak: 0.9, decay: 0.7 })
  ;[261.63, 329.63, 392.0, 523.25, 659.25, 783.99].forEach((f, i) => {
    tone(c, { type: 'triangle', f0: f, t: t + i * 0.055, attack: 0.02, peak: 0.13, decay: 2.4 })
    tone(c, { type: 'sine', f0: f * 2, t: t + i * 0.055, attack: 0.02, peak: 0.04, decay: 1.6 })
  })
  for (let i = 0; i < 14; i++) tone(c, { f0: 1800 + Math.random() * 3200, t: t + 0.1 + Math.random() * 1.6, peak: 0.05, decay: 0.25 })
  burst(c, { t: t + 0.05, type: 'highpass', f0: 1800, attack: 0.25, peak: 0.16, decay: 2.6 })
}

// 불: 점화 + 낮은 울림 + 타닥타닥
export function fire(dur) {
  const c = ac(); if (!c) return
  const t = c.currentTime
  burst(c, { t, f0: 300, f1: 3600, q: 0.7, attack: 0.08, peak: 0.6, decay: 0.55 })
  tone(c, { f0: 90, f1: 45, t, peak: 0.5, decay: 0.5 })
  const s = noise(c), f = c.createBiquadFilter(), g = c.createGain()
  f.type = 'lowpass'; f.frequency.value = 760
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.42, t + 0.5)
  g.gain.setValueAtTime(0.42, t + dur); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 1.4)
  s.connect(f).connect(g).connect(master)
  s.start(t); s.stop(t + dur + 1.5)
  const pops = Math.round(dur * 16)
  for (let i = 0; i < pops; i++) {
    burst(c, { t: t + 0.15 + Math.random() * (dur + 0.5), type: 'highpass', f0: 1800 + Math.random() * 2600, attack: 0.002, peak: 0.1 + Math.random() * 0.4, decay: 0.015 + Math.random() * 0.03 })
  }
}

// 직접 토치 문지르기: 짧은 불꽃 지직거림
export function flameBrush(intensity = 0.5) {
  const c = ac(); if (!c) return
  const t = c.currentTime
  burst(c, { t, type: 'bandpass', f0: 700 + intensity * 1200, f1: 2600, q: 0.9, attack: 0.005, peak: 0.14 + intensity * 0.12, decay: 0.1 })
}

// 소각로 화력 연타: 묵직한 철문 타격 + 치솟는 화력음
export function furnaceHit(tempRatio = 0.5) {
  const c = ac(); if (!c) return
  const t = c.currentTime
  tone(c, { type: 'sawtooth', f0: 75 + tempRatio * 140, f1: 48, t, attack: 0.004, peak: 0.32, decay: 0.24 })
  burst(c, { t, type: 'bandpass', f0: 450 + tempRatio * 1600, f1: 300, q: 1.2, attack: 0.003, peak: 0.35, decay: 0.14 })
}

// 액자 손질/볼트 조이기: 맑은 황금빛 반짝임
export function polishBrush() {
  const c = ac(); if (!c) return
  const t = c.currentTime
  const base = 1300 + Math.random() * 900
  tone(c, { type: 'sine', f0: base, f1: base * 1.35, t, attack: 0.01, peak: 0.08, decay: 0.18 })
}

// 아세톤 헤라 마킹 박리: 비닐 벗겨지는 사각사각 소리
export function scrapePeel() {
  const c = ac(); if (!c) return
  const t = c.currentTime
  burst(c, { t, type: 'bandpass', f0: 2100 + Math.random() * 900, f1: 4200, q: 2.2, attack: 0.004, peak: 0.18, decay: 0.07 })
}

// 청테이프 붙이기: 좍 찢고 탁 붙이는 소리
export function tapeSlap() {
  const c = ac(); if (!c) return
  const t = c.currentTime
  burst(c, { t, type: 'highpass', f0: 1900, f1: 3800, attack: 0.005, peak: 0.28, decay: 0.12 })
  tone(c, { type: 'triangle', f0: 160, f1: 60, t: t + 0.08, attack: 0.003, peak: 0.45, decay: 0.12 })
}

// 헌옷수거함 +300원 정산 차임
export function coinChime() {
  const c = ac(); if (!c) return
  const t = c.currentTime
  tone(c, { type: 'sine', f0: 987.77, t, attack: 0.005, peak: 0.18, decay: 0.12 })
  tone(c, { type: 'sine', f0: 1318.51, t: t + 0.09, attack: 0.005, peak: 0.22, decay: 0.45 })
}
