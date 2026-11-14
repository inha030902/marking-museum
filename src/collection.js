// 내 전시관: 내가 보내주거나 태운 유니폼 목록. 이 브라우저(localStorage)에만 저장한다.
const KEY = 'goodbye-jersey-collection-v1'

export function loadCollection() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY))
    return Array.isArray(list) ? list : []
  } catch { return [] }
}

// item: { teamId, name, number, msg, type: 'farewell' | 'burn' }
export function addToCollection(item) {
  const list = [{ ...item, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), at: new Date().toISOString() }, ...loadCollection()].slice(0, 60)
  try { localStorage.setItem(KEY, JSON.stringify(list)) } catch { /* 저장 불가 시 화면에만 유지 */ }
  return list
}

export function clearCollection() {
  try { localStorage.removeItem(KEY) } catch { /* 무시 */ }
  return []
}
