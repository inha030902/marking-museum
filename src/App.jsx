import { useEffect, useState } from 'react'
import Hall from './pages/Hall.jsx'
import Exhibit from './pages/Exhibit.jsx'
import Enshrine from './pages/Enshrine.jsx'
import Risk from './pages/Risk.jsx'

function parse() {
  const h = window.location.hash.replace(/^#\/?/, '')
  const [page, arg] = h.split('/')
  return { page: page || 'hall', arg: arg ? decodeURIComponent(arg) : '' }
}

export default function App() {
  const [route, setRoute] = useState(parse())
  useEffect(() => {
    const on = () => { setRoute(parse()); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="#/">
          <span className="brand-candle">🕯️</span>
          <span>
            <b>마킹 유니폼 추모관</b>
            <small>떠난 선수, 남은 유니폼</small>
          </span>
        </a>
        <nav className="topnav">
          <a href="#/" className={route.page === 'hall' ? 'on' : ''}>전시관</a>
          <a href="#/enshrine" className={route.page === 'enshrine' ? 'on' : ''}>안치하기</a>
          <a href="#/risk" className={route.page === 'risk' ? 'on' : ''}>마킹 위험도</a>
        </nav>
      </header>
      <main>
        {route.page === 'hall' && <Hall sport={route.arg} />}
        {route.page === 'sport' && <Hall sport={route.arg} />}
        {route.page === 'm' && <Exhibit id={route.arg} />}
        {route.page === 'enshrine' && <Enshrine presetSport={route.arg} />}
        {route.page === 'risk' && <Risk />}
      </main>
      <footer className="foot">
        모든 예시 선수와 팀은 가상입니다 · 실제 구단·선수와 무관합니다 · 젝커톤 2026
      </footer>
    </div>
  )
}
