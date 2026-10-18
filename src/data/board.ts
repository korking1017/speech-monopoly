// 棋盘格定义与布局计算
// 格子类型、顺序与旧版本完全一致（功能不变），仅改变「呈现方式」。

export interface BoardCell {
  index: number
  type: string
  title: string
  color: string
  icon: string
}

export const BOARD_CELLS_INDIVIDUAL: BoardCell[] = [
  { index: 0, type: 'start', title: '起点', color: '#4CAF50', icon: '🚩' },
  { index: 1, type: 'tongue_twister', title: '绕口令', color: '#FF9800', icon: '🔤' },
  { index: 2, type: 'recitation', title: '朗诵', color: '#2196F3', icon: '📖' },
  { index: 3, type: 'impromptu', title: '即兴演讲', color: '#9C27B0', icon: '💡' },
  { index: 4, type: 'imitation', title: '模仿秀', color: '#E91E63', icon: '🎭' },
  { index: 5, type: 'battle', title: '强制PK', color: '#F44336', icon: '⚔️' },
  { index: 6, type: 'card', title: '道具卡', color: '#FFD700', icon: '🎴' },
  { index: 7, type: 'recitation', title: '朗诵', color: '#2196F3', icon: '📖' },
  { index: 8, type: 'tongue_twister', title: '绕口令', color: '#FF9800', icon: '🔤' },
  { index: 9, type: 'recitation', title: '朗诵', color: '#2196F3', icon: '📖' },
  { index: 10, type: 'impromptu', title: '即兴演讲', color: '#9C27B0', icon: '💡' },
  { index: 11, type: 'imitation', title: '模仿秀', color: '#E91E63', icon: '🎭' },
  { index: 12, type: 'bonus', title: '奖励格', color: '#4CAF50', icon: '⭐' },
  { index: 13, type: 'card', title: '道具卡', color: '#FFD700', icon: '🎴' },
  { index: 14, type: 'tongue_twister', title: '绕口令', color: '#FF9800', icon: '🔤' },
  { index: 15, type: 'recitation', title: '朗诵', color: '#2196F3', icon: '📖' },
  { index: 16, type: 'imitation', title: '模仿秀', color: '#E91E63', icon: '🎭' },
  { index: 17, type: 'impromptu', title: '即兴演讲', color: '#9C27B0', icon: '💡' },
  { index: 18, type: 'tongue_twister', title: '绕口令', color: '#FF9800', icon: '🔤' },
  { index: 19, type: 'fortune', title: '幸运转盘', color: '#00BCD4', icon: '🎰' },
  { index: 20, type: 'tongue_twister', title: '绕口令', color: '#FF9800', icon: '🔤' },
  { index: 21, type: 'recitation', title: '朗诵', color: '#2196F3', icon: '📖' },
  { index: 22, type: 'impromptu', title: '即兴演讲', color: '#9C27B0', icon: '💡' },
  { index: 23, type: 'card', title: '道具卡', color: '#FFD700', icon: '🎴' },
  { index: 24, type: 'battle', title: '强制PK', color: '#F44336', icon: '⚔️' },
  { index: 25, type: 'tongue_twister', title: '绕口令', color: '#FF9800', icon: '🔤' },
  { index: 26, type: 'recitation', title: '朗诵', color: '#2196F3', icon: '📖' },
  { index: 27, type: 'trap', title: '陷阱', color: '#607D8B', icon: '💣' },
  { index: 28, type: 'tongue_twister', title: '绕口令', color: '#FF9800', icon: '🔤' },
  { index: 29, type: 'end', title: '终点', color: '#FFD700', icon: '🏆' },
]

