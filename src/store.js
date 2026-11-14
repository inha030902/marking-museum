// 데이터 계층. 지금은 브라우저 localStorage에 저장한다.
// 공용 추모관(모든 방문자가 같은 전시관을 보는 것)으로 바꿀 때는
// 이 파일의 함수 본문만 DB(Supabase 등) 호출로 바꾸면 된다. 화면 코드는 그대로 둔다.
import { COLORS } from './constants.js'

const KEY = 'marking-museum-v1'

export const normalize = (s) => (s || '').replace(/\s+/g, '').toLowerCase()

const BANNED = ['씨발', '시발', 'ㅅㅂ', '병신', 'ㅄ', '좆', '개새', '새끼', '미친놈', '미친년', '애미', '느금', 'fuck', 'shit']
export const hasBadWord = (s) => BANNED.some((w) => normalize(s).includes(w))

// ---- 예시 데이터 (전부 가상의 선수·팀) ----
function rng(seed) {
  let x = seed
  return () => ((x = (x * 1103515245 + 12345) % 2147483648) / 2147483648)
}

const SEED = [
  ['soccer', '강태풍', '한강 유나이티드', 10, 'rival', 0, 214, 2021, 2024],
  ['soccer', '오세찬', '동해 FC', 7, 'abroad', 1, 133, 2022, 2025],
  ['soccer', '민도윤', '남산 시티', 9, 'fa', 4, 61, 2023, 2024],
  ['soccer', '하늘봄', '한강 유나이티드', 22, 'retire', 3, 38, 2019, 2025],
  ['soccer', '구본혁', '서해 로버스', 4, 'trade', 7, 19, 2024, 2025],
  ['baseball', '박철벽', '인천 파도스', 51, 'fa', 0, 187, 2020, 2024],
  ['baseball', '윤번개', '대구 썬더볼츠', 1, 'rival', 2, 142, 2021, 2025],
  ['baseball', '정한방', '광주 호랑나비', 33, 'abroad', 5, 96, 2022, 2024],
  ['baseball', '최직구', '인천 파도스', 18, 'trade', 1, 44, 2023, 2025],
  ['baseball', '나도루', '수원 날다람쥐', 7, 'release', 6, 12, 2024, 2025],
  ['basketball', '장덩크', '수원 스카이훅스', 23, 'fa', 1, 121, 2020, 2024],
  ['basketball', '허리바', '부평 블레이저스', 3, 'trade', 2, 77, 2022, 2025],
  ['basketball', '송삼점', '잠실 제트', 30, 'rival', 0, 58, 2023, 2025],
  ['basketball', '고블락', '원주 마운틴즈', 13, 'retire', 4, 26, 2018, 2024],
  ['esports', '솔킬장인', '네온 게이밍', 1, 'rival', 5, 233, 2021, 2025],
  ['esports', '한타왕', '블루문 e스포츠', 5, 'abroad', 1, 168, 2022, 2024],
  ['esports', '와드요정', '레드펄스', 4, 'fa', 3, 72, 2023, 2025],
  ['esports', '서렌금지', '네온 게이밍', 2, 'release', 2, 31, 2024, 2025],
]

const SEED_STORIES = [
  '집에서만 입어요. 밖에선 못 입어요.',
  '등번호 마킹비가 유니폼값보다 비쌌습니다.',
  '이적 기사 뜬 날 세탁기에 넣고 울었습니다.',
  '테이프로 이름 가리고 직관 갔다가 더 슬펐어요.',
  '라이벌 팀 유니폼 입은 사진 보고 잠을 못 잤습니다.',
  '아직도 그 번호 응원가가 귀에 맴돌아요.',
  '친구가 중고로 팔라는데 차마 못 팔겠어요.',
  '잠옷으로 3년째 함께하고 있습니다. 편하긴 해요.',
  '사인까지 받아뒀는데... 액자째 봉인했습니다.',
  '다음엔 무조건 등번호만 새길 겁니다.',
]

