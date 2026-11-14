import { useEffect, useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import Jersey from '../Jersey.jsx'
import { STATES, reasonLabel, sportOf, stateLabel, won } from '../constants.js'
import { addCondolence, addFlower, getMemorial, hasBadWord, statsOf } from '../store.js'
import { certificateLine, epitaphFor } from '../epitaph.js'

export default function Exhibit({ id }) {
  const [m, setM] = useState(undefined)
  const [smoke, setSmoke] = useState(0)
  const [cert, setCert] = useState(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    getMemorial(id).then((x) => {
      setM(x)
      if (x && x.count === 0) setShowForm(true)
    })
  }, [id])

  if (m === undefined) return <p className="loading">전시관 조명을 켜는 중…</p>
  if (m === null) return (
    <section className="notfound">
      <h2>이 전시품을 찾을 수 없어요</h2>
      <a className="btn gold" href="#/">전시관으로</a>
    </section>
  )

  const s = statsOf(m)
  const sp = sportOf(m.sport)
  const total = m.count || 1
  const states = STATES.map((st) => ({ ...st, n: m.stateCounts[st.id] || 0 })).sort((a, b) => b.n - a.n)

  const flower = async () => {
    setSmoke((v) => v + 1)
    setM((cur) => ({ ...cur, flowers: cur.flowers + 1 }))
    try {
      const x = await addFlower(m.id)
      if (x) setM((cur) => ({ ...cur, flowers: x.flowers }))
    } catch { /* 국화는 실패해도 화면은 유지 */ }
  }

  return (
    <div className="exhibit">
      <a className="back" href={`#/sport/${m.sport}`}>← {sp.hall} {sp.label}</a>

      <section className="ex-top">
        <div className="ex-case">
          <div className="spot big" aria-hidden="true" />
          <div className="case big">
            <span className="ribbon" aria-hidden="true" />
            <Jersey sport={m.sport} name={m.name} number={m.number} main={m.main} accent={m.accent} size={260} />
          </div>
          {smoke > 0 && <div key={smoke} className="incense" aria-hidden="true">🌼</div>}
        </div>

        <div className="ex-info">
          <p className="ex-kicker">{sp.icon} {sp.label} · 전시번호 {m.id.slice(-4).toUpperCase()}</p>
          <h1>故 {m.name} 마킹</h1>
          <p className="ex-meta">前 {m.team} · No.{m.number} · {m.from} ~ {m.to}</p>
          <p className="ex-cause">사인: <b>{reasonLabel(m.reason)}</b></p>
          <blockquote className="epitaph">“{epitaphFor(m)}”</blockquote>
          <div className="ex-actions">
            <button className="btn gold" onClick={() => {
              setShowForm(true); setCert(null)
              setTimeout(() => document.getElementById('condole')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
            }}>내 유니폼도 여기 잠들어 있어요</button>
            <button className="btn ghost" onClick={flower}>🌼 국화 놓기 <span className="pill">{m.flowers.toLocaleString()}</span></button>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="stat"><b>{m.count.toLocaleString()}벌</b><span>함께 잠든 유니폼</span></div>
        <div className="stat"><b>{won(m.totalPrice)}</b><span>팬들의 총 피해액</span></div>
        <div className="stat"><b>{won(s.avgPerWear)}</b><span>평균 1회 착용당 비용</span></div>
        <div className="stat"><b>{s.regretRate}%</b><span>다시 산다면 안 산다</span></div>
      </section>

      <section className="states">
        <h3>남겨진 유니폼들의 현재 상태</h3>
        {states.map((st) => (
          <div className="bar" key={st.id}>
            <span className="bar-label">{st.label}</span>
            <span className="bar-track"><span className="bar-fill" style={{ width: `${Math.round((st.n / total) * 100)}%` }} /></span>
            <span className="bar-pct">{m.count ? Math.round((st.n / total) * 100) : 0}%</span>
          </div>
        ))}
      </section>

      {showForm && !cert && (
        <CondolenceForm m={m} onDone={(res) => { setM({ ...res.memorial }); setCert(res) ; setShowForm(false) }} />
      )}
      {cert && <Certificate m={m} cert={cert} />}

      <section className="guestbook">
        <h3>방명록</h3>
        {!m.messages?.length && <p className="muted">아직 남겨진 조문이 없어요. 첫 조문객이 되어 주세요.</p>}
        <ul>
          {(m.messages || []).map((c) => <li key={c.id}>“{c.story}”</li>)}
        </ul>
      </section>
    </div>
  )
}

function CondolenceForm({ m, onDone }) {
  const [f, setF] = useState({ story: '', price: 129000, wears: 8, state: 'closet', regret: true })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    if (hasBadWord(f.story)) return setErr('고인(유니폼)에 대한 예의를 지켜주세요. 욕설은 남길 수 없어요.')
    if (f.price < 0 || f.price > 2000000) return setErr('구매 가격을 다시 확인해 주세요.')
    if (f.wears < 1 || f.wears > 999) return setErr('입은 횟수는 1회 이상이어야 해요.')
    setBusy(true)
    setErr('')
    try {
      const res = await addCondolence(m.id, { ...f, story: f.story.trim().slice(0, 60) })
      onDone({ ...res, form: f })
    } catch (e2) {
      setErr(e2.message || '잠시 후 다시 시도해 주세요.')
      setBusy(false)
    }
  }

  return (
    <form className="condole" id="condole" onSubmit={submit}>
      <h3>조문록 작성</h3>
      <p className="muted">故 {m.name} 마킹 유니폼을 가진 팬이라면 남겨주세요. 개인정보는 받지 않아요.</p>
      <div className="grid2">
        <label>구매 가격(원)<input type="number" min="0" step="1000" value={f.price} onChange={set('price')} /></label>
        <label>입은 횟수<input type="number" min="1" value={f.wears} onChange={set('wears')} /></label>
      </div>
      <label>지금 유니폼은…
        <div className="chips">
          {STATES.map((st) => (
            <button type="button" key={st.id} className={f.state === st.id ? 'chip on' : 'chip'} onClick={() => setF({ ...f, state: st.id })}>{st.label}</button>
          ))}
        </div>
      </label>
      <label>다시 그때로 돌아간다면 마킹을…
        <div className="chips">
          <button type="button" className={f.regret ? 'chip on' : 'chip'} onClick={() => setF({ ...f, regret: true })}>안 한다</button>
          <button type="button" className={!f.regret ? 'chip on' : 'chip'} onClick={() => setF({ ...f, regret: false })}>그래도 한다</button>
        </div>
      </label>
      <label>한 줄 추모 (선택, 60자)
        <input type="text" maxLength={60} placeholder="예: 집에서만 입어요. 밖에선 못 입어요." value={f.story} onChange={set('story')} />
      </label>
      {err && <p className="err">{err}</p>}
      <button className="btn gold wide" disabled={busy}>조문하고 사망진단서 받기</button>
    </form>
  )
}

