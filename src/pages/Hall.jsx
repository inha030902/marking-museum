import { useEffect, useState } from 'react'
import { SPORTS, sportOf } from '../constants.js'
import { listMemorials, sportSummary } from '../store.js'
import Frame from '../components/Frame.jsx'

export default function Hall({ sport }) {
  const current = sportOf(sport || 'soccer')
  const [list, setList] = useState([])
  const [sum, setSum] = useState(null)

  useEffect(() => {
    listMemorials(current.id).then(setList)
    sportSummary(current.id).then(setSum)
  }, [current.id])

  const top = list.slice(0, 5)

  return (
    <>
      <section className="hero">
        <p className="hero-kicker">MUSEUM OF DEPARTED MARKINGS</p>
        <h1>떠난 선수의 이름을 새긴<br />유니폼을 모십니다</h1>
        <p className="hero-sub">이름 마킹까지 했는데 그 선수가 떠났나요? 당신의 유니폼은 혼자가 아닙니다.</p>
        <div className="hero-cta">
          <a className="btn gold" href={`#/enshrine/${current.id}`}>내 유니폼 안치하기</a>
          <a className="btn ghost" href="#/risk">다음 마킹 위험도 진단</a>
        </div>
      </section>

      <nav className="halls" aria-label="종목별 전시관">
        {SPORTS.map((s) => (
          <a key={s.id} href={`#/sport/${s.id}`} className={s.id === current.id ? 'hall-tab on' : 'hall-tab'}>
            <span className="hall-no">{s.hall}</span>
            <span className="hall-name">{s.icon} {s.label}</span>
          </a>
        ))}
      </nav>

      {sum && (
        <section className="summary">
          <div><b>{sum.exhibits}</b><span>전시 중인 선수</span></div>
          <div><b>{sum.jerseys.toLocaleString()}</b><span>함께 잠든 유니폼</span></div>
          <div><b>{sum.regretRate}%</b><span>다시 산다면 안 산다</span></div>
          <div><b>{sum.avgLife}시즌</b><span>마킹 평균 수명</span></div>
        </section>
      )}

      <section className="wall" aria-label={`${current.label} 전시관`}>
        <div className="wall-title">
          <h2>{current.hall} · {current.label}</h2>
          <p>조명 아래 유니폼을 눌러 조문하세요</p>
        </div>
        <div className="frames">
          {list.map((m) => <Frame key={m.id} m={m} />)}
          <a className="frame empty" href={`#/enshrine/${current.id}`}>
            <span>＋</span>
            <p>빈 자리<br /><small>당신의 유니폼을 걸어주세요</small></p>
          </a>
        </div>
      </section>

      {top.length > 0 && (
        <section className="ranking">
          <h2>가장 많은 마킹을 남기고 떠난 선수</h2>
          <ol>
            {top.map((m, i) => (
              <li key={m.id}>
                <a href={`#/m/${m.id}`}>
                  <span className="rank">{i + 1}</span>
                  <span className="rk-name">故 {m.name} <small>前 {m.team} · No.{m.number}</small></span>
                  <span className="rk-count">{m.count.toLocaleString()}벌</span>
                </a>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  )
}
