import { useEffect, useMemo, useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import Jersey from './Jersey.jsx'
import Fx from './Fx.jsx'
import HoloCard from './HoloCard.jsx'
import Gallery from './Gallery.jsx'
import { addToCollection, clearCollection, loadCollection } from './collection.js'
import { LEAGUES, REASONS, SCENARIOS, mainColor, teamById } from './teams.js'
import { getStats, recordRitual } from './api.js'
import * as sfx from './sound.js'

const EXAMPLES = [['RUNAWAY', '11'], ['CAPTAIN', '4'], ['LEGEND', '10'], ['TRAITOR', '9'], ['MY HERO', '7']]

const MODE_META = {
  burn: { kicker: 'CERTIFICATE OF CREMATION', title: '화형 집행 증명서', stamp: '소각 완료', label: '🔥 태우기' },
  incinerate: { kicker: 'INDUSTRIAL INCINERATION RECEIPT', title: '초고열 소각 확인서', stamp: '1,800°C 폐기', label: '🏭 소각로' },
  farewell: { kicker: 'HALL OF FAME ENSHRINEMENT', title: '명예의 전당 헌액서', stamp: '영구 봉인', label: '🖼️ 액자 봉인' },
  recycle: { kicker: 'UPCYCLING & SCRAP RECEIPT', title: '분리수거 · 리폼 정산서', stamp: '성불 정산', label: '♻️ 분리수거' },
}

export default function App() {
  const [teamId, setTeamId] = useState('')
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [msg, setMsg] = useState('')
  const [reason, setReason] = useState('betrayal')
  const [price, setPrice] = useState('149000')
  const [phase, setPhase] = useState('edit') // edit | burn | incinerate | farewell | recycle | done
  const [result, setResult] = useState('') // burn | incinerate | farewell | recycle
  const [ritualPct, setRitualPct] = useState(0)
  const [step, setStep] = useState(0) // 보내주기 연출 단계: 0 조작중 → 1 구단 → 2 등번호 → 3 이름 → 4 공개
  const [tapeInput, setTapeInput] = useState('우리 유망주')
  const [tapeName, setTapeName] = useState('')
  const [recycleSub, setRecycleSub] = useState('') // 'tape' | 'bin'
  const [hover, setHover] = useState('')
  const [stats, setStats] = useState({})
  const [note, setNote] = useState('')
  const [muted, setMuted] = useState(false)
  const [leagueId, setLeagueId] = useState('epl')
  const league = LEAGUES.find((l) => l.id === leagueId) || LEAGUES[0]
  const [view, setView] = useState('make') // make | gallery
  const [items, setItems] = useState(loadCollection)

  const team = teamById(teamId)
  const stageRef = useRef(null)
  const clothRef = useRef(null)
  const tiltRef = useRef(null)
  const certRef = useRef(null)
  const holoRef = useRef(null)
  const progressRef = useRef(0)
  const pointerRef = useRef({ x: 0, y: 0, active: false, burst: false })
  const lastSoundRef = useRef(0)
  const finishingRef = useRef(false)
  const timers = useRef([])
  const rafRef = useRef(0)

  useEffect(() => { getStats().then(setStats).catch(() => {}) }, [])
  useEffect(() => () => {
    timers.current.forEach(clearTimeout)
    cancelAnimationFrame(rafRef.current)
  }, [])

  const ready = !!team && name.trim().length > 0 && /^\d{1,2}$/.test(number)
  const NAME = name.trim().toUpperCase()
  const MSG = msg.trim()
  const parsedPrice = Math.max(0, Number(String(price).replace(/\D/g, '')) || 149000)
  const tc = team ? mainColor(team.kit) : '#e3c583'
  const fxColors = useMemo(() => (team ? [team.kit.body, team.kit.sleeve, mainColor(team.kit)] : []), [team])
  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })

  const resetStageStyles = () => {
    const el = clothRef.current?.parentElement
    el?.style.removeProperty('--burn')
    el?.style.removeProperty('--glow')
  }

  const updateBurnVars = (p) => {
    const el = clothRef.current?.parentElement
    if (el) {
      el.style.setProperty('--burn', p.toFixed(4))
      el.style.setProperty('--glow', Math.sin(Math.PI * p).toFixed(3))
    }
  }

  const later = (ms, fn) => timers.current.push(setTimeout(fn, ms))

  const onMove = (e) => {
    if (phase === 'edit' && tiltRef.current) {
      const r = e.currentTarget.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      tiltRef.current.style.setProperty('--ry', `${x * 28}deg`)
      tiltRef.current.style.setProperty('--rx', `${-y * 14}deg`)
      return
    }
    if (!stageRef.current || finishingRef.current) return
    const sr = stageRef.current.getBoundingClientRect()
    pointerRef.current.x = e.clientX - sr.left
    pointerRef.current.y = e.clientY - sr.top

    if (pointerRef.current.active && (phase === 'burn' || phase === 'farewell' || phase === 'recycle')) {
      advanceInteractive(phase === 'recycle' ? 2.4 : 2.8)
    }
  }

  const resetTilt = () => {
    tiltRef.current?.style.setProperty('--ry', '0deg')
    tiltRef.current?.style.setProperty('--rx', '0deg')
    pointerRef.current.active = false
  }

  const pickTeam = (id) => { if (id !== teamId) { setTeamId(id); sfx.swish() } }
  const typeName = (v) => { setName(v); sfx.tick() }
  const typeNumber = (v) => { setNumber(v.replace(/\D/g, '')); sfx.tick() }

  const applyScenario = (sc) => {
    setLeagueId(sc.leagueId)
    setTeamId(sc.teamId)
    setName(sc.name)
    setNumber(sc.number)
    setPrice(String(sc.price))
    setReason(sc.reason)
    setMsg(sc.msg)
    sfx.swish()
  }

  const completeRitual = (type, finalTapeName = '', finalSub = '') => {
    if (finishingRef.current) return
    finishingRef.current = true
    cancelAnimationFrame(rafRef.current)
    pointerRef.current.active = false
    progressRef.current = 1
    setRitualPct(100)

    if (type === 'burn' || type === 'incinerate') {
      updateBurnVars(1)
      sfx.thud()
      later(700, () => {
        setItems(addToCollection({ teamId, name: NAME, number, msg: MSG, type, price: parsedPrice, reason }))
        setPhase('done')
        finishingRef.current = false
      })
      return
    }

    if (type === 'recycle') {
      const sub = finalSub || 'bin'
      setRecycleSub(sub)
      if (sub === 'tape') {
        const applied = (finalTapeName || tapeInput || '우리 유망주').trim().toUpperCase().slice(0, 12)
        setTapeName(applied)
        sfx.tapeSlap()
        later(550, () => {
          setItems(addToCollection({ teamId, name: NAME, number, msg: MSG, type, price: parsedPrice, reason, tapeName: applied }))
          setPhase('done')
          finishingRef.current = false
        })
      } else {
        sfx.coinChime()
        later(550, () => {
          setItems(addToCollection({ teamId, name: NAME, number, msg: MSG, type, price: parsedPrice, reason, tapeName: '' }))
          setPhase('done')
          finishingRef.current = false
        })
      }
      return
    }

    // farewell: 4단계 극적 헌액 연출
    sfx.thud()
    sfx.riser(3.2)
    later(650, () => { setStep(1); sfx.thud() })
    later(1450, () => { setStep(2); sfx.thud() })
    later(2250, () => { setStep(3); sfx.thud() })
    later(3150, () => { setStep(4); sfx.fanfare() })
    later(4700, () => {
      setItems(addToCollection({ teamId, name: NAME, number, msg: MSG, type: 'farewell', price: parsedPrice, reason }))
      setPhase('done')
      finishingRef.current = false
    })
  }

  const advanceInteractive = (delta) => {
    if (finishingRef.current) return
    const now = performance.now()
    setRitualPct((prev) => {
      const cap = phase === 'recycle' ? 92 : 100
      const next = Math.min(cap, prev + delta)
      const ratio = next / 100
      progressRef.current = ratio

      if (phase === 'burn' || phase === 'incinerate') {
        updateBurnVars(ratio)
      }

      if (now - lastSoundRef.current > 95) {
        lastSoundRef.current = now
        if (phase === 'burn') sfx.flameBrush(ratio)
        else if (phase === 'incinerate') sfx.furnaceHit(ratio)
        else if (phase === 'farewell') sfx.polishBrush()
        else if (phase === 'recycle') sfx.scrapePeel()
      }

      if (next >= 100 && phase !== 'recycle') {
        later(60, () => completeRitual(phase))
      }
      return next
    })
  }

  const handleStagePointerDown = (e) => {
    if (phase === 'edit' || phase === 'done' || finishingRef.current) return
    if (!stageRef.current) return
    const sr = stageRef.current.getBoundingClientRect()
    pointerRef.current.x = e.clientX - sr.left
    pointerRef.current.y = e.clientY - sr.top
    pointerRef.current.active = true

    if (phase === 'incinerate') {
      pointerRef.current.burst = true
      advanceInteractive(18)
    } else if (phase === 'burn' || phase === 'farewell' || phase === 'recycle') {
      advanceInteractive(7)
    }
  }

  const handleStagePointerUp = () => {
    pointerRef.current.active = false
  }

  const autoExecuteRitual = () => {
    if (finishingRef.current) return
    cancelAnimationFrame(rafRef.current)
    const startPct = ritualPct
    const t0 = performance.now()
    const dur = phase === 'farewell' ? 1400 : 2200
    if (phase === 'burn' || phase === 'incinerate') sfx.fire(dur / 1000)
    else sfx.riser(dur / 1000)

    const tick = (now) => {
      const t = Math.min(1, (now - t0) / dur)
      const ease = t * t * (3 - 2 * t)
      const next = Math.round(startPct + (100 - startPct) * ease)
      setRitualPct(next)
      progressRef.current = next / 100
      if (phase === 'burn' || phase === 'incinerate') updateBurnVars(next / 100)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        completeRitual(phase, phase === 'recycle' ? tapeInput : '', phase === 'recycle' ? 'bin' : '')
      }
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  const start = (type) => {
    if (!ready || phase !== 'edit') return
    resetTilt()
    resetStageStyles()
    finishingRef.current = false
    setHover('')
    setNote('')
    setStep(0)
    setTapeName('')
    setRecycleSub('')
    setRitualPct(0)
    progressRef.current = 0
    setResult(type)
    setPhase(type)
    recordRitual(teamId, type).then(setStats).catch(() => {})
    window.scrollTo({ top: 0, behavior: 'smooth' })

    if (type === 'burn') sfx.flameBrush(0.6)
    else if (type === 'incinerate') sfx.furnaceHit(0.2)
    else if (type === 'farewell') sfx.polishBrush()
    else sfx.scrapePeel()
  }

  const again = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    cancelAnimationFrame(rafRef.current)
    finishingRef.current = false
    resetStageStyles()
    progressRef.current = 0
    setPhase('edit')
    setResult('')
    setRitualPct(0)
    setStep(0)
    setTapeName('')
    setRecycleSub('')
    setName('')
    setNumber('')
    setMsg('')
    setNote('')
  }

  const fillExample = () => {
    const [n, no] = EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)]
    setName(n)
    setNumber(no)
    sfx.tick()
    if (!teamId) {
      setTeamId(league.teams[Math.floor(Math.random() * league.teams.length)].id)
      sfx.swish()
    }
  }

  const toggleMute = () => {
    const m = !muted
    setMuted(m)
    sfx.setMuted(m)
  }

  const saveImage = async (target = 'cert') => {
    const outer = holoRef.current
    try {
      let node = certRef.current
      if ((target === 'holo' || (result === 'farewell' && !certRef.current)) && outer) {
        outer.classList.add('frozen')
        node = outer.querySelector('.holo-inner')
      }
      if (!node) return
      const url = await toPng(node, { pixelRatio: 2, cacheBust: true })
      const a = document.createElement('a')
      a.href = url
      a.download = `jersey-afterlife-${result}-${NAME}.png`
      a.click()
    } catch {
      setNote('이미지 저장에 실패했어요. 화면을 캡처해 주세요.')
    } finally {
      outer?.classList.remove('frozen')
    }
  }

  const share = async () => {
    const url = window.location.origin
    const textMap = {
      burn: `${NAME} ${number}번 유니폼을 화형식으로 성불시켰습니다 🔥`,
      incinerate: `${NAME} ${number}번 유니폼을 1,800°C 소각로에 던져버렸습니다 🏭`,
      farewell: `${NAME} ${number}번 유니폼을 명예의 전당 액자에 영구 봉인했습니다 🖼️`,
      recycle: `${NAME} ${number}번 유니폼 마킹을 떼고 ${recycleSub === 'tape' ? `"${tapeName}" 청테이프로 리폼` : '헌옷수거함에 정산(+300원)'}했습니다 ♻️`,
    }
    const text = textMap[result] || `${NAME} ${number}번 유니폼 정리 완료`
    try {
      if (navigator.share) await navigator.share({ title: '굿바이 저지 : 성불 유니폼', text, url })
      else {
        await navigator.clipboard.writeText(`${text} ${url}`)
        setNote('처분 결과와 링크를 클립보드에 복사했어요.')
      }
    } catch { /* 취소 */ }
  }

  const f = stats.farewell || 0
  const b = (stats.burn || 0) + (stats.incinerate || 0)
  const r = stats.recycle || 0
  const total = f + b + r
  const burnPct = total ? Math.round((b / total) * 100) : 50
  const teamB = (stats[`burn:${teamId}`] || 0) + (stats[`incinerate:${teamId}`] || 0)
  const teamF = stats[`farewell:${teamId}`] || 0
  const teamR = stats[`recycle:${teamId}`] || 0

  const busy = phase !== 'edit' && phase !== 'done'
  const furnaceTemp = Math.round(200 + (ritualPct / 100) * 1600)
  const stageClass = [
    phase === 'done' ? `done-${result}` : phase,
    phase === 'edit' && hover && ready ? `pre-${hover}` : '',
    phase === 'incinerate' && ritualPct > 0 ? 'heating' : '',
  ].join(' ')
  const showCard = result === 'farewell' && (step >= 4 || phase === 'done')
  const getRect = () => (result === 'farewell' ? holoRef.current : clothRef.current)?.getBoundingClientRect()
  const reasonObj = REASONS.find((item) => item.id === reason) || REASONS[0]
  const meta = MODE_META[result] || MODE_META.burn

  return (
    <div className="app">
      <header className="top">
        <button type="button" className="brand" onClick={() => setView('make')}>
          <b>GOODBYE JERSEY</b>
        </button>
        <nav className="nav">
          <button type="button" className={view === 'make' ? 'tab on' : 'tab'} onClick={() => setView('make')}>유니폼 처분소</button>
          <button type="button" className={view === 'gallery' ? 'tab on' : 'tab'} onClick={() => setView('gallery')} disabled={busy}>
            내 전시관{items.length > 0 && <i className="count">{items.length}</i>}
          </button>
        </nav>
        <p className="ticker">
          {total > 0
            ? <>누적 <i className="t-f">{f.toLocaleString()}벌</i> 액자 · <i className="t-b">{b.toLocaleString()}벌</i> 소각 · <i className="t-r">{r.toLocaleString()}벌</i> 수거</>
            : '첫 번째 유니폼을 기다리고 있어요'}
          <button type="button" className="mute" onClick={toggleMute} aria-label={muted ? '소리 켜기' : '소리 끄기'}>{muted ? 'SOUND OFF' : 'SOUND ON'}</button>
        </p>
      </header>

      {view === 'gallery' && (
        <Gallery items={items} onStart={() => setView('make')} onClear={() => setItems(clearCollection())} />
      )}

      <div className="layout" hidden={view !== 'make'}>
        <section
          ref={stageRef}
          className={`stage ${stageClass}`}
          style={{ '--tc': tc, '--heat': (ritualPct / 100).toFixed(2) }}
          onPointerMove={onMove}
          onPointerLeave={resetTilt}
          onPointerDown={handleStagePointerDown}
          onPointerUp={handleStagePointerUp}
        >
          <div className="pitch" aria-hidden="true" />
          <div className="cone" aria-hidden="true" />
          <div className="beam b1" aria-hidden="true" /><div className="beam b2" aria-hidden="true" />
          <div className="fireglow" aria-hidden="true" />
          {phase === 'incinerate' && <div className="furnace-grate" aria-hidden="true" />}

          {/* 액자 봉인 진행 시 황금 액자 프레임 오버레이 */}
          {((phase === 'farewell' && step === 0) || (phase === 'done' && result === 'recycle')) && (
            <div className={`museum-frame ${phase === 'farewell' ? 'gold' : 'eco'}`} style={{ opacity: phase === 'farewell' ? Math.max(0.25, ritualPct / 100) : 0 }} aria-hidden="true" />
          )}

          <div className="rig" style={phase === 'incinerate' ? { transform: `translateY(${(ritualPct * 0.45).toFixed(1)}px) scale(${(1 - ritualPct * 0.0018).toFixed(3)})` } : undefined}>
            <svg className="rail" viewBox="-300 -70 900 140" aria-hidden="true">
              <defs>
                <linearGradient id="railMetal" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#f2f5f9" /><stop offset="0.45" stopColor="#9aa2af" /><stop offset="1" stopColor="#3d434d" />
                </linearGradient>
                <linearGradient id="railFade" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.22" stopColor="#fff" /><stop offset="0.78" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
                <mask id="railMask"><rect x="-300" y="-70" width="900" height="140" fill="url(#railFade)" /></mask>
              </defs>
              <g mask="url(#railMask)">
                <rect x="-300" y="-49" width="900" height="12" fill="#000" opacity="0.35" />
                <rect x="-300" y="-57" width="900" height="10" rx="5" fill="url(#railMetal)" />
              </g>
            </svg>
            <div className="tilt" ref={tiltRef}>
              <div className="sway">
                <svg className="hanger" viewBox="0 -70 300 140" aria-hidden="true">
                  <defs>
                    <linearGradient id="hangerMetal" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0" stopColor="#f4f6f9" /><stop offset="1" stopColor="#8f97a4" />
                    </linearGradient>
                  </defs>
                  <path d="M150 6 L150 -22 C150 -36 171 -36 171 -51 C171 -67 147 -69 140 -56" fill="none" stroke="url(#hangerMetal)" strokeWidth="4.5" strokeLinecap="round" />
                  <path d="M150 6 L40 55 Q150 68 260 55 Z" fill="none" stroke="url(#hangerMetal)" strokeWidth="4.5" strokeLinejoin="round" />
                </svg>
                <div className="warp">
                  <div className="cloth" ref={clothRef}>
                    <div className="kitflip" key={teamId || 'blank'}>
                      <div className="stampin" key={`${NAME}|${number}`}>
                        <Jersey
                          kit={team?.kit}
                          name={team ? NAME || 'NAME' : ''}
                          number={team ? number || '00' : ''}
                          size={340}
                          peelProgress={phase === 'recycle' || result === 'recycle' ? ritualPct / 100 : 0}
                          tapeName={result === 'recycle' ? tapeName : ''}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="burnline" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>

          <div className="floor" aria-hidden="true" />
          <div className="ash" aria-hidden="true" />
          <Fx mode={phase === 'edit' ? null : result} getRect={getRect} progressRef={progressRef} pointerRef={pointerRef} colors={fxColors} />

          {phase === 'edit' && !team && <p className="stage-hint">팀을 고르면 유니폼이 입혀져요</p>}

          {/* 인터랙티브 진행 HUD */}
          {busy && step === 0 && (
            <div className="stage-hud">
              <div className="hud-badge">
                {phase === 'burn' && `🔥 토치로 유니폼을 문질러 태우세요 (${ritualPct}%)`}
                {phase === 'incinerate' && `🏭 클릭 연타로 화력을 올리세요! (${furnaceTemp.toLocaleString()}°C / 1,800°C)`}
                {phase === 'farewell' && `🖼️ 문질러서 광택을 내고 액자에 봉인하세요 (${ritualPct}%)`}
                {phase === 'recycle' && `♻️ 문질러서 마킹을 긁어내세요! (${ritualPct}% 박리)`}
              </div>
              <div className="hud-bar"><span style={{ width: `${ritualPct}%` }} /></div>
            </div>
          )}

          {(phase === 'burn' || phase === 'incinerate') && <p className="caption burn">{MSG || `잘 가라, ${NAME}.`}</p>}
          {phase === 'done' && (result === 'burn' || result === 'incinerate') && <div className="stamp">{meta.stamp}</div>}
          {phase === 'done' && result === 'recycle' && (
            <div className="stamp eco">{recycleSub === 'tape' ? '마킹갈이 완료' : '+300원 정산 완료'}</div>
          )}

          {/* 보내주기: 암전 → 구단 → 등번호 → 이름 → 카드 공개 */}
          {phase === 'farewell' && step >= 1 && step <= 3 && (
            <div className="walk">
              <div className="pulse" key={`p${step}`} aria-hidden="true" />
              <div className="walk-item" key={step}>
                {step === 1 && <><small>CLUB</small><b>{team.en}</b><i /></>}
                {step === 2 && <><small>NUMBER</small><b className="huge">{number}</b></>}
                {step === 3 && <><small>NAME</small><b>{NAME}</b><i /></>}
              </div>
            </div>
          )}
          {showCard && (
            <>
              <div className="flash" aria-hidden="true" />
              <div className="holo-wrap">
                <HoloCard team={team} name={NAME} number={number} msg={MSG} date={today} outerRef={holoRef} variant="farewell" />
              </div>
            </>
          )}

          <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
            <filter id="warp" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.018 0.03" numOctaves="2" seed="4" result="n">
                <animate attributeName="baseFrequency" values="0.018 0.03;0.024 0.04;0.016 0.028;0.018 0.03" dur="1.4s" repeatCount="indefinite" />
              </feTurbulence>
              <feDisplacementMap in="SourceGraphic" in2="n" scale="26" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </svg>
        </section>

        <aside className="panel">
          {phase === 'edit' && (
            <div className="editor">
              <p className="kicker">JERSEY AFTERLIFE · {league.full}</p>
              <h1>선수는 떠났고,<br />유니폼만 남았다.</h1>
              <p className="lead">마킹까지 새겼는데 떠난 선수. 태울지, 소각로에 던질지, 액자에 걸지, 마킹을 떼고 재활용할지 직접 집행하세요.</p>

              <div className="scenario-row">
                {SCENARIOS.map((sc) => (
                  <button key={sc.id} type="button" className="sc-pill" onClick={() => applyScenario(sc)}>{sc.label}</button>
                ))}
              </div>

              <div className="step"><span>01</span> 어느 팀 유니폼인가요?
                <div className="leagues">
                  {LEAGUES.map((l) => (
                    <button key={l.id} type="button" className={leagueId === l.id ? 'on' : ''} onClick={() => { setLeagueId(l.id); sfx.tick() }}>{l.label}</button>
                  ))}
                </div>
              </div>
              <div className={`teams ${leagueId}`} key={leagueId}>
                {league.teams.map((t) => (
                  <button key={t.id} type="button" className={teamId === t.id ? 'team on' : 'team'} onClick={() => pickTeam(t.id)} title={t.name}>
                    <Jersey kit={t.kit} size={38} lite number={t.kit.sport === 'baseball' ? '1' : ''} />
                    <em>{t.name}</em>
                  </button>
                ))}
              </div>

              <div className="step"><span>02</span> 누구의 이름을 새겼나요? <button type="button" className="link" onClick={fillExample}>랜덤 예시</button></div>
              <div className="row">
                <label className="grow">마킹 이름
                  <input value={name} maxLength={12} onChange={(e) => typeName(e.target.value)} placeholder="SON / 양의지" autoComplete="off" />
                </label>
                <label className="num">등번호
                  <input value={number} maxLength={2} inputMode="numeric" onChange={(e) => typeNumber(e.target.value)} placeholder="7" autoComplete="off" />
                </label>
              </div>

              <div className="step"><span>03</span> 이적 사연과 매몰 비용</div>
              <div className="reason-grid">
                {REASONS.map((item) => (
                  <button key={item.id} type="button" className={reason === item.id ? 'r-btn on' : 'r-btn'} onClick={() => { setReason(item.id); sfx.tick() }}>
                    <b>{item.label}</b>
                  </button>
                ))}
              </div>
              <div className="row" style={{ marginTop: 8 }}>
                <label className="grow">마지막 한마디 (선택)
                  <input className="plain" value={msg} maxLength={32} onChange={(e) => setMsg(e.target.value)} placeholder="예: 그래도 고마웠다 / 거기선 잘해봐라" autoComplete="off" />
                </label>
                <label className="price-in">구매가(₩)
                  <input className="plain" value={price} inputMode="numeric" maxLength={7} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))} placeholder="149000" autoComplete="off" />
                </label>
              </div>

              <div className="step"><span>04</span> 처분 의식을 선택하세요</div>
              <div className="choices">
                <button type="button" className="choice burn" disabled={!ready} onClick={() => start('burn')}
                  onPointerEnter={() => setHover('burn')} onPointerLeave={() => setHover('')}>
                  <small>TORCH RITUAL</small>
                  <b>🔥 직접 태우기</b>
                  <span>토치로 마킹에 불을 붙여 한 줌의 재로 만듭니다.</span>
                </button>
                <button type="button" className="choice incinerate" disabled={!ready} onClick={() => start('incinerate')}
                  onPointerEnter={() => setHover('incinerate')} onPointerLeave={() => setHover('')}>
                  <small>1,800°C FURNACE</small>
                  <b>🏭 소각로 투하</b>
                  <span>용광로에 넣고 화력을 연타해 1,800°C로 녹입니다.</span>
                </button>
                <button type="button" className="choice farewell" disabled={!ready} onClick={() => start('farewell')}
                  onPointerEnter={() => setHover('farewell')} onPointerLeave={() => setHover('')}>
                  <small>HALL OF FAME</small>
                  <b>🖼️ 액자에 저장</b>
                  <span>정성껏 닦아 황금 액자와 홀로그램 카드로 영구 봉인.</span>
                </button>
                <button type="button" className="choice recycle" disabled={!ready} onClick={() => start('recycle')}
                  onPointerEnter={() => setHover('recycle')} onPointerLeave={() => setHover('')}>
                  <small>UPCYCLE &amp; SCRAP</small>
                  <b>♻️ 분리수거 · 갈이</b>
                  <span>마킹을 긁어내 청테이프로 리폼하거나 수거함 정산.</span>
                </button>
              </div>
              {!ready && <p className="hint">팀, 마킹 이름, 등번호를 채우면 4대 처분 버튼이 열립니다.</p>}
            </div>
          )}

          {busy && (
            <div className="ritual">
              <p className="r-kicker">{team.en} · No.{number} · {reasonObj.label}</p>
              <h2>
                {phase === 'burn' && (ritualPct < 100 ? '🔥 화형 집행 중…' : '화형 마무리 중…')}
                {phase === 'incinerate' && `🏭 소각로 가열 중 (${furnaceTemp.toLocaleString()}°C)`}
                {phase === 'farewell' && (step === 0 ? '🖼️ 액자 봉인 손질 중…' : '✨ 명예의 전당 헌액 중…')}
                {phase === 'recycle' && '♻️ 아세톤 헤라 마킹 박리 중…'}
              </h2>
              <p className="lead">
                {phase === 'burn' && '왼쪽 무대의 유니폼 위를 마우스/손가락으로 문지르면 불길이 번집니다!'}
                {phase === 'incinerate' && '왼쪽 소각로 또는 아래 화력 버튼을 연타해 1,800°C까지 올리세요!'}
                {phase === 'farewell' && (step === 0 ? '유니폼을 문질러 닦아 광택을 내면 황금 액자 봉인이 시작됩니다.' : `${NAME}의 이름이 명예의 전당으로 올라가고 있습니다.`)}
                {phase === 'recycle' && '유니폼 등판을 문질러 마킹을 긁어낸 뒤, 청테이프 리폼 또는 헌옷수거함 배출을 선택하세요.'}
              </p>

              <div className="ritual-progress">
                <div className="rp-head"><span>진행도</span><b>{ritualPct}%</b></div>
                <div className="rp-track"><span className={phase} style={{ width: `${ritualPct}%` }} /></div>
              </div>

              {phase === 'incinerate' && (
                <button type="button" className="action-hero fire" onClick={() => { pointerRef.current.burst = true; advanceInteractive(20) }}>
                  🔥 화력 가압 연타! (+250°C)
                </button>
              )}
              {phase === 'burn' && (
                <button type="button" className="action-hero fire" onClick={() => advanceInteractive(22)}>
                  🔥 토치 화력 집중 분사! (+22%)
                </button>
              )}
              {phase === 'farewell' && step === 0 && (
                <button type="button" className="action-hero gold" onClick={() => advanceInteractive(25)}>
                  ✨ 스팀 다림질 &amp; 황금 볼트 체결 (+25%)
                </button>
              )}
              {phase === 'recycle' && (
                <div className="recycle-controls">
                  <button type="button" className="action-hero eco" onClick={() => advanceInteractive(25)}>
                    🪒 아세톤 헤라로 마킹 긁기 (+25%)
                  </button>
                  <div className="tape-box">
                    <label>옵션 A · 청테이프 새 마킹 이름 (리폼)
                      <div className="tape-row">
                        <input className="plain" value={tapeInput} maxLength={12} onChange={(e) => setTapeInput(e.target.value)} placeholder="우리 유망주" />
                        <button type="button" className="btn solid" onClick={() => completeRitual('recycle', tapeInput, 'tape')}>🏷️ 덧방 리폼</button>
                      </div>
                    </label>
                  </div>
                  <button type="button" className="btn bin-btn" onClick={() => completeRitual('recycle', '', 'bin')}>
                    🗑️ 옵션 B · 헌옷 분리수거함 골인 (+₩300 정산)
                  </button>
                </div>
              )}

              {step === 0 && (
                <button type="button" className="btn auto-btn" onClick={autoExecuteRitual}>
                  ⚡ 원클릭 자동 완료 (즉시 집행)
                </button>
              )}
            </div>
          )}

          {phase === 'done' && (
            <div className="result">
              <div className={`card ${result}`} ref={certRef}>
                <p className="c-kicker">{meta.kicker}</p>
                <h2>{meta.title}</h2>
                <div className="c-body">
                  <div className={`c-jersey ${result}`}>
                    <Jersey
                      kit={team.kit}
                      name={NAME}
                      number={number}
                      size={110}
                      lite
                      peelProgress={result === 'recycle' ? 1 : 0}
                      tapeName={result === 'recycle' ? tapeName : ''}
                    />
                  </div>
                  <div>
                    <p className="c-name">
                      {result === 'recycle' && tapeName ? `${NAME} → ${tapeName}` : NAME} <small>No.{number}</small>
                    </p>
                    <p className="c-team">{team.name} · {reasonObj.label}</p>
                    <p className="c-text">
                      {result === 'burn' && `매몰비용 ₩${parsedPrice.toLocaleString()}의 유니폼이 한 줌의 재가 되어 성불했습니다. 옷장에 새 자리가 생겼습니다.`}
                      {result === 'incinerate' && `1,800°C 초고열 소각로에서 흔적도 없이 용해 폐기되었습니다. 멘탈 데미지 100% 복구 완료.`}
                      {result === 'farewell' && `${NAME}의 ${number}번은 구단 명예의 전당 황금 액자에 영구 봉인되었습니다.`}
                      {result === 'recycle' && (recycleSub === 'tape'
                        ? `기존 마킹을 박리하고 "${tapeName}" 청테이프 리폼을 완료해 새 생명을 얻었습니다.`
                        : `마킹을 적출하고 헌옷 분리수거함에 배출해 ₩300을 정산받았습니다.`)}
                    </p>
                  </div>
                </div>
                {MSG && <p className="c-quote">“{MSG}”</p>}
                <div className="c-meta">
                  <span>구매가 ₩{parsedPrice.toLocaleString()}</span>
                  <span>회수 가치 {result === 'recycle' && recycleSub === 'bin' ? '+₩300' : result === 'farewell' ? '무한대(영구결번)' : '마음의 평화'}</span>
                </div>
                <div className="c-foot"><span>{today}</span><span>GOODBYE JERSEY</span></div>
              </div>

              <div className="stat-box">
                <p className="s-title">다른 팬들의 선택 (전체 {total.toLocaleString()}벌)</p>
                <div className="versus">
                  <span className="v-b" style={{ width: `${burnPct}%` }}>화형·소각 {burnPct}%</span>
                  <span className="v-f" style={{ width: `${100 - burnPct}%` }}>봉인·수거 {100 - burnPct}%</span>
                </div>
                <p className="s-line">
                  {team.name} 유니폼은 지금까지 <b>{teamB.toLocaleString()}벌</b>이 소각되고, <b>{teamF.toLocaleString()}벌</b>이 액자 봉인, <b>{teamR.toLocaleString()}벌</b>이 분리수거되었습니다.
                </p>
              </div>

              <div className="actions">
                <button type="button" className="btn solid" onClick={() => saveImage('cert')}>증명서 이미지 저장</button>
                {result === 'farewell' && (
                  <button type="button" className="btn" onClick={() => saveImage('holo')}>홀로그램 카드 저장</button>
                )}
                <button type="button" className="btn" onClick={() => setView('gallery')}>내 전시관 보기</button>
                <button type="button" className="btn" onClick={share}>공유하기</button>
                <button type="button" className="btn" onClick={again}>다른 유니폼 정리</button>
              </div>
              {note && <p className="hint">{note}</p>}
            </div>
          )}
        </aside>
      </div>
      <footer className="foot">구단 엠블럼·스폰서 로고는 사용하지 않았으며, 실제 구단과 무관한 팬 서비스입니다 · 젝커톤 2026</footer>
    </div>
  )
}
