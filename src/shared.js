// 브라우저와 서버(api/)가 함께 쓰는 로직: 정규화, 금칙어, 입력 검증, 예시 데이터
import { COLORS, SPORTS, REASONS, STATES } from './constants.js'

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

export function buildSeed() {
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


// ---- 입력 검증 (서버에서도 똑같이 검사) ----
const SPORT_IDS = SPORTS.map((s) => s.id)
const REASON_IDS = REASONS.map((r) => r.id)
const STATE_IDS = STATES.map((s) => s.id)
const COLOR_SET = new Set(COLORS.flatMap((c) => [c.main, c.accent]))
const thisYear = () => new Date().getFullYear()

export function validateMemorial(i) {
  const name = String(i?.name || '').trim()
  const team = String(i?.team || '').trim()
  const number = Number(i?.number)
  const from = Number(i?.from), to = Number(i?.to)
  if (!SPORT_IDS.includes(i?.sport)) return { error: '종목이 올바르지 않아요.' }
  if (!name || name.length > 10) return { error: '선수 이름은 1~10자로 적어주세요.' }
  if (!team || team.length > 16) return { error: '팀 이름은 1~16자로 적어주세요.' }
  if (hasBadWord(name + team)) return { error: '고인(유니폼)에 대한 예의를 지켜주세요.' }
  if (!Number.isInteger(number) || number < 0 || number > 99) return { error: '등번호는 0~99 사이 숫자로 적어주세요.' }
  if (!REASON_IDS.includes(i?.reason)) return { error: '떠난 이유를 골라주세요.' }
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 1990 || to > thisYear() || from > to) return { error: '함께한 기간을 다시 확인해 주세요.' }
  if (!COLOR_SET.has(i?.main) || !COLOR_SET.has(i?.accent)) return { error: '유니폼 색이 올바르지 않아요.' }
  return { value: { sport: i.sport, name, team, number, reason: i.reason, from, to, main: i.main, accent: i.accent } }
}

export function validateCondolence(i) {
  const story = String(i?.story || '').trim().slice(0, 60)
  const price = Number(i?.price), wears = Number(i?.wears)
  if (hasBadWord(story)) return { error: '고인(유니폼)에 대한 예의를 지켜주세요. 욕설은 남길 수 없어요.' }
  if (!Number.isFinite(price) || price < 0 || price > 2000000) return { error: '구매 가격을 다시 확인해 주세요.' }
  if (!Number.isInteger(wears) || wears < 1 || wears > 999) return { error: '입은 횟수는 1~999회로 적어주세요.' }
  if (!STATE_IDS.includes(i?.state)) return { error: '유니폼 상태를 골라주세요.' }
  return { value: { story, price: Math.round(price), wears, state: i.state, regret: !!i.regret } }
}

export const dedupKey = (sport, name, team) => `${sport}:${normalize(name)}:${normalize(team)}`
