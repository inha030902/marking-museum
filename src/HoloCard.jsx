import { useEffect, useRef } from 'react'
import Jersey from './Jersey.jsx'
import { mainColor } from './teams.js'

// 유니폼 카드. variant 'farewell'은 홀로그램 카드, 'burn'은 그을린 카드.
// 포인터를 따라 기울고 빛이 흐른다. idle이면 포인터가 없을 때 스스로 천천히 움직인다.
export default function HoloCard({ team, name, number, msg, date, outerRef, variant = 'farewell', idle = true }) {
  const hover = useRef(false)
  const local = useRef(null)
  const setRef = (el) => { local.current = el; if (outerRef) outerRef.current = el }

  const apply = (mx, my, o) => {
    const el = local.current
    if (!el) return
    el.style.setProperty('--mx', `${mx}%`)
    el.style.setProperty('--my', `${my}%`)
    el.style.setProperty('--ry', `${((mx - 50) / 50) * 17}deg`)
    el.style.setProperty('--rx', `${(-(my - 50) / 50) * 12}deg`)
    el.style.setProperty('--o', o)
  }

  useEffect(() => {
    if (!idle) { apply(50, 50, 0.3); return }
    let raf = 0
    const t0 = performance.now()
    const loop = (now) => {
      if (!hover.current) {
        const t = (now - t0) / 1000
        apply(50 + Math.sin(t * 0.9) * 34, 50 + Math.cos(t * 0.7) * 26, 0.8)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [idle])

  const onMove = (e) => {
    hover.current = true
    const r = e.currentTarget.getBoundingClientRect()
    apply(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)), Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100)), 1)
  }
  const onLeave = () => { hover.current = false; if (!idle) apply(50, 50, 0.3) }

  const ko = /[가-힣]/.test(name)
  const burned = variant === 'burn'
  return (
    <div className={`holo ${variant}`} ref={setRef} onPointerMove={onMove} onPointerLeave={onLeave} style={{ '--tc': mainColor(team.kit) }}>
      <div className="holo-inner">
        <div className="holo-bg" />
        <div className="holo-top"><span className="badge">{burned ? 'BURNED' : 'RETIRED'}</span><span>{team.en}</span></div>
        <div className="holo-jersey"><Jersey kit={team.kit} name={name} number={number} size={196} /></div>
        <div className="holo-bottom">
          <b className={ko ? 'ko' : ''}>{name}</b>
          <span>No.{number} · {team.name}</span>
          {msg && <em>“{msg}”</em>}
          <small>{date} · {burned ? 'BURNED TO ASH' : 'HALL OF FAME'}</small>
        </div>
        <div className="holo-shine" />
        <div className="holo-glare" />
        <div className="holo-frame" />
      </div>
    </div>
  )
}
