export const SPORTS = [
  { id: 'soccer', label: '축구', icon: '⚽', hall: '제1전시관' },
  { id: 'baseball', label: '야구', icon: '⚾', hall: '제2전시관' },
  { id: 'basketball', label: '농구', icon: '🏀', hall: '제3전시관' },
  { id: 'esports', label: 'e스포츠', icon: '🎮', hall: '제4전시관' },
]

export const sportOf = (id) => SPORTS.find((s) => s.id === id) || SPORTS[0]

export const REASONS = [
  { id: 'fa', label: 'FA 이적' },
  { id: 'rival', label: '라이벌 팀 이적' },
  { id: 'trade', label: '트레이드' },
  { id: 'abroad', label: '해외 진출' },
  { id: 'retire', label: '은퇴' },
  { id: 'release', label: '방출' },
]

export const STATES = [
  { id: 'closet', label: '옷장 깊숙이 봉인' },
  { id: 'pajama', label: '잠옷으로 사용 중' },
  { id: 'tape', label: '테이프로 이름 가림' },
  { id: 'resell', label: '중고 거래 고민 중' },
  { id: 'still', label: '아직도 입고 다님' },
]

export const reasonLabel = (id) => REASONS.find((r) => r.id === id)?.label || id
export const stateLabel = (id) => STATES.find((r) => r.id === id)?.label || id

export const COLORS = [
  { main: '#c8102e', accent: '#ffffff' },
  { main: '#0b3d91', accent: '#ffffff' },
  { main: '#1d1d1f', accent: '#f5c518' },
  { main: '#ffffff', accent: '#0b3d91' },
  { main: '#006b3f', accent: '#ffd400' },
  { main: '#5b2a86', accent: '#ffffff' },
  { main: '#f47b20', accent: '#1d1d1f' },
  { main: '#7fb2e5', accent: '#14213d' },
]

export const go = (path) => { window.location.hash = '#/' + path }

export const won =(n) => '₩' + Math.round(n || 0).toLocaleString('ko-KR')
