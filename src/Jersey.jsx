import { useId } from 'react'

// 유니폼 뒷면(이름 + 등번호)을 종목별 실루엣으로 그린다.
const SHAPES = {
  soccer:
    'M62 18 L84 8 Q100 20 116 8 L138 18 L186 48 L170 86 L150 76 L150 208 L50 208 L50 76 L30 86 L14 48 Z',
  baseball:
    'M60 20 L84 10 Q100 16 116 10 L140 20 L190 58 L172 98 L150 84 L150 208 L50 208 L50 84 L28 98 L10 58 Z',
  basketball:
    'M66 10 L82 10 Q100 34 118 10 L134 10 Q138 52 160 64 L160 208 L40 208 L40 64 Q62 52 66 10 Z',
  esports:
    'M62 18 L84 8 Q100 18 116 8 L138 18 L194 74 L174 96 L150 74 L150 208 L50 208 L50 74 L26 96 L6 74 Z',
}

export default function Jersey({ sport = 'soccer', name = '', number = '', main = '#c8102e', accent = '#fff', size = 200, faded = false }) {
  const d = SHAPES[sport] || SHAPES.soccer
  const nm = (name || '이름').slice(0, 8)
  const nameSize = nm.length <= 3 ? 20 : nm.length <= 5 ? 16 : 12
  const clipId = 'clip' + useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <svg viewBox="0 0 200 216" width={size} height={size * 1.08} role="img" aria-label={`${name} ${number}번 유니폼`}
      style={{ filter: faded ? 'grayscale(0.35) brightness(0.92)' : 'none', display: 'block' }}>
      <defs>
        <clipPath id={clipId}><path d={d} /></clipPath>
        <linearGradient id={clipId + 'g'} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.18" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.22" />
        </linearGradient>
      </defs>
      <path d={d} fill={main} stroke="rgba(0,0,0,.35)" strokeWidth="1.5" />
      <g clipPath={`url(#${clipId})`}>
        {sport === 'baseball' && (
          <>
            <path d="M60 20 L84 10 L28 98 L10 58 Z M140 20 L116 10 L172 98 L190 58 Z" fill={accent} opacity="0.9" />
            <rect x="0" y="200" width="200" height="8" fill={accent} opacity="0.9" />
          </>
        )}
        {sport === 'basketball' && (
          <path d="M66 10 Q62 52 40 64 L46 64 Q68 54 72 10 Z M134 10 Q138 52 160 64 L154 64 Q132 54 128 10 Z" fill={accent} />
        )}
        {sport === 'soccer' && <path d="M84 8 Q100 20 116 8 L112 6 Q100 15 88 6 Z" fill={accent} />}
        {sport === 'esports' && (
          <>
            <path d="M0 120 L200 60 L200 74 L0 134 Z" fill={accent} opacity="0.85" />
            <path d="M0 140 L200 80 L200 86 L0 146 Z" fill={accent} opacity="0.5" />
            <path d="M6 74 L26 96 L32 90 L12 68 Z M194 74 L174 96 L168 90 L188 68 Z" fill={accent} />
          </>
        )}
        <rect x="0" y="0" width="200" height="216" fill={`url(#${clipId}g)`} />
      </g>
      <text x="100" y="62" textAnchor="middle" fontFamily="'Noto Sans KR', sans-serif" fontWeight="900"
        fontSize={nameSize} fill={accent} letterSpacing="2">{nm}</text>
      <text x="100" y="150" textAnchor="middle" fontFamily="'Noto Sans KR', sans-serif" fontWeight="900"
        fontSize="74" fill={accent} stroke="rgba(0,0,0,.25)" strokeWidth="1">{String(number || '0').slice(0, 2)}</text>
    </svg>
  )
}
