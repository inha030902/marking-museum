import { useEffect, useState } from 'react'
import Jersey from '../Jersey.jsx'
import { COLORS, REASONS, SPORTS, go, sportOf } from '../constants.js'
import { createMemorial, findDuplicates, hasBadWord } from '../store.js'

const thisYear = new Date().getFullYear()

export default function Enshrine({ presetSport }) {
  const [f, setF] = useState({
    sport: sportOf(presetSport || 'soccer').id,
    name: '', team: '', number: '',
    reason: 'fa', from: thisYear - 2, to: thisYear,
    color: 0,
  })
  const [dups, setDups] = useState([])
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  useEffect(() => {
    const t = setTimeout(() => findDuplicates(f.sport, f.name).then(setDups), 200)
    return () => clearTimeout(t)
  }, [f.sport, f.name])

  const c = COLORS[f.color]

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    const name = f.name.trim(), team = f.team.trim()
    if (!name || !team) return setErr('선수 이름과 떠나기 전 팀은 꼭 적어주세요.')
    if (hasBadWord(name + team)) return setErr('고인(유니폼)에 대한 예의를 지켜주세요.')
    const num = parseInt(f.number, 10)
    if (Number.isNaN(num) || num < 0 || num > 99) return setErr('등번호는 0~99 사이 숫자로 적어주세요.')
    if (Number(f.from) > Number(f.to)) return setErr('함께한 기간을 다시 확인해 주세요.')
    try {
      const { memorial } = await createMemorial({
        sport: f.sport, name, team, number: num, reason: f.reason,
        from: Number(f.from), to: Number(f.to), main: c.main, accent: c.accent,
      })
      go('m/' + memorial.id)
    } catch (e2) {
      setErr(e2.message || '잠시 후 다시 시도해 주세요.')
    }
  }

  const fillExample = () => setF({ ...f, name: '도망자', team: '한강 유나이티드', number: '11', reason: 'rival', color: 1 })

  return (
    <div className="enshrine">
      <section className="en-head">
        <h1>유니폼 안치 신청서</h1>
        <p>선수 한 명당 빈소는 하나예요. 이미 빈소가 있으면 그곳으로 조문하러 가요.</p>
        <button type="button" className="link" onClick={fillExample}>예시로 채워보기</button>
      </section>

      <div className="en-grid">
        <form className="en-form" onSubmit={submit}>
          <label>종목
            <div className="chips">
              {SPORTS.map((s) => (
                <button type="button" key={s.id} className={f.sport === s.id ? 'chip on' : 'chip'} onClick={() => setF({ ...f, sport: s.id })}>{s.icon} {s.label}</button>
              ))}
            </div>
          </label>
          <label>선수 이름 (마킹된 이름)
            <input value={f.name} maxLength={10} onChange={set('name')} placeholder="예: 강태풍" />
          </label>
          {dups.length > 0 && (
            <div className="dup">
              <p>이미 전시 중인 빈소가 있어요</p>
              {dups.map((d) => (
                <a key={d.id} href={`#/m/${d.id}`}>故 {d.name} · 前 {d.team} · {d.count}벌 잠듦 → 조문하러 가기</a>
              ))}
              <small>같은 이름의 다른 선수라면 아래를 계속 작성하세요.</small>
            </div>
          )}
          <div className="grid2">
            <label>떠나기 전 팀<input value={f.team} maxLength={16} onChange={set('team')} placeholder="예: 한강 유나이티드" /></label>
            <label>등번호<input value={f.number} inputMode="numeric" maxLength={2} onChange={set('number')} placeholder="10" /></label>
          </div>
          <label>사인 (떠난 이유)
            <div className="chips">
              {REASONS.map((r) => (
                <button type="button" key={r.id} className={f.reason === r.id ? 'chip on' : 'chip'} onClick={() => setF({ ...f, reason: r.id })}>{r.label}</button>
              ))}
            </div>
          </label>
          <div className="grid2">
            <label>함께한 시작 연도<input type="number" min="1990" max={thisYear} value={f.from} onChange={set('from')} /></label>
            <label>떠난 연도<input type="number" min="1990" max={thisYear} value={f.to} onChange={set('to')} /></label>
          </div>
          <label>유니폼 색
            <div className="swatches">
              {COLORS.map((col, i) => (
                <button type="button" key={i} aria-label={`색 ${i + 1}`} className={f.color === i ? 'sw on' : 'sw'}
                  style={{ background: `linear-gradient(135deg, ${col.main} 60%, ${col.accent} 60%)` }} onClick={() => setF({ ...f, color: i })} />
              ))}
            </div>
          </label>
          {err && <p className="err">{err}</p>}
          <button className="btn gold wide">전시관에 안치하기</button>
        </form>

        <aside className="en-preview">
          <div className="frame preview">
            <div className="spot" aria-hidden="true" />
            <div className="case">
              <span className="ribbon" aria-hidden="true" />
              <Jersey sport={f.sport} name={f.name || '이름'} number={f.number || '0'} main={c.main} accent={c.accent} size={200} />
            </div>
            <div className="plaque">
              <b>故 {f.name || '선수 이름'}</b>
              <span>前 {f.team || '팀 이름'} · No.{f.number || '0'}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