function Certificate({ m, cert }) {
  const ref = useRef(null)
  const [msg, setMsg] = useState('')
  const f = cert.form
  const perWear = f.wears ? f.price / f.wears : 0
  const today = new Date().toLocaleDateString('ko-KR')
  useEffect(() => { ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }, [])

  const save = async () => {
    try {
      const url = await toPng(ref.current, { pixelRatio: 2, cacheBust: true })
      const a = document.createElement('a')
      a.href = url
      a.download = `유니폼-사망진단서-${m.name}.png`
      a.click()
    } catch {
      setMsg('이미지 저장에 실패했어요. 화면을 캡처해 주세요.')
    }
  }
  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: `故 ${m.name} 마킹 추모관`, url })
      else { await navigator.clipboard.writeText(url); setMsg('빈소 링크를 복사했어요.') }
    } catch { /* 취소 */ }
  }

  return (
    <section className="cert-wrap">
      <div className="cert" ref={ref}>
        <div className="cert-head">
          <span>유니폼 사망진단서</span>
          <small>마킹 유니폼 추모관 발급</small>
        </div>
        <div className="cert-body">
          <div className="cert-jersey">
            <Jersey sport={m.sport} name={m.name} number={m.number} main={m.main} accent={m.accent} size={130} faded />
          </div>
          <dl>
            <dt>고인</dt><dd>故 {m.name} 마킹 (No.{m.number})</dd>
            <dt>소속</dt><dd>前 {m.team}</dd>
            <dt>사인</dt><dd>{reasonLabel(m.reason)}</dd>
            <dt>현재 상태</dt><dd>{stateLabel(f.state)}</dd>
            <dt>1회 착용당</dt><dd className="big">{won(perWear)}</dd>
          </dl>
        </div>
        <p className="cert-line">“{certificateLine(m, f.state, m.id + cert.visitorNo)}”</p>
        <div className="cert-foot">
          <span>조문객 No.{cert.visitorNo.toLocaleString()}</span>
          <span>당신 외 {(cert.visitorNo - 1).toLocaleString()}명이 같은 아픔을 겪었습니다</span>
          <span>{today}</span>
        </div>
      </div>
      <div className="cert-actions">
        <button className="btn gold" onClick={save}>이미지로 저장</button>
        <button className="btn ghost" onClick={share}>빈소 링크 공유</button>
        <a className="btn ghost" href="#/risk">다음 마킹 위험도 진단 →</a>
      </div>
      {msg && <p className="muted center">{msg}</p>}
    </section>
  )
}
