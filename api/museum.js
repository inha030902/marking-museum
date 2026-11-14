// 공용 추모관 API (Vercel Function + Upstash Redis)
//   GET  /api/museum?action=list&sport=soccer
//   GET  /api/museum?action=get&id=...
//   POST /api/museum?action=create      body: 안치 신청서
//   POST /api/museum?action=condole     body: { id, story, price, wears, state, regret }
//   POST /api/museum?action=flower      body: { id }
import { Redis } from '@upstash/redis'
import { buildSeed, dedupKey, validateCondolence, validateMemorial } from '../src/shared.js'
import { SPORTS, STATES } from '../src/constants.js'

const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
})

const P = 'mm:'
const META = ['id', 'sport', 'name', 'team', 'number', 'reason', 'from', 'to', 'main', 'accent', 'createdAt']
const NUM = ['number', 'from', 'to', 'createdAt', 'count', 'totalPrice', 'totalWears', 'regret', 'flowers']
const SPORT_IDS = SPORTS.map((s) => s.id)

function toHash(m) {
  const h = {}
  for (const k of META) h[k] = m[k]
  for (const k of ['count', 'totalPrice', 'totalWears', 'regret', 'flowers']) h[k] = m[k] || 0
  for (const s of STATES) h['s_' + s.id] = m.stateCounts?.[s.id] || 0
  return h
}

function fromHash(h) {
  if (!h || !h.id) return null
  const m = { stateCounts: {} }
  for (const [k, v] of Object.entries(h)) {
    if (k.startsWith('s_')) m.stateCounts[k.slice(2)] = Number(v) || 0
    else m[k] = NUM.includes(k) ? Number(v) || 0 : String(v)
  }
  return m
}

async function ensureSeed() {
  const first = await redis.set(P + 'seeded', '1', { nx: true })
  if (!first) return
  const p = redis.pipeline()
  for (const m of buildSeed()) {
    p.hset(P + 'm:' + m.id, toHash(m))
    p.sadd(P + 'idx:' + m.sport, m.id)
    p.set(P + 'dedup:' + dedupKey(m.sport, m.name, m.team), m.id)
    if (m.messages.length) p.rpush(P + 'msg:' + m.id, ...m.messages.map((x) => JSON.stringify(x)))
  }
  await p.exec()
}

// 쓰기 요청은 IP당 분당 20회로 제한
async function rateLimited(req) {
  const ip = String(req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim()
  const key = `${P}rl:${ip}:${Math.floor(Date.now() / 60000)}`
  const n = await redis.incr(key)
  if (n === 1) await redis.expire(key, 70)
  return n > 20
}

async function getOne(id, withMessages) {
  const m = fromHash(await redis.hgetall(P + 'm:' + id))
  if (!m) return null
  if (withMessages) {
    const raw = await redis.lrange(P + 'msg:' + id, 0, 49)
    m.messages = raw.map((x) => (typeof x === 'string' ? JSON.parse(x) : x))
  }
  return m
}

const safeId = (id) => typeof id === 'string' && /^[a-z0-9-]{1,40}$/i.test(id)

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  const action = req.query.action
  try {
    await ensureSeed()

    if (req.method === 'GET' && action === 'list') {
      const sport = req.query.sport
      const sports = SPORT_IDS.includes(sport) ? [sport] : SPORT_IDS
      const ids = (await Promise.all(sports.map((s) => redis.smembers(P + 'idx:' + s)))).flat()
      if (!ids.length) return res.json({ memorials: [] })
      const p = redis.pipeline()
      ids.forEach((id) => p.hgetall(P + 'm:' + id))
      const memorials = (await p.exec()).map(fromHash).filter(Boolean).sort((a, b) => b.count - a.count)
      return res.json({ memorials })
    }

    if (req.method === 'GET' && action === 'get') {
      if (!safeId(req.query.id)) return res.status(400).json({ error: '잘못된 요청이에요.' })
      const m = await getOne(req.query.id, true)
      return m ? res.json({ memorial: m }) : res.status(404).json({ error: '전시품을 찾을 수 없어요.' })
    }

    if (req.method !== 'POST') return res.status(405).json({ error: '허용되지 않는 요청이에요.' })
    if (await rateLimited(req)) return res.status(429).json({ error: '잠시 후 다시 시도해 주세요.' })
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}

    if (action === 'create') {
      const { value, error } = validateMemorial(body)
      if (error) return res.status(400).json({ error })
      const id = 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
      const dk = P + 'dedup:' + dedupKey(value.sport, value.name, value.team)
      const claimed = await redis.set(dk, id, { nx: true })
      if (!claimed) {
        const existing = await redis.get(dk)
        const m = existing && (await getOne(String(existing), true))
        if (m) return res.json({ memorial: m, existed: true })
        await redis.set(dk, id) // 깨진 중복 키 복구
      }
      const m = { ...value, id, createdAt: Date.now(), count: 0, totalPrice: 0, totalWears: 0, regret: 0, flowers: 0, stateCounts: {} }
      await redis.pipeline().hset(P + 'm:' + id, toHash(m)).sadd(P + 'idx:' + value.sport, id).exec()
      return res.json({ memorial: { ...m, messages: [] }, existed: false })
    }

    if (!safeId(body.id) || !(await redis.exists(P + 'm:' + body.id))) {
      return res.status(404).json({ error: '전시품을 찾을 수 없어요.' })
    }
    const key = P + 'm:' + body.id

    if (action === 'condole') {
      const { value, error } = validateCondolence(body)
      if (error) return res.status(400).json({ error })
      const p = redis.pipeline()
        .hincrby(key, 'count', 1)
        .hincrby(key, 'totalPrice', value.price)
        .hincrby(key, 'totalWears', value.wears)
        .hincrby(key, 'regret', value.regret ? 1 : 0)
        .hincrby(key, 's_' + value.state, 1)
      if (value.story) {
        p.lpush(P + 'msg:' + body.id, JSON.stringify({ id: 'c' + Date.now().toString(36), story: value.story, createdAt: Date.now() }))
        p.ltrim(P + 'msg:' + body.id, 0, 49)
      }
      const out = await p.exec()
      const visitorNo = Number(out[0])
      return res.json({ memorial: await getOne(body.id, true), visitorNo })
    }

    if (action === 'flower') {
      await redis.hincrby(key, 'flowers', 1)
      return res.json({ memorial: await getOne(body.id, true) })
    }

    return res.status(400).json({ error: '알 수 없는 요청이에요.' })
  } catch (e) {
    console.error('[museum]', e)
    return res.status(500).json({ error: '추모관 서버에 문제가 생겼어요.' })
  }
}
