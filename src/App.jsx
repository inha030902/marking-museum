import { useEffect, useMemo, useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import Jersey from './Jersey.jsx'
import Fx from './Fx.jsx'
import HoloCard from './HoloCard.jsx'
import Gallery from './Gallery.jsx'
import { addToCollection, clearCollection, loadCollection } from './collection.js'
import { LEAGUES, mainColor, teamById } from './teams.js'
import { getStats, recordRitual } from './api.js'
import * as sfx from './sound.js'

const BURN_MS = 5200
const EXAMPLES = [['RUNAWAY', '11'], ['CAPTAIN', '4'], ['LEGEND', '10'], ['TRAITOR', '9'], ['MY HERO', '7']]

export default function App() {
  const [teamId, setTeamId] = useState('')
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [msg, setMsg] = useState('')
  const [phase, setPhase] = useState('edit') // edit | burn | farewell | done
  const [result, setResult] = useState('') // burn | farewell
  const [step, setStep] = useState(0) // 보내주기 연출 단계: 0 암전 → 1 구단 → 2 등번호 → 3 이름 → 4 공개
  const [hover, setHover] = useState('') // 버튼에 올렸을 때 무대가 미리 반응
  const [stats, setStats] = useState({})
  const [note, setNote] = useState('')
  const [muted, setMuted] = useState(false)
  const [leagueId, setLeagueId] = useState('epl')
  const league = LEAGUES.find((l) => l.id === leagueId) || LEAGUES[0]
  const [view, setView] = useState('make') // make | gallery
  const [items, setItems] = useState(loadCollection)

  const team = teamById(teamId)
  const clothRef = useRef(null)
  const tiltRef = useRef(null)
  const certRef = useRef(null)
  const holoRef = useRef(null)
  const progressRef = useRef(0)
  const timers = useRef([])

  useEffect(() => { getStats().then(setStats).catch(() => {}) }, [])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const ready = !!team && name.trim().length > 0 && /^\d{1,2}$/.test(number)
  const NAME = name.trim().toUpperCase()
  const MSG = msg.trim()
  const tc = team ? mainColor(team.kit) : '#e3c583'
  const fxColors = useMemo(() => (team ? [team.kit.body, team.kit.sleeve, mainColor(team.kit)] : []), [team])
  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })

  const onMove = (e) => {
    if (phase !== 'edit' || !tiltRef.current) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5
    tiltRef.current.style.setProperty('--ry', `${x * 28}deg`)
    tiltRef.current.style.setProperty('--rx', `${-y * 14}deg`)
  }
  const resetTilt = () => {
    tiltRef.current?.style.setProperty('--ry', '0deg')
    tiltRef.current?.style.setProperty('--rx', '0deg')
  }
  const later = (ms, fn) => timers.current.push(setTimeout(fn, ms))

  const pickTeam = (id) => { if (id !== teamId) { setTeamId(id); sfx.swish() } }
  const typeName = (v) => { setName(v); sfx.tick() }
  const typeNumber = (v) => { setNumber(v.replace(/\D/g, '')); sfx.tick() }

  const start = (type) => {
    if (!ready || phase !== 'edit') return
    resetTilt()
    setHover(''); setNote(''); setStep(0)
    setResult(type); setPhase(type)
    progressRef.current = 0
    recordRitual(teamId, type).then(setStats).catch(() => {})
    window.scrollTo({ top: 0, behavior: 'smooth' })
    const finish = () => {
      setItems(addToCollection({ teamId, name: NAME, number, msg: MSG, type }))
      setPhase('done')
    }

    if (type === 'burn') {
      sfx.fire(BURN_MS / 1000)
      const t0 = performance.now()
      const tick = (now) => {
        // 처음 0.35초는 불이 붙는 시간
        const t = Math.min(1, Math.max(0, (now - t0 - 350) / (BURN_MS - 350)))
        const p = t * t * (3 - 2 * t)
        progressRef.current = p
        const el = clothRef.current?.parentElement
        if (el) {
          el.style.setProperty('--burn', p.toFixed(4))
          el.style.setProperty('--glow', Math.sin(Math.PI * p).toFixed(3))
        }
        if (t < 1) requestAnimationFrame(tick)
        else later(1500, () => { sfx.thud(); finish() })
      }
      requestAnimationFrame(tick)
    } else {
      sfx.thud(); sfx.riser(4.35)
      later(950, () => { setStep(1); sfx.thud() })
      later(2100, () => { setStep(2); sfx.thud() })
      later(3250, () => { setStep(3); sfx.thud() })
      later(4400, () => { setStep(4); progressRef.current = 1; sfx.fanfare() })
      later(6200, finish)
    }
  }

  const again = () => {
    const el = clothRef.current?.parentElement
    el?.style.removeProperty('--burn'); el?.style.removeProperty('--glow')
    progressRef.current = 0
    setPhase('edit'); setResult(''); setStep(0); setName(''); setNumber(''); setMsg(''); setNote('')
  }

  const fillExample = () => {
    const [n, no] = EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)]
    setName(n); setNumber(no); sfx.tick()
    if (!teamId) { setTeamId(league.teams[Math.floor(Math.random() * league.teams.length)].id); sfx.swish() }
  }

  const toggleMute = () => { const m = !muted; setMuted(m); sfx.setMuted(m) }

  const saveImage = async () => {
    const outer = holoRef.current
    try {
      let node = certRef.current
      if (result === 'farewell' && outer) { outer.classList.add('frozen'); node = outer.querySelector('.holo-inner') }
      const url = await toPng(node, { pixelRatio: 2, cacheBust: true })
      const a = document.createElement('a')
      a.href = url; a.download = `goodbye-jersey-${NAME}.png`; a.click()
    } catch { setNote('이미지 저장에 실패했어요. 화면을 캡처해 주세요.') }
    finally { outer?.classList.remove('frozen') }
  }
  const share = async () => {
    const url = window.location.origin
    const text = result === 'burn' ? `${NAME} ${number}번 유니폼을 태웠습니다 🔥` : `${NAME} ${number}번 유니폼을 명예의 전당에 보냈습니다 🕊️`
    try {
      if (navigator.share) await navigator.share({ title: '굿바이 저지', text, url })
      else { await navigator.clipboard.writeText(`${text} ${url}`); setNote('링크를 복사했어요.') }
    } catch { /* 취소 */ }
  }

  const f = stats.farewell || 0, b = stats.burn || 0, total = f + b
  const burnPct = total ? Math.round((b / total) * 100) : 50
  const teamB = stats[`burn:${teamId}`] || 0, teamF = stats[`farewell:${teamId}`] || 0
  const busy = phase === 'burn' || phase === 'farewell'
  const stageClass = [phase === 'done' ? `done-${result}` : phase, phase === 'edit' && hover && ready ? `pre-${hover}` : ''].join(' ')
  const showCard = result === 'farewell' && (step >= 4 || phase === 'done')
  const getRect = () => (result === 'farewell' ? holoRef.current : clothRef.current)?.getBoundingClientRect()

  return (
    <div className="app">
      <header className="top">
        <button type="button" className="brand" onClick={() => setView('make')}>
          <b>GOODBYE JERSEY</b>
        </button>
        <nav className="nav">
          <button type="button" className={view === 'make' ? 'tab on' : 'tab'} onClick={() => setView('make')}>유니폼 정리</button>
          <button type="button" className={view === 'gallery' ? 'tab on' : 'tab'} onClick={() => setView('gallery')} disabled={busy}>
            내 전시관{items.length > 0 && <i className="count">{items.length}</i>}
          </button>
        </nav>
        <p className="ticker">
          {total > 0
            ? <>지금까지 <i className="t-f">{f.toLocaleString()}벌</i> 헌액 · <i className="t-b">{b.toLocaleString()}벌</i> 소각</>
            : '첫 번째 유니폼을 기다리고 있어요'}
          <button type="button" className="mute" onClick={toggleMute} aria-label={muted ? '소리 켜기' : '소리 끄기'}>{muted ? 'SOUND OFF' : 'SOUND ON'}</button>
        </p>
      </header>

      {view === 'gallery' && (
        <Gallery items={items} onStart={() => setView('make')} onClear={() => setItems(clearCollection())} />
      )}

      <div className="layout" hidden={view !== 'make'}>
        <section className={`stage ${stageClass}`} style={{ '--tc': tc }} onPointerMove={onMove} onPointerLeave={resetTilt}>
          <div className="pitch" aria-hidden="true" />
          <div className="cone" aria-hidden="true" />
          <div className="beam b1" aria-hidden="true" /><div className="beam b2" aria-hidden="true" />
          <div className="fireglow" aria-hidden="true" />

          <div className="rig">
            {/* 봉과 옷걸이는 유니폼과 같은 좌표계(가로 300 단위)로 그려서 어깨선에 정확히 맞춘다 */}
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
                  {/* 고리: 봉 위로 넘어가 걸린다 */}
                  <path d="M150 6 L150 -22 C150 -36 171 -36 171 -51 C171 -67 147 -69 140 -56" fill="none" stroke="url(#hangerMetal)" strokeWidth="4.5" strokeLinecap="round" />
                  {/* 어깨: 양 끝은 유니폼 어깨 속으로 들어가 가려진다 */}
                  <path d="M150 6 L40 55 Q150 68 260 55 Z" fill="none" stroke="url(#hangerMetal)" strokeWidth="4.5" strokeLinejoin="round" />
                </svg>
                <div className="warp">
                  <div className="cloth" ref={clothRef}>
                    <div className="kitflip" key={teamId || 'blank'}>
                      <div className="stampin" key={`${NAME}|${number}`}>
                        <Jersey kit={team?.kit} name={team ? NAME || 'NAME' : ''} number={team ? number || '00' : ''} size={340} />
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
          <Fx mode={phase === 'edit' ? null : result} getRect={getRect} progressRef={progressRef} colors={fxColors} />

          {phase === 'edit' && !team && <p className="stage-hint">팀을 고르면 유니폼이 입혀져요</p>}

          {/* 소각 */}
          {phase === 'burn' && <div className="ignite" aria-hidden="true" />}
          {phase === 'burn' && <p className="caption burn">{MSG || `잘 가라, ${NAME}.`}</p>}
          {phase === 'done' && result === 'burn' && <div className="stamp">소각 완료</div>}

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
                <HoloCard team={team} name={NAME} number={number} msg={MSG} date={today} outerRef={holoRef} />
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
              <p className="kicker">KIT ROOM · {league.full}</p>
              <h1>선수는 떠났고,<br />유니폼만 남았다.</h1>
              <p className="lead">이름까지 새겼는데 그 선수가 팀을 떠났나요? 옷장 속 그 유니폼, 여기서 정리하세요.</p>

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
                    {/* 야구 홈 유니폼은 대부분 흰색이라, 팀 색이 보이도록 작은 번호를 넣는다 */}
                    <Jersey kit={t.kit} size={38} lite number={t.kit.sport === 'baseball' ? '1' : ''} />
                    <em>{t.name}</em>
                  </button>
                ))}
              </div>

              <div className="step"><span>02</span> 누구의 이름을 새겼나요? <button type="button" className="link" onClick={fillExample}>예시로 채우기</button></div>
              <div className="row">
                <label className="grow">마킹 이름
                  <input value={name} maxLength={12} onChange={(e) => typeName(e.target.value)} placeholder="SON" autoComplete="off" />
                </label>
                <label className="num">등번호
                  <input value={number} maxLength={2} inputMode="numeric" onChange={(e) => typeNumber(e.target.value)} placeholder="7" autoComplete="off" />
                </label>
              </div>

              <div className="step"><span>03</span> 마지막으로 한마디 <small>선택</small></div>
              <input className="plain" value={msg} maxLength={28} onChange={(e) => setMsg(e.target.value)} placeholder="예: 그래도 고마웠다 / 거기서도 잘해봐라" autoComplete="off" />

              <div className="step"><span>04</span> 이 유니폼을 어떻게 할까요?</div>
              <div className="choices">
                <button type="button" className="choice farewell" disabled={!ready} onClick={() => start('farewell')}
                  onPointerEnter={() => setHover('farewell')} onPointerLeave={() => setHover('')}>
                  <small>HALL OF FAME</small>
                  <b>보내주기</b>
                  <span>그동안 고마웠어요. 명예의 전당으로.</span>
                </button>
                <button type="button" className="choice burn" disabled={!ready} onClick={() => start('burn')}
                  onPointerEnter={() => setHover('burn')} onPointerLeave={() => setHover('')}>
                  <small>BURN IT</small>
                  <b>소각하기</b>
                  <span>용서 못 해. 재가 되어라.</span>
                </button>
              </div>
              {!ready && <p className="hint">팀, 마킹 이름, 등번호를 채우면 버튼이 열려요.</p>}
            </div>
          )}

          {busy && (
            <div className="ritual">
              <p className="r-kicker">{team.en} · No.{number}</p>
              <h2>{phase === 'burn' ? '소각 중…' : '헌액 중…'}</h2>
              <p className="lead">{phase === 'burn' ? `${NAME}의 이름이 불길 속으로 사라지고 있습니다.` : `${NAME}의 이름이 명예의 전당으로 올라가고 있습니다.`}</p>
            </div>
          )}

          {phase === 'done' && (
            <div className="result">
              {result === 'farewell' ? (
                <div className="hof">
                  <p className="r-kicker">HALL OF FAME</p>
                  <h2>헌액 완료</h2>
                  <p className="lead">{NAME}의 {number}번은 이제 영원히 걸려 있습니다. 카드를 움직여 보세요.</p>
                </div>
              ) : (
                <div className="card burn" ref={certRef}>
                  <p className="c-kicker">CERTIFICATE OF CREMATION</p>
                  <h2>소각 증명서</h2>
                  <div className="c-body">
                    <div className="c-jersey burn"><Jersey kit={team.kit} name={NAME} number={number} size={110} lite /></div>
                    <div>
                      <p className="c-name">{NAME} <small>No.{number}</small></p>
                      <p className="c-team">{team.name}</p>
                      <p className="c-text">위 유니폼은 주인의 뜻에 따라 한 줌의 재가 되었음을 증명합니다. 옷장에 자리가 하나 생겼습니다.</p>
                    </div>
                  </div>
                  {MSG && <p className="c-quote">“{MSG}”</p>}
                  <div className="c-foot"><span>{today}</span><span>GOODBYE JERSEY</span></div>
                </div>
              )}

              <div className="stat-box">
                <p className="s-title">다른 팬들의 선택</p>
                <div className="versus">
                  <span className="v-b" style={{ width: `${burnPct}%` }}>소각 {burnPct}%</span>
                  <span className="v-f" style={{ width: `${100 - burnPct}%` }}>헌액 {100 - burnPct}%</span>
                </div>
                <p className="s-line">{team.name} 유니폼은 지금까지 <b>{teamB.toLocaleString()}벌</b>이 불탔고 <b>{teamF.toLocaleString()}벌</b>이 명예의 전당에 올랐습니다.</p>
              </div>

              <div className="actions">
                <button type="button" className="btn solid" onClick={saveImage}>{result === 'farewell' ? '카드 이미지 저장' : '증명서 이미지 저장'}</button>
                <button type="button" className="btn" onClick={() => setView('gallery')}>내 전시관 보기</button>
                <button type="button" className="btn" onClick={share}>공유하기</button>
                <button type="button" className="btn" onClick={again}>다른 유니폼 정리하기</button>
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