export const BOARD_CELLS_TEAM: BoardCell[] = [
  { index: 0, type: 'start', title: '起点', color: '#4CAF50', icon: '🚩' },
  { index: 1, type: 'tongue_twister', title: '绕口令', color: '#FF9800', icon: '🔤' },
  { index: 2, type: 'team_cooperate', title: '团队合作', color: '#00BCD4', icon: '🤲' },
  { index: 3, type: 'recitation', title: '朗诵', color: '#2196F3', icon: '📖' },
  { index: 4, type: 'team_battle', title: '团队对抗', color: '#FF5722', icon: '🥊' },
  { index: 5, type: 'impromptu', title: '即兴演讲', color: '#9C27B0', icon: '💡' },
  { index: 6, type: 'card', title: '道具卡', color: '#FFD700', icon: '🎴' },
  { index: 7, type: 'imitation', title: '模仿秀', color: '#E91E63', icon: '🎭' },
  { index: 8, type: 'team_cooperate', title: '团队合作', color: '#00BCD4', icon: '🤲' },
  { index: 9, type: 'recitation', title: '朗诵', color: '#2196F3', icon: '📖' },
  { index: 10, type: 'team_battle', title: '团队对抗', color: '#FF5722', icon: '🥊' },
  { index: 11, type: 'tongue_twister', title: '绕口令', color: '#FF9800', icon: '🔤' },
  { index: 12, type: 'bonus', title: '奖励格', color: '#4CAF50', icon: '⭐' },
  { index: 13, type: 'card', title: '道具卡', color: '#FFD700', icon: '🎴' },
  { index: 14, type: 'impromptu', title: '即兴演讲', color: '#9C27B0', icon: '💡' },
  { index: 15, type: 'team_cooperate', title: '团队合作', color: '#00BCD4', icon: '🤲' },
  { index: 16, type: 'imitation', title: '模仿秀', color: '#E91E63', icon: '🎭' },
  { index: 17, type: 'team_battle', title: '团队对抗', color: '#FF5722', icon: '🥊' },
  { index: 18, type: 'recitation', title: '朗诵', color: '#2196F3', icon: '📖' },
  { index: 19, type: 'fortune', title: '幸运转盘', color: '#00BCD4', icon: '🎰' },
  { index: 20, type: 'tongue_twister', title: '绕口令', color: '#FF9800', icon: '🔤' },
  { index: 21, type: 'team_cooperate', title: '团队合作', color: '#00BCD4', icon: '🤲' },
  { index: 22, type: 'impromptu', title: '即兴演讲', color: '#9C27B0', icon: '💡' },
  { index: 23, type: 'card', title: '道具卡', color: '#FFD700', icon: '🎴' },
  { index: 24, type: 'team_battle', title: '团队对抗', color: '#FF5722', icon: '🥊' },
  { index: 25, type: 'recitation', title: '朗诵', color: '#2196F3', icon: '📖' },
  { index: 26, type: 'trap', title: '陷阱', color: '#607D8B', icon: '💣' },
  { index: 27, type: 'imitation', title: '模仿秀', color: '#E91E63', icon: '🎭' },
  { index: 28, type: 'team_cooperate', title: '团队合作', color: '#00BCD4', icon: '🤲' },
  { index: 29, type: 'tongue_twister', title: '绕口令', color: '#FF9800', icon: '🔤' },
  { index: 30, type: 'team_battle', title: '团队对抗', color: '#FF5722', icon: '🥊' },
  { index: 31, type: 'recitation', title: '朗诵', color: '#2196F3', icon: '📖' },
  { index: 32, type: 'card', title: '道具卡', color: '#FFD700', icon: '🎴' },
  { index: 33, type: 'impromptu', title: '即兴演讲', color: '#9C27B0', icon: '💡' },
  { index: 34, type: 'team_cooperate', title: '团队合作', color: '#00BCD4', icon: '🤲' },
  { index: 35, type: 'imitation', title: '模仿秀', color: '#E91E63', icon: '🎭' },
  { index: 36, type: 'bonus', title: '奖励格', color: '#4CAF50', icon: '⭐' },
  { index: 37, type: 'tongue_twister', title: '绕口令', color: '#FF9800', icon: '🔤' },
  { index: 38, type: 'team_battle', title: '团队对抗', color: '#FF5722', icon: '🥊' },
  { index: 39, type: 'recitation', title: '朗诵', color: '#2196F3', icon: '📖' },
  { index: 40, type: 'fortune', title: '幸运转盘', color: '#00BCD4', icon: '🎰' },
  { index: 41, type: 'team_cooperate', title: '团队合作', color: '#00BCD4', icon: '🤲' },
  { index: 42, type: 'impromptu', title: '即兴演讲', color: '#9C27B0', icon: '💡' },
  { index: 43, type: 'card', title: '道具卡', color: '#FFD700', icon: '🎴' },
  { index: 44, type: 'tongue_twister', title: '绕口令', color: '#FF9800', icon: '🔤' },
  { index: 45, type: 'team_battle', title: '团队对抗', color: '#FF5722', icon: '🥊' },
  { index: 46, type: 'recitation', title: '朗诵', color: '#2196F3', icon: '📖' },
  { index: 47, type: 'imitation', title: '模仿秀', color: '#E91E63', icon: '🎭' },
  { index: 48, type: 'team_cooperate', title: '团队合作', color: '#00BCD4', icon: '🤲' },
  { index: 49, type: 'end', title: '终点', color: '#FFD700', icon: '🏆' },
]

