// 랭킹: 아직 이름별 집계 DB가 없어서, 예시 데이터에 이 브라우저의 내 기록을 더해 보여준다.
// 실제 선수 이름은 쓰지 않고 팬들이 흔히 새기는 별명풍 마킹만 넣었다. [팀, 마킹 이름, 등번호, 벌 수]
const SEED = {
  farewell: [
    ['tottenham', 'LEGEND', '7', 1284],
    ['liverpool', 'CAPTAIN', '8', 1107],
    ['kia', '에이스', '21', 986],
    ['mancity', 'MAESTRO', '17', 942],
    ['lotte', '4번타자', '10', 877],
    ['arsenal', 'MY HERO', '14', 803],
    ['samsung', '프랜차이즈', '36', 764],
    ['manutd', 'ONE CLUB MAN', '18', 698],
    ['lg', '영원한 캡틴', '9', 655],
    ['newcastle', 'LOCAL HERO', '9', 591],
    ['doosan', '수호신', '27', 540],
    ['chelsea', 'THE WALL', '26', 512],
    ['hanwha', '우리형', '52', 468],
    ['everton', 'GOAT', '10', 403],
  ],
  burn: [
    ['arsenal', 'TRAITOR', '10', 1532],
    ['tottenham', 'RUNAWAY', '10', 1318],
    ['lotte', '먹튀', '31', 1190],
    ['manutd', 'MERCENARY', '7', 1056],
    ['hanwha', '배신자', '1', 921],
    ['liverpool', 'SNAKE', '66', 874],
    ['kia', '통수', '5', 790],
    ['chelsea', 'BADGE KISSER', '9', 733],
    ['samsung', '돈따라간다', '13', 668],
    ['mancity', 'FLOP', '25', 602],
    ['lg', '야반도주', '47', 547],
    ['everton', 'DIVER', '11', 489],
    ['kt', '런', '3', 431],
    ['fulham', 'GHOST', '37', 377],
  ],
}

// type: 'farewell' | 'burn', items: 내 전시관 목록
export function buildRanking(type, items = []) {
  const rows = SEED[type].map(([teamId, name, number, count]) => ({ teamId, name, number, count, mine: false }))
  for (const it of items) {
    if (it.type !== type) continue
    const hit = rows.find((r) => r.teamId === it.teamId && r.name === it.name)
    if (hit) { hit.count += 1; hit.mine = true }
    else rows.push({ teamId: it.teamId, name: it.name, number: it.number, count: 1, mine: true })
  }
  return rows.sort((a, b) => b.count - a.count)
}
