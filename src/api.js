// 공용 집계(보내준 벌 수 / 태운 벌 수). 서버가 없으면(로컬 개발, 장애) 이 브라우저에만 센다.
const KEY = 'goodbye-jersey-stats-v1'
let remoteOk = true

const readLocal = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} } }
const writeLocal = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* 무시 */ } }

async function call(method, body) {
  const res = await fetch('/api/ritual', {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!(res.headers.get('content-type') || '').includes('application/json') || !res.ok) throw new Error('NO_API')
  return (await res.json()).stats
}

export async function getStats() {
  if (remoteOk) { try { return await call('GET') } catch { remoteOk = false } }
  return readLocal()
}

// type: 'farewell' | 'burn'
export async function recordRitual(team, type) {
  if (remoteOk) { try { return await call('POST', { team, type }) } catch { remoteOk = false } }
  const s = readLocal()
  s[type] = (s[type] || 0) + 1
  s[`${type}:${team}`] = (s[`${type}:${team}`] || 0) + 1
  writeLocal(s)
  return s
}
