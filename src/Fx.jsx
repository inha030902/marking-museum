import { useEffect, useRef } from 'react'

// 캔버스 파티클 효과. mode: 'burn'(불꽃·불씨·연기·재) | 'incinerate'(용광로 불티·열기) | 'farewell'(금빛 반짝임·꽃가루) | 'recycle'(마킹 조각·친환경 스파클)
// getRect(): 유니폼의 화면 위치, progressRef.current: 0~1 진행도, pointerRef?.current: { x, y, active }
const rand = (a, b) => a + Math.random() * (b - a)

export default function Fx({ mode, getRect, progressRef, pointerRef, colors = [] }) {
  const ref = useRef(null)

  useEffect(() => {
    const cv = ref.current
    if (!mode || !cv) return
    const ctx = cv.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let W = 0, H = 0
    const resize = () => {
      const r = cv.getBoundingClientRect()
      W = r.width; H = r.height
      cv.width = W * dpr; cv.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    let parts = []
    let raf = 0
    let last = performance.now()
    const confetti = ['#f5d98a', '#ffffff', '#c9a96e', ...colors]
    const vinylColors = ['#ffffff', '#e2e8f0', ...colors.filter(Boolean)]

    let puffed = false
    const spawnBurn = (r, p, dt, ptr) => {
      if (p >= 1 && !puffed) {
        puffed = true
        for (let i = 0; i < 65; i++) parts.push({ t: 'e', x: r.x + rand(0.1, 0.9) * r.w, y: r.y + rand(0, 0.25) * r.h, vx: rand(-3.8, 3.8), vy: rand(-8.5, -2), life: 0, max: rand(80, 170), s: rand(1.2, 3.4) })
        for (let i = 0; i < 18; i++) parts.push({ t: 's', x: r.x + rand(0.1, 0.9) * r.w, y: r.y + rand(0, 0.25) * r.h, vx: rand(-0.8, 0.8), vy: rand(-2.2, -0.8), life: 0, max: rand(110, 190), s: rand(40, 80) })
      }
      if (ptr?.active && p < 1) {
        const px = ptr.x, py = ptr.y
        for (let i = 0; i < 5; i++) {
          parts.push({ t: 'f', x: px + rand(-18, 18), y: py + rand(-12, 12), vx: rand(-1.2, 1.2), vy: rand(-5.5, -2), life: 0, max: rand(24, 50), s: rand(10, 26) })
        }
        if (Math.random() < 0.7) parts.push({ t: 'e', x: px + rand(-14, 14), y: py, vx: rand(-2.2, 2.2), vy: rand(-5, -1.5), life: 0, max: rand(50, 110), s: rand(1.4, 3.2) })
      }
      if (p <= 0.001 || p >= 1) return
      const y = r.y + r.h * (1 - p)
      const inSleeve = p > 0.62
      const x0 = r.x + r.w * (inSleeve ? 0.04 : 0.22), x1 = r.x + r.w * (inSleeve ? 0.96 : 0.78)
      const n = Math.round(11 * dt)
      for (let i = 0; i < n; i++) {
        parts.push({ t: 'f', x: rand(x0, x1), y: y + rand(-6, 12), vx: rand(-0.7, 0.7), vy: rand(-5.2, -1.6), life: 0, max: rand(30, 62), s: rand(12, 30) })
      }
      if (Math.random() < 0.8 * dt) parts.push({ t: 'e', x: rand(x0, x1), y, vx: rand(-1.8, 1.8), vy: rand(-6, -2), life: 0, max: rand(70, 150), s: rand(1.2, 3) })
      if (Math.random() < 0.45 * dt) parts.push({ t: 's', x: rand(x0, x1), y: y - 40, vx: rand(-0.4, 0.4), vy: rand(-1.6, -0.7), life: 0, max: rand(90, 150), s: rand(28, 60) })
      if (Math.random() < 0.6 * dt) parts.push({ t: 'a', x: rand(x0, x1), y: y + 4, vx: rand(-0.6, 0.6), vy: rand(0.4, 1.6), life: 0, max: rand(120, 200), s: rand(1.5, 4), rot: rand(0, 6) })
    }

    const spawnIncinerate = (r, p, dt, ptr) => {
      const baseRate = 0.35 + p * 1.4
      if (Math.random() < baseRate * dt) {
        parts.push({ t: 'f', x: r.x + rand(0.1, 0.9) * r.w, y: r.y + r.h * rand(0.75, 1.05), vx: rand(-1.5, 1.5), vy: rand(-7.5, -3.2), life: 0, max: rand(34, 68), s: rand(14, 34) })
      }
      if (Math.random() < (0.6 + p * 1.5) * dt) {
        parts.push({ t: 'e', x: r.x + rand(0.05, 0.95) * r.w, y: r.y + r.h * rand(0.3, 1.0), vx: rand(-3.5, 3.5), vy: rand(-9, -3), life: 0, max: rand(60, 130), s: rand(1.5, 4) })
      }
      if (ptr?.burst) {
        ptr.burst = false
        const bx = ptr.x || (r.x + r.w / 2), by = ptr.y || (r.y + r.h * 0.65)
        for (let i = 0; i < 28; i++) {
          const ang = rand(0, 6.283), sp = rand(3, 12)
          parts.push({ t: 'e', x: bx, y: by, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 2.5, life: 0, max: rand(40, 95), s: rand(2, 4.5) })
        }
        for (let i = 0; i < 10; i++) {
          parts.push({ t: 'f', x: bx + rand(-35, 35), y: by + rand(-20, 20), vx: rand(-2, 2), vy: rand(-8, -3), life: 0, max: rand(28, 52), s: rand(16, 36) })
        }
      }
      if (p >= 1 && !puffed) {
        puffed = true
        for (let i = 0; i < 75; i++) parts.push({ t: 'e', x: r.x + rand(0, 1) * r.w, y: r.y + rand(0.2, 0.9) * r.h, vx: rand(-5, 5), vy: rand(-11, -3), life: 0, max: rand(90, 180), s: rand(1.6, 4.2) })
      }
    }

    let burstAt = 0
    const pick = () => confetti[Math.floor(Math.random() * confetti.length)]
    const spawnFarewell = (r, now, dt, p, ptr) => {
      if (ptr?.active && p < 1) {
        for (let i = 0; i < 3; i++) {
          parts.push({ t: 'g', x: ptr.x + rand(-22, 22), y: ptr.y + rand(-22, 22), vx: rand(-0.9, 0.9), vy: rand(-2.2, 0.2), life: 0, max: rand(36, 75), s: rand(1.5, 3.4), ph: rand(0, 6) })
        }
      }
      if (Math.random() < 0.55 * dt) parts.push({ t: 'g', x: rand(0, W), y: rand(H * 0.25, H), vx: rand(-0.3, 0.3), vy: rand(-1.5, -0.3), life: 0, max: rand(60, 130), s: rand(1, 2.6), ph: rand(0, 6) })
      if (p >= 1 && !burstAt) {
        burstAt = now
        const cx = r.x + r.w / 2, cy = r.y + r.h / 2
        for (let i = 0; i < 190; i++) {
          const ang = rand(0, 6.283), sp = rand(5, 21)
          parts.push({ t: 'c', x: cx, y: cy, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 4, g: 0.24, drag: 0.955, life: 0, max: rand(170, 320), w: rand(6, 13), h: rand(3, 7), rot: rand(0, 6), vr: rand(-0.3, 0.3), col: pick(), ph: rand(0, 6) })
        }
        for (let i = 0; i < 70; i++) parts.push({ t: 'g', x: r.x + rand(-0.3, 1.3) * r.w, y: r.y + rand(-0.1, 1.1) * r.h, vx: rand(-1.2, 1.2), vy: rand(-2.4, 0.4), life: 0, max: rand(50, 120), s: rand(1.4, 3.6), ph: rand(0, 6) })
      }
      if (burstAt && now - burstAt < 3600 && Math.random() < 1.2 * dt) {
        parts.push({ t: 'c', x: rand(0, W), y: -12, vx: rand(-1, 1), vy: rand(1.4, 3.4), life: 0, max: 420, w: rand(6, 11), h: rand(3, 6), rot: rand(0, 6), vr: rand(-0.2, 0.2), col: pick(), ph: rand(0, 6) })
      }
    }

    const spawnRecycle = (r, p, dt, ptr) => {
      if (ptr?.active && p < 1) {
        for (let i = 0; i < 3; i++) {
          const col = vinylColors[Math.floor(Math.random() * vinylColors.length)]
          parts.push({ t: 'c', x: ptr.x + rand(-18, 18), y: ptr.y + rand(-14, 14), vx: rand(-3.4, 3.4), vy: rand(-4.5, -0.5), g: 0.18, drag: 0.97, life: 0, max: rand(55, 110), w: rand(5, 11), h: rand(4, 8), rot: rand(0, 6), vr: rand(-0.35, 0.35), col, ph: rand(0, 6) })
        }
      }
      if (p >= 1 && !puffed) {
        puffed = true
        const cx = r.x + r.w / 2, cy = r.y + r.h / 2
        for (let i = 0; i < 90; i++) {
          const ang = rand(0, 6.283), sp = rand(4, 14)
          parts.push({ t: 'c', x: cx, y: cy, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 3, g: 0.2, drag: 0.96, life: 0, max: rand(110, 200), w: rand(6, 12), h: rand(4, 8), rot: rand(0, 6), vr: rand(-0.25, 0.25), col: i % 2 === 0 ? '#4ade80' : '#bbf7d0', ph: rand(0, 6) })
        }
      }
    }

    const loop = (now) => {
      const dt = Math.min(2.5, (now - last) / 16.67)
      last = now
      const cr = cv.getBoundingClientRect()
      const jr = getRect()
      const r = jr ? { x: jr.left - cr.left, y: jr.top - cr.top, w: jr.width, h: jr.height } : { x: W / 2 - 100, y: H / 2 - 100, w: 200, h: 220 }
      const p = progressRef.current || 0
      const ptr = pointerRef?.current
      ctx.clearRect(0, 0, W, H)
      if (mode === 'burn') spawnBurn(r, p, dt, ptr)
      else if (mode === 'incinerate') spawnIncinerate(r, p, dt, ptr)
      else if (mode === 'recycle') spawnRecycle(r, p, dt, ptr)
      else spawnFarewell(r, now, dt, p, ptr)

      const next = []
      for (const q of parts) {
        q.life += dt
        if (q.life >= q.max || q.y > H + 30) continue
        const k = q.life / q.max
        q.x += q.vx * dt; q.y += q.vy * dt
        if (q.t === 'f') {
          q.vx += rand(-0.08, 0.08) * dt; q.vy -= 0.03 * dt
          const rad = Math.max(1, q.s * (1 - k * 0.75))
          const a = (1 - k) * 0.6
          // 위로 길게 늘인 불꽃 혀
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rad)
          const c = k < 0.22 ? '255,236,170' : k < 0.55 ? '255,150,40' : '210,48,12'
          g.addColorStop(0, `rgba(${c},${a})`); g.addColorStop(1, `rgba(${c},0)`)
          ctx.globalCompositeOperation = 'lighter'
          ctx.fillStyle = g
          ctx.save(); ctx.translate(q.x, q.y); ctx.scale(0.8, 1.9)
          ctx.beginPath(); ctx.arc(0, 0, rad, 0, 6.283); ctx.fill()
          ctx.restore()
        } else if (q.t === 'e') {
          q.vy += 0.035 * dt; q.vx += rand(-0.15, 0.15) * dt
          ctx.globalCompositeOperation = 'lighter'
          ctx.fillStyle = `rgba(255,${180 - k * 110},60,${1 - k})`
          ctx.beginPath(); ctx.arc(q.x, q.y, q.s * (1 - k * 0.5), 0, 6.283); ctx.fill()
        } else if (q.t === 's') {
          const rad = q.s * (0.6 + k)
          const g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, rad)
          const a = Math.sin(k * 3.14) * 0.16
          g.addColorStop(0, `rgba(70,62,58,${a})`); g.addColorStop(1, 'rgba(70,62,58,0)')
          ctx.globalCompositeOperation = 'source-over'
          ctx.fillStyle = g
          ctx.beginPath(); ctx.arc(q.x, q.y, rad, 0, 6.283); ctx.fill()
        } else if (q.t === 'a') {
          q.vx += Math.sin(q.life * 0.08 + q.rot) * 0.03 * dt
          ctx.globalCompositeOperation = 'source-over'
          ctx.fillStyle = `rgba(${k < 0.15 ? '255,120,40' : '58,52,50'},${1 - k * 0.6})`
          ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot + q.life * 0.05)
          ctx.fillRect(-q.s, -q.s / 2, q.s * 2, q.s); ctx.restore()
        } else if (q.t === 'g') {
          const a = Math.sin(k * 3.14) * (0.55 + 0.45 * Math.sin(q.life * 0.4 + q.ph))
          ctx.globalCompositeOperation = 'lighter'
          ctx.fillStyle = `rgba(255,226,150,${Math.max(0, a)})`
          ctx.beginPath(); ctx.arc(q.x, q.y, q.s, 0, 6.283); ctx.fill()
          ctx.fillStyle = `rgba(255,226,150,${Math.max(0, a) * 0.25})`
          ctx.beginPath(); ctx.arc(q.x, q.y, q.s * 3.2, 0, 6.283); ctx.fill()
        } else if (q.t === 'c') {
          q.rot += q.vr * dt
          if (q.g) { const d = Math.pow(q.drag, dt); q.vy += q.g * dt; q.vx *= d; q.vy *= d }
          else q.vx += Math.sin(q.life * 0.05 + q.ph) * 0.04 * dt
          ctx.globalCompositeOperation = 'source-over'
          ctx.globalAlpha = Math.min(1, (1 - k) * 3)
          ctx.fillStyle = q.col
          ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot); ctx.scale(1, Math.cos(q.life * 0.12 + q.ph))
          ctx.fillRect(-q.w / 2, -q.h / 2, q.w, q.h); ctx.restore()
          ctx.globalAlpha = 1
        }
        next.push(q)
      }
      parts = next
      ctx.globalCompositeOperation = 'source-over'
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); ctx.clearRect(0, 0, W, H) }
  }, [mode]) // eslint-disable-line react-hooks/exhaustive-deps

  return <canvas ref={ref} className="fx" aria-hidden="true" />
}
