import { useId } from 'react'
import { BLANK_KIT } from './teams.js'

// 축구 유니폼 뒷면. viewBox 300 x 330
const P = {
  full: 'M108 22 Q150 40 192 22 L236 36 Q268 52 292 92 L262 130 L232 112 L234 312 Q150 322 66 312 L68 112 L38 130 L8 92 Q32 52 64 36 Z',
  torso: 'M108 22 Q150 40 192 22 L236 36 Q226 72 232 112 L234 312 Q150 322 66 312 L68 112 Q74 72 64 36 Z',
  cuffL: 'M8 92 L38 130 L47 123 L17 85 Z',
  cuffR: 'M292 92 L262 130 L253 123 L283 85 Z',
  cuffL2: 'M17 85 L47 123 L53 118 L23 80 Z',
  cuffR2: 'M283 85 L253 123 L247 118 L277 80 Z',
  collar: 'M108 22 Q150 40 192 22 L198 31 Q150 52 102 31 Z',
  collarShadow: 'M102 31 Q150 52 198 31 L198 36 Q150 58 102 36 Z',
  hem: 'M66 304 Q150 314 234 304 L234 312 Q150 322 66 312 Z',
}

export default function Jersey({ kit, name = '', number = '', size = 300, lite = false, className, peelProgress = 0, tapeName = '' }) {
  const uid = 'j' + useId().replace(/[^a-zA-Z0-9]/g, '')
  const k = kit || BLANK_KIT
  const nm = String(name || '').toUpperCase().slice(0, 12)
  const no = String(number ?? '').slice(0, 2)
  const hangul = /[가-힣ㄱ-ㅎ]/.test(nm)
  const len = nm.length
  const nameSize = hangul ? (len <= 3 ? 30 : len <= 5 ? 25 : 19) : (len <= 5 ? 31 : len <= 8 ? 26 : len <= 10 ? 21 : 18)

  const baseball = k.sport === 'baseball'
  const blockFont = "'Graduate', 'Oswald', 'Noto Sans KR', serif"
  const arcSize = hangul ? (len <= 3 ? 28 : len <= 5 ? 23 : 18) : (len <= 5 ? 27 : len <= 8 ? 22 : len <= 10 ? 18 : 15)
  const peel = Math.max(0, Math.min(1, peelProgress || 0))
  const markOpacity = Math.max(0.06, 1 - peel * 1.1)
  const markTilt = peel > 0 ? `rotate(${(peel * 7).toFixed(1)} 150 150) translate(0 ${(peel * 6).toFixed(1)})` : undefined
  const tape = String(tapeName || '').trim().toUpperCase().slice(0, 12)

  const stripes = []
  if (k.stripes) for (let x = 150 - 11 - 44 * 3; x < 300; x += 44) stripes.push(<rect key={x} x={x} y="0" width="22" height="330" fill={k.stripes} />)
  const pins = []
  if (k.pin) for (let x = 6; x < 300; x += 9) pins.push(<rect key={x} x={x} y="0" width="1.3" height="330" fill={k.pin} opacity="0.8" />)

  return (
    <svg className={className} viewBox="0 0 300 330" width={size} height={size * 1.1} role="img"
      aria-label={nm ? `${nm} ${no}번 유니폼` : '빈 유니폼'} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <clipPath id={uid + 'c'}><path d={P.full} /></clipPath>
        <clipPath id={uid + 't'}><path d={P.torso} /></clipPath>
        <linearGradient id={uid + 'side'} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.28" />
          <stop offset="0.22" stopColor="#000" stopOpacity="0" />
          <stop offset="0.46" stopColor="#fff" stopOpacity="0.1" />
          <stop offset="0.74" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id={uid + 'top'} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.14" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.2" />
        </linearGradient>
        {!lite && (
          <>
            <pattern id={uid + 'mesh'} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="4" height="4" fill="transparent" />
              <rect width="1" height="4" fill="#000" opacity="0.045" />
            </pattern>
            <filter id={uid + 'blur'} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" /></filter>
          </>
        )}
      </defs>

      <path d={P.full} fill={k.sleeve || k.body} />
      <g clipPath={`url(#${uid}c)`}>
        <path d={P.torso} fill={k.body} />
        {k.stripes && <g clipPath={`url(#${uid}t)`}>{stripes}</g>}
        {k.pin && <g>{pins}</g>}
        {k.hem && <path d={P.hem} fill={k.hem} />}
        {k.panel && nm && <rect x="74" y="68" width="152" height="40" rx="3" fill={k.panel} />}
        <path d={P.cuffL} fill={k.cuff} />
        <path d={P.cuffR} fill={k.cuff} />
        {k.cuff2 && <><path d={P.cuffL2} fill={k.cuff2} /><path d={P.cuffR2} fill={k.cuff2} /></>}
        {k.piping && (
          <>
            <path d="M64 36 Q74 72 68 112" stroke={k.piping} strokeWidth="3" fill="none" />
            <path d="M236 36 Q226 72 232 112" stroke={k.piping} strokeWidth="3" fill="none" />
          </>
        )}
        <path d={P.collarShadow} fill="#000" opacity="0.16" />
        <path d={P.collar} fill={k.collar} />

        {/* 봉제선 */}
        <path d="M64 36 Q74 72 68 112" stroke="#000" strokeOpacity="0.2" strokeWidth="1.3" fill="none" />
        <path d="M236 36 Q226 72 232 112" stroke="#000" strokeOpacity="0.2" strokeWidth="1.3" fill="none" />
        <path d="M68 300 Q150 310 232 300" stroke="#000" strokeOpacity="0.16" strokeWidth="1" strokeDasharray="3 3" fill="none" />

        {/* 주름과 음영 */}
        {!lite && (
          <g filter={`url(#${uid}blur)`}>
            <path d="M92 128 Q112 220 98 314" stroke="#000" strokeOpacity="0.13" strokeWidth="12" fill="none" />
            <path d="M208 128 Q188 220 202 314" stroke="#000" strokeOpacity="0.13" strokeWidth="12" fill="none" />
            <path d="M150 118 Q158 220 148 316" stroke="#fff" strokeOpacity="0.09" strokeWidth="18" fill="none" />
            <path d="M70 116 Q84 100 74 70" stroke="#000" strokeOpacity="0.24" strokeWidth="7" fill="none" />
            <path d="M230 116 Q216 100 226 70" stroke="#000" strokeOpacity="0.24" strokeWidth="7" fill="none" />
            <path d="M30 100 Q46 96 52 118" stroke="#000" strokeOpacity="0.14" strokeWidth="8" fill="none" />
            <path d="M270 100 Q254 96 248 118" stroke="#000" strokeOpacity="0.14" strokeWidth="8" fill="none" />
          </g>
        )}
        {!lite && <rect width="300" height="330" fill={`url(#${uid}mesh)`} />}
        <rect width="300" height="330" fill={`url(#${uid}side)`} />
        <rect width="300" height="330" fill={`url(#${uid}top)`} />
      </g>
      <path d={P.full} fill="none" stroke="rgba(0,0,0,.4)" strokeWidth="1.2" />

      {/* 접착제 자국 (분리수거 마킹 박리 시 드러남) */}
      {peel > 0.05 && nm && (
        <text x="150" y="99" textAnchor="middle" fontFamily={hangul ? "'Noto Sans KR', sans-serif" : "'Oswald', 'Noto Sans KR', sans-serif"}
          fontWeight={hangul ? 900 : 700} fontSize={nameSize} letterSpacing={hangul ? 2 : 3.5}
          fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.2" strokeDasharray="3 2" opacity={Math.min(0.65, peel)}>{nm}</text>
      )}
      {peel > 0.05 && no && (
        <text x="150" y="236" textAnchor="middle" fontFamily={baseball ? blockFont : "'Oswald', sans-serif"} fontWeight="700"
          fontSize={baseball ? (no.length > 1 ? 112 : 124) : (no.length > 1 ? 130 : 140)}
          fill="none" stroke="rgba(255,255,255,0.24)" strokeWidth="1.5" strokeDasharray="4 3" opacity={Math.min(0.6, peel)}>{no}</text>
      )}

      <g opacity={markOpacity} transform={markTilt}>
        {nm && !baseball && (
          <text x="150" y="99" textAnchor="middle" fontFamily={hangul ? "'Noto Sans KR', sans-serif" : "'Oswald', 'Noto Sans KR', sans-serif"}
            fontWeight={hangul ? 900 : 700} fontSize={nameSize} letterSpacing={hangul ? 2 : 3.5} fill={k.name}>{nm}</text>
        )}
        {/* 야구: 아치형 이름 + 블록체 번호 */}
        {nm && baseball && (
          <>
            <path id={uid + 'arc'} d="M70 112 Q150 72 230 112" fill="none" />
            <text fontFamily={hangul ? "'Noto Sans KR', sans-serif" : blockFont} fontWeight={hangul ? 900 : 400} fontSize={arcSize} letterSpacing={hangul ? 3 : 2.5} fill={k.name}>
              <textPath href={`#${uid}arc`} startOffset="50%" textAnchor="middle">{nm}</textPath>
            </text>
          </>
        )}
        {no && baseball && (
          <text x="150" y="238" textAnchor="middle" fontFamily={blockFont} fontSize={no.length > 1 ? 112 : 124} fill={k.num}
            stroke={k.numStroke || 'none'} strokeWidth={k.numStroke ? 6 : 0} paintOrder="stroke" strokeLinejoin="round">{no}</text>
        )}
        {no && !baseball && (
          <text x="150" y="236" textAnchor="middle" fontFamily="'Oswald', sans-serif" fontWeight="700"
            fontSize={no.length > 1 ? 130 : 140} fill={k.num} stroke={k.numStroke || 'none'} strokeWidth={k.numStroke ? 7 : 0}
            paintOrder="stroke" strokeLinejoin="round">{no}</text>
        )}
      </g>

      {/* 청테이프 마킹갈이 */}
      {tape && (
        <g transform="rotate(-2.2 150 92)">
          <rect x="64" y="68" width="172" height="44" rx="2" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1.5" />
          <rect x="64" y="68" width="172" height="10" fill="rgba(255,255,255,0.18)" />
          <text x="150" y="99" textAnchor="middle" fontFamily="'Noto Sans KR', sans-serif" fontWeight="900"
            fontSize={tape.length <= 5 ? 24 : 18} letterSpacing="1.5" fill="#ffffff" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>{tape}</text>
        </g>
      )}
    </svg>
  )
}
