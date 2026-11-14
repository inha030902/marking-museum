import { useState } from 'react'
import Jersey from './Jersey.jsx'
import { LEAGUES, teamById } from './teams.js'
import { buildRanking } from './ranking.js'

const TABS = [['all', '전체'], ...LEAGUES.map((l) => [l.id, l.label])]
const leagueOf = (teamId) => LEAGUES.find((l) => l.teams.some((t) => t.id === teamId))?.id
const BOARDS = [
  { type: 'farewell', kicker: 'MOST RETIRED', title: '가장 많이 보낸 유니폼', unit: '벌 헌액' },
  { type: 'burn', kicker: 'MOST BURNED', title: '가장 많이 소각한 유니폼', unit: '벌 소각' },
]

// 랭킹: 이름과 팀 기준으로 가장 많이 보낸 유니폼, 가장 많이 소각한 유니폼
export default function Ranking({ items }) {
  const [lg, setLg] = useState('all')

  return (
    <main className="gallery ranking">
      <div className="g-hero">
        <p className="kicker">RANKING</p>
        <h1>유니폼 랭킹</h1>
        <p className="lead">팬들이 가장 많이 보내준 이름과 가장 많이 태운 이름. 내가 정리한 유니폼도 여기에 더해져요.</p>
        <div className="g-tabs r-tabs">
          {TABS.map(([id, label]) => (
            <button key={id} type="button" className={lg === id ? 'on' : ''} onClick={() => setLg(id)}>{label}</button>
          ))}
        </div>
      </div>

      <div className="r-boards" key={lg}>
        {BOARDS.map((b) => {
          const ranked = buildRanking(b.type, items)
            .filter((r) => teamById(r.teamId) && (lg === 'all' || leagueOf(r.teamId) === lg))
            .map((r, i) => ({ ...r, rank: i + 1 }))
          const rows = [...ranked.slice(0, 8), ...ranked.slice(8).filter((r) => r.mine).slice(0, 3)]
          const max = ranked[0]?.count || 1
          return (
            <section className={`r-board ${b.type}`} key={b.type}>
              <p className="r-kick">{b.kicker}</p>
              <h2>{b.title}</h2>
              <ol>
                {rows.map((r, i) => {
                  const team = teamById(r.teamId)
                  return (
                    <li key={`${r.teamId}-${r.name}`} className={`${r.rank === 1 ? 'first' : ''} ${r.mine ? 'mine' : ''}`} style={{ animationDelay: `${i * 45}ms` }}>
                      <span className="r-rank">{r.rank}</span>
                      <span className="r-jersey"><Jersey kit={team.kit} name={r.name} number={r.number} size={r.rank === 1 ? 84 : 52} lite /></span>
                      <span className="r-name">
                        <b>{r.name}{r.mine && <i>MY</i>}</b>
                        <small>{team.name} · No.{r.number}</small>
                      </span>
                      <span className="r-count">
                        <b>{r.count.toLocaleString()}</b><small>{b.unit}</small>
                        <i className="r-bar"><i style={{ width: `${Math.max(4, (r.count / max) * 100)}%` }} /></i>
                      </span>
                    </li>
                  )
                })}
              </ol>
            </section>
          )
        })}
      </div>
      <p className="r-note">랭킹은 예시 데이터에 이 브라우저의 내 기록을 더해 보여주는 미리보기입니다.</p>
    </main>
  )
}
