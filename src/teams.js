// EPL 20개 팀 홈 유니폼 키트 (2025-26 시즌 참가팀 기준).
// 색·줄무늬·트림만 참고했고 구단 엠블럼과 스폰서 로고는 넣지 않는다.
// body 몸통 / sleeve 소매 / collar 목 / cuff 소매 끝 / stripes 세로 줄무늬 색
// num 등번호 / numStroke 번호 외곽선 / name 이름 / panel 이름 뒤 패널

export const BLANK_KIT = { body: '#f1f1f1', sleeve: '#f1f1f1', collar: '#d9d9d9', cuff: '#d9d9d9', num: '#c9c9c9', name: '#c9c9c9' }

const EPL = [
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

// KBO 10개 팀 홈 유니폼. sport: 'baseball'이면 아치형 이름, 블록체 번호, 핀스트라이프(pin), 파이핑(piping), 2색 소매 끝(cuff2)을 쓴다.
const B = { sport: 'baseball', body: '#ffffff', sleeve: '#ffffff' }
const KBO = [
  { id: 'kia', name: 'KIA 타이거즈', en: 'KIA TIGERS', kit: { ...B, collar: '#ea0029', cuff: '#ea0029', cuff2: '#06141f', piping: '#06141f', num: '#ea0029', numStroke: '#06141f', name: '#06141f' } },
  { id: 'samsung', name: '삼성 라이온즈', en: 'SAMSUNG LIONS', kit: { ...B, collar: '#074ca1', cuff: '#074ca1', cuff2: '#c0c6cf', piping: '#074ca1', num: '#074ca1', name: '#074ca1' } },
  { id: 'lg', name: 'LG 트윈스', en: 'LG TWINS', kit: { ...B, pin: '#1a1a1a', collar: '#0b0b0b', cuff: '#0b0b0b', cuff2: '#c30452', num: '#0b0b0b', numStroke: '#c30452', name: '#0b0b0b' } },
  { id: 'doosan', name: '두산 베어스', en: 'DOOSAN BEARS', kit: { ...B, collar: '#131230', cuff: '#131230', cuff2: '#ed1c24', piping: '#131230', num: '#131230', numStroke: '#ed1c24', name: '#131230' } },
  { id: 'kt', name: 'KT 위즈', en: 'KT WIZ', kit: { ...B, collar: '#0b0b0b', cuff: '#0b0b0b', cuff2: '#eb1c24', piping: '#eb1c24', num: '#0b0b0b', numStroke: '#eb1c24', name: '#0b0b0b' } },
  { id: 'ssg', name: 'SSG 랜더스', en: 'SSG LANDERS', kit: { ...B, collar: '#ce0e2d', cuff: '#ce0e2d', cuff2: '#ffb81c', piping: '#ce0e2d', num: '#ce0e2d', name: '#ce0e2d' } },
  { id: 'lotte', name: '롯데 자이언츠', en: 'LOTTE GIANTS', kit: { ...B, collar: '#041e42', cuff: '#041e42', cuff2: '#d00f31', piping: '#041e42', num: '#041e42', numStroke: '#d00f31', name: '#041e42' } },
  { id: 'hanwha', name: '한화 이글스', en: 'HANWHA EAGLES', kit: { ...B, collar: '#fc4e00', cuff: '#fc4e00', cuff2: '#07111f', piping: '#fc4e00', num: '#fc4e00', numStroke: '#07111f', name: '#07111f' } },
  { id: 'nc', name: 'NC 다이노스', en: 'NC DINOS', kit: { ...B, collar: '#315288', cuff: '#315288', cuff2: '#af917b', piping: '#315288', num: '#315288', numStroke: '#af917b', name: '#315288' } },
  { id: 'kiwoom', name: '키움 히어로즈', en: 'KIWOOM HEROES', kit: { ...B, collar: '#570514', cuff: '#570514', cuff2: '#b07f35', piping: '#570514', num: '#570514', name: '#570514' } },
]

export const LEAGUES = [
  { id: 'epl', label: 'EPL', full: 'PREMIER LEAGUE', teams: EPL },
  { id: 'kbo', label: 'KBO', full: 'KBO LEAGUE', teams: KBO },
]
export const TEAMS = [...EPL, ...KBO]

export const teamById = (id) => TEAMS.find((t) => t.id === id) || null
export const TEAM_IDS = TEAMS.map((t) => t.id)

export const REASONS = [
  { id: 'betrayal', label: '🤬 라이벌 환승이적', desc: '금기된 팀으로 떠난 배신' },
  { id: 'money', label: '💸 FA 머니러시/먹튀', desc: '돈 따라 떠났거나 기대 이하' },
  { id: 'legend', label: '😭 아름다운 이별/레전드', desc: '박수 치며 보내주는 영웅' },
  { id: 'release', label: '♻️ 방출/임대복귀', desc: '아쉽지만 옷장 정리 대상' },
]

export const SCENARIOS = [
  { id: 'burn', label: '🔥 배신자 화형', leagueId: 'epl', teamId: 'arsenal', name: 'JUDAS', number: '10', price: 159000, reason: 'betrayal', msg: '라이벌 팀 가서도 잘 먹고 잘 살아라' },
  { id: 'incinerate', label: '🏭 먹튀 소각로', leagueId: 'kbo', teamId: 'lotte', name: 'MONEY', number: '25', price: 135000, reason: 'money', msg: '100억 받고 떠나니 속이 시원하냐' },
  { id: 'farewell', label: '🖼️ 레전드 액자', leagueId: 'epl', teamId: 'tottenham', name: 'SON', number: '7', price: 169000, reason: 'legend', msg: '10년 동안 우리 팀 심장이었다. 고맙다!' },
  { id: 'recycle', label: '♻️ 마킹갈이 수거', leagueId: 'kbo', teamId: 'lg', name: 'BUST', number: '99', price: 129000, reason: 'release', msg: '이름만 떼면 내년부터 새 유니폼이다' },
]

// 카드·연출에 쓰는 팀 대표색 (흰 바탕 유니폼은 줄무늬나 번호 색을 쓴다)
export function mainColor(kit) {
  const white = kit.body.toLowerCase() === '#ffffff'
  if (white && kit.stripes) return kit.stripes
  return white ? kit.num : kit.body
}
