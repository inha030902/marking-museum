// 사유·상태별 비문. AI 없이도 항상 동작하는 기본 문구.
const BY_REASON = {
  fa: ['그는 더 좋은 조건을 찾아 떠났고, 나는 마킹비를 찾지 못했다.', '계약서는 끝났지만 세탁 태그는 남았다.', '시장 가치는 올랐고, 내 유니폼 가치는 떨어졌다.'],
  rival: ['하필이면 거기로 갔다.', '어제의 등번호가 오늘의 적이 되었다.', '그는 반대편 응원석에서 다시 태어났다.'],
  trade: ['사인 한 장에 그는 떠났고, 내 이름표만 남았다.', '구단은 선수를 바꿨고, 나는 옷장을 바꿨다.', '트레이드 마감일, 내 마음도 마감되었다.'],
  abroad: ['그는 더 넓은 세상으로 갔고, 유니폼은 좁은 옷장으로 갔다.', '꿈을 응원했지만 마킹까지 응원하진 못했다.', '시차만큼 멀어진 우리 사이.'],
  retire: ['그는 은퇴했고, 유니폼은 전설이 되었다.', '떠난 게 아니라 졸업한 것이다. 그래도 슬프다.', '마지막 경기의 함성은 이 천 조각에 남았다.'],
  release: ['구단이 먼저 손을 놓았다. 나는 아직 못 놓았다.', '짧았지만 진심이었다.', '1군보다 내 옷장에 더 오래 있었다.'],
}
const BY_STATE = {
  closet: '지금은 옷장 깊은 곳에서 영면 중이다.',
  pajama: '지금은 잠옷이 되어 밤마다 나를 지킨다.',
  tape: '지금은 테이프 아래에서 조용히 숨 쉰다.',
  resell: '중고 거래 앱의 장바구니에서 망설이는 중이다.',
  still: '나는 아직도 이걸 입고 다닌다. 아무도 말리지 못했다.',
}

const pick = (arr, seed) => arr[Math.abs(hash(seed)) % arr.length]
function hash(s) {
  let h = 0
  for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) | 0
  return h
}

export function epitaphFor(memorial) {
  return pick(BY_REASON[memorial.reason] || BY_REASON.fa, memorial.id)
}

export function certificateLine(memorial, state, seed) {
  return `${pick(BY_REASON[memorial.reason] || BY_REASON.fa, seed)} ${BY_STATE[state] || ''}`
}
