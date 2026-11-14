// 공용 집계 API (Vercel Function + Upstash Redis)
//   GET  /api/ritual                → { stats: { farewell, burn, 'burn:arsenal', ... } }
//   POST /api/ritual { team, type } → 집계 +1 후 같은 형태로 응답
import { Redis } from '@upstash/redis'
import { TEAM_IDS } from '../src/teams.js'

const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
})

const KEY = 'gj:stats'
const TYPES = ['farewell', 'burn']

async function readStats() {
  const h = (await redis.hgetall(KEY)) || {}
  return Object.fromEntries(Object.entries(h).map(([k, v]) => [k, Number(v) || 0]))
}

// 쓰기 요청은 IP당 분당 15회로 제한
async function rateLimited(req) {
  const ip = String(req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim()
  const key = `gj:rl:${ip}:${Math.floor(Date.now() / 60000)}`
  const n = await redis.incr(key)
  if (n === 1) await redis.expire(key, 70)
  return n > 15
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    if (req.method === 'GET') return res.json({ stats: await readStats() })
    if (req.method !== 'POST') return res.status(405).json({ error: '허용되지 않는 요청이에요.' })
    if (await rateLimited(req)) return res.status(429).json({ error: '잠시 후 다시 시도해 주세요.' })
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    if (!TEAM_IDS.includes(body.team) || !TYPES.includes(body.type)) return res.status(400).json({ error: '잘못된 요청이에요.' })
    await redis.pipeline().hincrby(KEY, body.type, 1).hincrby(KEY, `${body.type}:${body.team}`, 1).exec()
    return res.json({ stats: await readStats() })
  } catch (e) {
    console.error('[ritual]', e)
    return res.status(500).json({ error: '서버에 문제가 생겼어요.' })
  }
}