/** 依据格子总数选择合适的「列数」，使棋盘接近方形 */
export function gridColumnsFor(total: number): number {
  if (total <= 30) return 6
  if (total <= 40) return 8
  return 10
}

export interface CellLayout {
  row: number
  col: number
  /** 等距投影后的坐标（单位与 tileW 一致） */
  x: number
  y: number
}

export interface BoardLayout {
  cols: number
  rows: number
  tileW: number
  tileH: number
  /** 立体厚度 */
  depth: number
  width: number
  height: number
  cells: CellLayout[]
}

/**
 * 计算等距（2.5D）棋盘布局。
 * 路径采用蛇形：奇数行反向，形成真实桌游般来回行进的路线。
 */
export function computeBoardLayout(total: number, containerWidth: number): BoardLayout {
  if (!Number.isFinite(total) || total <= 0) {
    return { cols: 0, rows: 0, tileW: 0, tileH: 0, depth: 0, width: 0, height: 0, cells: [] }
  }
  const cols = gridColumnsFor(total)
  const rows = Math.ceil(total / cols)

  /*
    等距投影下，棋盘横向总宽度 = 格子宽 × (列数 + 行数) / 2。
    据此反推格子尺寸，保证棋盘正好放得进容器，不会横向溢出。
  */
  const unitsX = (cols + rows) / 2
  const minTile = 26
  const maxTile = 110
  const tileW = Math.max(minTile, Math.min(maxTile, containerWidth / unitsX))
  const th = tileW / 2
  const depth = tileW * 0.3

  // 顶部留出空间给「站在格子上」的棋子，避免被裁切
  const paddingTop = th * 1.55
  // 底部：最下格子的下半菱形 + 立体厚度 + 少量余量
  const paddingBottom = th / 2 + depth + 4

  const cells: CellLayout[] = []
  for (let i = 0; i < total; i++) {
    const row = Math.floor(i / cols)
    const stepInRow = i % cols
    // 蛇形：偶数行从左到右，奇数行从右到左
    const col = row % 2 === 0 ? stepInRow : cols - 1 - stepInRow

    const isoX = ((col - row) * tileW) / 2
    const isoY = ((col + row) * th) / 2
    cells.push({ row, col, x: isoX, y: isoY })
  }

  const minX = Math.min(...cells.map((c) => c.x))
  const minY = Math.min(...cells.map((c) => c.y))
  const maxX = Math.max(...cells.map((c) => c.x))
  const maxY = Math.max(...cells.map((c) => c.y))

  // 横向：最左/最右格子的半个菱形也算进去
  const width = maxX - minX + tileW
  // 纵向：最下格子的下半菱形 + 厚度，再加顶部留白
  const height = maxY - minY + th / 2 + paddingTop + paddingBottom

  // 平移到正坐标空间（左上角对齐 0,0）
  const offsetX = -minX + tileW / 2
  const offsetY = -minY + th / 2 + paddingTop
  for (const c of cells) {
    c.x += offsetX
    c.y += offsetY
  }

  return { cols, rows, tileW, tileH: th, depth, width, height, cells }
}