function buildSeed() {
  const r = rng(20261114)
  const states = ['closet', 'pajama', 'tape', 'resell', 'still']
  const stateW = [0.3, 0.27, 0.2, 0.15, 0.08]
  return SEED.map(([sport, name, team, number, reason, color, n, from, to], i) => {
    const stateCounts = Object.fromEntries(states.map((s) => [s, 0]))
    let totalPrice = 0, totalWears = 0, regret = 0
    for (let k = 0; k < n; k++) {
      let p = r(), acc = 0, s = states[0]
      for (let j = 0; j < states.length; j++) { acc += stateW[j]; if (p < acc) { s = states[j]; break } }
      stateCounts[s]++
      totalPrice += 89000 + Math.round(r() * 12) * 10000
      totalWears += 2 + Math.floor(r() * 25)
      if (r() < 0.55 + (reason === 'rival' ? 0.25 : 0)) regret++
    }
    const messages = Array.from({ length: Math.min(n, 4) }, (_, k) => ({
      id: `s${i}-${k}`,
      story: SEED_STORIES[(i * 3 + k) % SEED_STORIES.length],
      createdAt: Date.now() - (k + 1) * 3600_000 * (i + 2),
    }))
    return {
      id: `seed-${i}`,
      sport, name, team, number,
      reason, from, to,
      main: COLORS[color].main, accent: COLORS[color].accent,
      createdAt: Date.now() - (i + 1) * 86400_000,
      count: n, totalPrice, totalWears, regret, stateCounts,
      flowers: Math.round(n * (1.5 + r() * 2)),
      messages,
    }
  })
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* 저장소 접근 불가 시 예시 데이터로 */ }
  const data = { memorials: buildSeed() }
  save(data)
  return data
}
function save(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)) } catch { /* 무시 */ }
}

let db = load()

export async function listMemorials(sport) {
  return db.memorials.filter((m) => !sport || m.sport === sport).sort((a, b) => b.count - a.count)
}

export async function getMemorial(id) {
  return db.memorials.find((m) => m.id === id) || null
}

export async function findDuplicates(sport, name) {
  const n = normalize(name)
  if (!n) return []
  return db.memorials.filter((m) => m.sport === sport && normalize(m.name) === n)
}

export async function createMemorial(input) {
  const dup = db.memorials.find(
    (m) => m.sport === input.sport && normalize(m.name) === normalize(input.name) && normalize(m.team) === normalize(input.team),
  )
  if (dup) return { memorial: dup, existed: true }
  const m = {
    id: 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    sport: input.sport,
    name: input.name.trim(),
    team: input.team.trim(),
    number: input.number,
    reason: input.reason,
    from: input.from, to: input.to,
    main: input.main, accent: input.accent,
    createdAt: Date.now(),
    count: 0, totalPrice: 0, totalWears: 0, regret: 0,
    stateCounts: { closet: 0, pajama: 0, tape: 0, resell: 0, still: 0 },
    flowers: 0,
    messages: [],
  }
  db.memorials.push(m)
  save(db)
  return { memorial: m, existed: false }
}

export async function addCondolence(id, { story, price, wears, state, regret }) {
  const m = db.memorials.find((x) => x.id === id)
  if (!m) throw new Error('전시품을 찾을 수 없어요')
  m.count += 1
  m.totalPrice += price
  m.totalWears += wears
  if (regret) m.regret += 1
  m.stateCounts[state] = (m.stateCounts[state] || 0) + 1
  if (story) m.messages.unshift({ id: 'c' + Date.now().toString(36), story, createdAt: Date.now() })
  m.messages = m.messages.slice(0, 50)
  save(db)
  return { memorial: m, visitorNo: m.count }
}

export async function addFlower(id) {
  const m = db.memorials.find((x) => x.id === id)
  if (!m) return null
  m.flowers += 1
  save(db)
  return m
}

export function statsOf(m) {
  const avgPerWear = m.totalWears ? m.totalPrice / m.totalWears : 0
  const regretRate = m.count ? Math.round((m.regret / m.count) * 100) : 0
  const life = Math.max(0.5, (m.to || 0) - (m.from || 0))
  return { avgPerWear, regretRate, life }
}

export async function sportSummary(sport) {
  const list = await listMemorials(sport)
  const count = list.reduce((a, m) => a + m.count, 0)
  const regret = list.reduce((a, m) => a + m.regret, 0)
  const lifeSum = list.reduce((a, m) => a + Math.max(0.5, m.to - m.from), 0)
  return {
    jerseys: count,
    regretRate: count ? Math.round((regret / count) * 100) : 0,
    avgLife: list.length ? (lifeSum / list.length).toFixed(1) : '0',
    exhibits: list.length,
  }
}
