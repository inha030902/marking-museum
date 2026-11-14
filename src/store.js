// 데이터 계층.
// 기본: 공용 추모관 API(/api/museum, Upstash Redis)를 사용해 모든 방문자가 같은 전시관을 본다.
// 대비책: API가 응답하지 않으면(로컬 개발, 서버 장애) 브라우저 localStorage로 계속 동작한다.
import { buildSeed, dedupKey, hasBadWord, normalize, validateCondolence, validateMemorial } from './shared.js'

export { hasBadWord, normalize }

const API = '/api/museum'
let remoteOk = true

async function call(action, { method = 'GET', params = {}, body } = {}) {
  const qs = new URLSearchParams({ action, ...params }).toString()
  const res = await fetch(`${API}?${qs}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const ct = res.headers.get('content-type') || ''
  if (!ct.includes('application/json')) throw new Error('NO_API')
  const data = await res.json()
  if (res.status >= 500) throw new Error('NO_API')
  if (!res.ok) { const e = new Error(data.error || '요청 실패'); e.user = true; throw e }
  return data
}

// 원격 호출 → 실패하면 로컬 대비책 실행 (사용자 입력 오류는 그대로 전달)
async function remote(fn, fallback) {
  if (remoteOk) {
    try { return await fn() } catch (e) {
      if (e.user) throw e
      remoteOk = false
      console.warn('[museum] 공용 서버 연결 실패, 이 브라우저에만 저장합니다.', e)
    }
  }
  return fallback()
}

export const isShared = () => remoteOk

// ---------- 로컬 대비책 ----------
const KEY = 'marking-museum-v1'
function loadLocal() {
  try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw) } catch { /* 무시 */ }
  const data = { memorials: buildSeed() }
  saveLocal(data)
  return data
}
function saveLocal(data) { try { localStorage.setItem(KEY, JSON.stringify(data)) } catch { /* 무시 */ } }
let local = null
const db = () => (local ||= loadLocal())

// ---------- 공개 함수 ----------
export function listMemorials(sport) {
  return remote(
    async () => (await call('list', { params: sport ? { sport } : {} })).memorials,
    async () => db().memorials.filter((m) => !sport || m.sport === sport).sort((a, b) => b.count - a.count),
  )
}

export function getMemorial(id) {
  return remote(
    async () => {
      try { return (await call('get', { params: { id } })).memorial } catch (e) { if (e.user) return null; throw e }
    },
    async () => db().memorials.find((m) => m.id === id) || null,
  )
}

export async function findDuplicates(sport, name) {
  const n = normalize(name)
  if (!n) return []
  const list = await listMemorials(sport)
  return list.filter((m) => normalize(m.name) === n)
}

export function createMemorial(input) {
  const { value, error } = validateMemorial(input)
  if (error) return Promise.reject(Object.assign(new Error(error), { user: true }))
  return remote(
    () => call('create', { method: 'POST', body: value }),
    async () => {
      const d = db()
      const dup = d.memorials.find((m) => dedupKey(m.sport, m.name, m.team) === dedupKey(value.sport, value.name, value.team))
      if (dup) return { memorial: dup, existed: true }
      const m = {
        ...value, id: 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), createdAt: Date.now(),
        count: 0, totalPrice: 0, totalWears: 0, regret: 0, flowers: 0, stateCounts: {}, messages: [],
      }
      d.memorials.push(m)
      saveLocal(d)
      return { memorial: m, existed: false }
    },
  )
}

export function addCondolence(id, input) {
  const { value, error } = validateCondolence(input)
  if (error) return Promise.reject(Object.assign(new Error(error), { user: true }))
  return remote(
    () => call('condole', { method: 'POST', body: { id, ...value } }),
    async () => {
      const d = db()
      const m = d.memorials.find((x) => x.id === id)
      if (!m) throw Object.assign(new Error('전시품을 찾을 수 없어요'), { user: true })
      m.count += 1; m.totalPrice += value.price; m.totalWears += value.wears
      if (value.regret) m.regret += 1
      m.stateCounts[value.state] = (m.stateCounts[value.state] || 0) + 1
      m.messages = m.messages || []
      if (value.story) m.messages.unshift({ id: 'c' + Date.now().toString(36), story: value.story, createdAt: Date.now() })
      m.messages = m.messages.slice(0, 50)
      saveLocal(d)
      return { memorial: m, visitorNo: m.count }
    },
  )
}

export function addFlower(id) {
  return remote(
    async () => (await call('flower', { method: 'POST', body: { id } })).memorial,
    async () => {
      const d = db()
      const m = d.memorials.find((x) => x.id === id)
      if (!m) return null
      m.flowers += 1
      saveLocal(d)
      return m
    },
  )
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
