import { useState } from 'react'
import HoloCard from './HoloCard.jsx'
import { teamById } from './teams.js'

const TABS = [['all', '전체'], ['farewell', '🖼️ 액자 봉인'], ['burn', '🔥 태우기'], ['incinerate', '🏭 소각로'], ['recycle', '♻️ 분리수거']]
const fmt = (iso) => new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })

// 내 전시관: 4대 처분 의식으로 정리한 유니폼을 카드로 모아 보여준다
export default function Gallery({ items, onStart, onClear }) {
  const [tab, setTab] = useState('all')
  const valid = items.filter((it) => teamById(it.teamId))
  const f = valid.filter((it) => it.type === 'farewell').length
  const b = valid.filter((it) => it.type === 'burn' || it.type === 'incinerate').length
  const r = valid.filter((it) => it.type === 'recycle').length
  const totalCost = valid.reduce((acc, it) => acc + (Number(it.price) || 149000), 0)
  const shown = valid.filter((it) => tab === 'all' || it.type === tab)

  return (
    <main className="gallery">
      <div className="g-hero">
        <p className="kicker">MY COLLECTION · JERSEY AFTERLIFE</p>
        <h1>내 전시관</h1>
        <p className="lead">내가 성불시킨 유니폼이 이곳에 전시됩니다. 카드에 마우스를 올려 보세요.</p>
        <div className="g-stats">
          <div><b>{valid.length}</b><span>정리한 유니폼</span></div>
          <div className="gold"><b>{f}</b><span>액자 봉인</span></div>
          <div className="fire"><b>{b}</b><span>화형·소각</span></div>
          <div className="eco"><b>{r}</b><span>분리수거</span></div>
          <div><b>{(totalCost / 10000).toFixed(1)}<i>만원</i></b><span>성불된 매몰비용</span></div>
        </div>
      </div>

      {valid.length > 0 ? (
        <>
          <div className="g-bar">
            <div className="g-tabs">
              {TABS.map(([id, label]) => (
                <button key={id} type="button" className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>{label}</button>
              ))}
            </div>
            <button type="button" className="g-clear" onClick={onClear}>전시관 비우기</button>
          </div>
          <div className="g-grid">
            {shown.map((it, i) => (
              <figure className="g-card" key={it.id} style={{ animationDelay: `${Math.min(i, 12) * 60}ms` }}>
                <HoloCard team={teamById(it.teamId)} name={it.name} number={it.number} msg={it.msg} date={fmt(it.at)} variant={it.type} idle={false} tapeName={it.tapeName || ''} />
              </figure>
            ))}
            {shown.length === 0 && <p className="g-none">이 분류에는 아직 유니폼이 없어요.</p>}
          </div>
        </>
      ) : (
        <div className="g-empty">
          <p>아직 정리한 유니폼이 없어요.</p>
          <button type="button" className="cta" onClick={onStart}>첫 유니폼 정리하러 가기</button>
        </div>
      )}
    </main>
  )
}
