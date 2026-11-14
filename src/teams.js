// EPL 20개 팀 홈 유니폼 키트 (2025-26 시즌 참가팀 기준).
// 색·줄무늬·트림만 참고했고 구단 엠블럼과 스폰서 로고는 넣지 않는다.
// body 몸통 / sleeve 소매 / collar 목 / cuff 소매 끝 / stripes 세로 줄무늬 색
// num 등번호 / numStroke 번호 외곽선 / name 이름 / panel 이름 뒤 패널

export const BLANK_KIT = { body: '#f1f1f1', sleeve: '#f1f1f1', collar: '#d9d9d9', cuff: '#d9d9d9', num: '#c9c9c9', name: '#c9c9c9' }

export const TEAMS = [
  { id: 'arsenal', name: '아스널', en: 'ARSENAL', kit: { body: '#ef0107', sleeve: '#ffffff', collar: '#ffffff', cuff: '#ef0107', num: '#ffffff', name: '#ffffff' } },
  { id: 'villa', name: '애스턴 빌라', en: 'ASTON VILLA', kit: { body: '#670e36', sleeve: '#95bfe5', collar: '#95bfe5', cuff: '#670e36', num: '#ffffff', name: '#ffffff', hem: '#fee505' } },
  { id: 'bournemouth', name: '본머스', en: 'BOURNEMOUTH', kit: { body: '#da291c', stripes: '#0b0b0b', sleeve: '#0b0b0b', collar: '#0b0b0b', cuff: '#da291c', num: '#ffffff', numStroke: '#0b0b0b', name: '#ffffff', panel: '#0b0b0b' } },
  { id: 'brentford', name: '브렌트퍼드', en: 'BRENTFORD', kit: { body: '#ffffff', stripes: '#e30613', sleeve: '#e30613', collar: '#0b0b0b', cuff: '#0b0b0b', num: '#0b0b0b', numStroke: '#ffffff', name: '#0b0b0b', panel: '#ffffff' } },
  { id: 'brighton', name: '브라이턴', en: 'BRIGHTON', kit: { body: '#ffffff', stripes: '#0057b8', sleeve: '#0057b8', collar: '#0057b8', cuff: '#ffffff', num: '#0a2a66', numStroke: '#ffffff', name: '#0a2a66', panel: '#ffffff' } },
  { id: 'burnley', name: '번리', en: 'BURNLEY', kit: { body: '#6c1d45', sleeve: '#99d6ea', collar: '#6c1d45', cuff: '#6c1d45', num: '#99d6ea', name: '#99d6ea' } },
  { id: 'chelsea', name: '첼시', en: 'CHELSEA', kit: { body: '#034694', sleeve: '#034694', collar: '#ffffff', cuff: '#ffffff', num: '#ffffff', name: '#ffffff' } },
  { id: 'palace', name: '크리스털 팰리스', en: 'CRYSTAL PALACE', kit: { body: '#1b458f', stripes: '#c4122e', sleeve: '#1b458f', collar: '#c4122e', cuff: '#c4122e', num: '#ffffff', numStroke: '#0d2452', name: '#ffffff', panel: '#1b458f' } },
  { id: 'everton', name: '에버턴', en: 'EVERTON', kit: { body: '#003399', sleeve: '#003399', collar: '#ffffff', cuff: '#ffffff', num: '#ffffff', name: '#ffffff' } },
  { id: 'fulham', name: '풀럼', en: 'FULHAM', kit: { body: '#ffffff', sleeve: '#ffffff', collar: '#0b0b0b', cuff: '#0b0b0b', num: '#0b0b0b', name: '#0b0b0b', hem: '#cc0000' } },
  { id: 'leeds', name: '리즈 유나이티드', en: 'LEEDS', kit: { body: '#ffffff', sleeve: '#ffffff', collar: '#1d428a', cuff: '#ffcd00', num: '#1d428a', name: '#1d428a', hem: '#1d428a' } },
  { id: 'liverpool', name: '리버풀', en: 'LIVERPOOL', kit: { body: '#c8102e', sleeve: '#c8102e', collar: '#ffffff', cuff: '#ffffff', num: '#ffffff', name: '#ffffff' } },
  { id: 'mancity', name: '맨체스터 시티', en: 'MAN CITY', kit: { body: '#6cabdd', sleeve: '#6cabdd', collar: '#ffffff', cuff: '#1c2c5b', num: '#ffffff', name: '#ffffff' } },
  { id: 'manutd', name: '맨체스터 유나이티드', en: 'MAN UNITED', kit: { body: '#da291c', sleeve: '#da291c', collar: '#0b0b0b', cuff: '#0b0b0b', num: '#ffffff', name: '#ffffff' } },
  { id: 'newcastle', name: '뉴캐슬', en: 'NEWCASTLE', kit: { body: '#ffffff', stripes: '#111111', sleeve: '#111111', collar: '#111111', cuff: '#ffffff', num: '#111111', numStroke: '#ffffff', name: '#111111', panel: '#ffffff' } },
  { id: 'forest', name: '노팅엄 포리스트', en: 'NOTTM FOREST', kit: { body: '#dd0000', sleeve: '#dd0000', collar: '#ffffff', cuff: '#ffffff', num: '#ffffff', name: '#ffffff' } },
  { id: 'sunderland', name: '선덜랜드', en: 'SUNDERLAND', kit: { body: '#ffffff', stripes: '#eb172b', sleeve: '#eb172b', collar: '#0b0b0b', cuff: '#0b0b0b', num: '#0b0b0b', numStroke: '#ffffff', name: '#0b0b0b', panel: '#ffffff' } },
  { id: 'tottenham', name: '토트넘', en: 'TOTTENHAM', kit: { body: '#ffffff', sleeve: '#ffffff', collar: '#132257', cuff: '#132257', num: '#132257', name: '#132257' } },
  { id: 'westham', name: '웨스트햄', en: 'WEST HAM', kit: { body: '#7a263a', sleeve: '#1bb1e7', collar: '#1bb1e7', cuff: '#7a263a', num: '#ffffff', name: '#ffffff', hem: '#1bb1e7' } },
  { id: 'wolves', name: '울버햄프턴', en: 'WOLVES', kit: { body: '#fdb913', sleeve: '#fdb913', collar: '#231f20', cuff: '#231f20', num: '#231f20', name: '#231f20' } },
]

export const teamById = (id) => TEAMS.find((t) => t.id === id) || null
export const TEAM_IDS = TEAMS.map((t) => t.id)

// 카드·연출에 쓰는 팀 대표색 (흰 바탕 유니폼은 줄무늬나 번호 색을 쓴다)
export function mainColor(kit) {
  const white = kit.body.toLowerCase() === '#ffffff'
  if (white && kit.stripes) return kit.stripes
  return white ? kit.num : kit.body
}
