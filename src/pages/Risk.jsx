import { useEffect, useState } from 'react'
import { SPORTS } from '../constants.js'
import { sportSummary } from '../store.js'

const QUESTIONS = [
  { id: 'contract', q: '계약은 얼마나 남았나요?', opts: [['1년 미만', 30], ['1~2년', 15], ['3년 이상', 0], ['잘 모르겠어요', 12]] },
  { id: 'age', q: '선수의 커리어 단계는?', opts: [['떠오르는 신인', 14], ['전성기', 18], ['베테랑', 10]] },
  { id: 'interview', q: '최근 인터뷰에서 자주 하는 말은?', opts: [['"새로운 도전"', 25], ['"우승하고 싶다"', 12], ['"팬들께 감사"', 6], ['"이 팀에서 은퇴하고 싶다"', -10]] },
  { id: 'team', q: '소속팀 최근 성적은?', opts: [['상위권', 0], ['중위권', 6], ['하위권', 12]] },
  { id: 'curse', q: '내가 이름을 새긴 선수가 떠난 적이 있나요?', opts: [['없어요', 0], ['1번', 8], ['2번', 16], ['3번 이상 (마킹의 저주)', 30]] },
]

function verdict(p) {
  if (p >= 85) return { tone: 'max', title: '본인 이름 마킹을 권장합니다', body: '당신은 이 팀을 떠나지 않으니까요. 영원히 이적하지 않는 유일한 선수는 바로 당신입니다.' }
  if (p >= 60) return { tone: 'high', title: '마킹은 재계약 발표 후로 미루세요', body: '지금 새기면 높은 확률로 추모관에서 다시 만나게 됩니다.' }
  if (p >= 30) return { tone: 'mid', title: '이름 대신 등번호만 새기세요', body: '번호는 다음 선수가 물려받을 수 있습니다. 재활용이 가능한 사랑입니다.' }
  return { tone: 'low', title: '안심 마킹 가능', body: '이 선수는 당분간 떠나지 않을 것 같아요. 단, 세탁은 찬물에 뒤집어서.' }
}

export default function Risk() {
  const [sport, setSport] = useState('soccer')
  const [ans, setAns] = useState({})
  const [sum, setSum] = useState(null)
  useEffect(() => { sportSummary(sport).then(setSum) }, [sport])

  const done = QUESTIONS.every((q) => ans[q.id] !== undefined)
  const raw = QUESTIONS.reduce((a, q) => a + (ans[q.id] ?? 0), 0)
  const pct = Math.max(3, Math.min(99, Math.round((raw / 115) * 100) + (sum ? Math.round((sum.regretRate - 50) / 5) : 0)))
  const v = verdict(pct)

  return (
    <div className="risk">
      <section className="en-head">
        <h1>다음 마킹 위험도 진단</h1>
        <p>새로 이름을 새기려는 선수가 있나요? 추모관에 다시 오지 않도록 미리 확인하세요.</p>
      </section>

      <div className="chips center">
        {SPORTS.map((s) => (
          <button key={s.id} className={sport === s.id ? 'chip on' : 'chip'} onClick={() => setSport(s.id)}>{s.icon} {s.label}</button>
        ))}
      </div>

      <div className="quiz">
        {QUESTIONS.map((q, i) => (
          <fieldset key={q.id} className="qcard">
            <legend><span className="qno">Q{i + 1}</span> {q.q}</legend>
            <div className="chips">
              {q.opts.map(([label, w]) => (
                <button type="button" key={label} className={ans[q.id] === w && ans[q.id + '_l'] === label ? 'chip on' : 'chip'}
                  onClick={() => setAns((a) => ({ ...a, [q.id]: w, [q.id + '_l']: label }))}>{label}</button>
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      {done ? (
        <section className={`verdict ${v.tone}`}>
          <p className="v-label">마킹 위험도</p>
          <div className="gauge"><span style={{ width: pct + '%' }} /></div>
          <p className="v-pct">{pct}%</p>
          <h2>{v.title}</h2>
          <p>{v.body}</p>
          {sum && (
            <p className="v-data">
              참고 · 이 종목 추모관 데이터: 마킹 평균 수명 <b>{sum.avgLife}시즌</b>, 팬 후회율 <b>{sum.regretRate}%</b> ({sum.jerseys.toLocaleString()}벌 기준)
            </p>
          )}
        </section>
      ) : (
        <p className="muted center">질문 {QUESTIONS.filter((q) => ans[q.id] !== undefined).length} / {QUESTIONS.length}</p>
      )}
    </div>
  )
}
