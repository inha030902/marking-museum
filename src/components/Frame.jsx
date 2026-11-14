import Jersey from '../Jersey.jsx'

export default function Frame({ m }) {
  return (
    <a className="frame" href={`#/m/${m.id}`}>
      <div className="spot" aria-hidden="true" />
      <div className="case">
        <span className="ribbon" aria-hidden="true" />
        <Jersey sport={m.sport} name={m.name} number={m.number} main={m.main} accent={m.accent} size={150} />
      </div>
      <div className="plaque">
        <b>故 {m.name}</b>
        <span>前 {m.team} · No.{m.number}</span>
        <em>함께 잠든 유니폼 {m.count.toLocaleString()}벌</em>
      </div>
    </a>
  )
}
