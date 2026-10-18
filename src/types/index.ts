// 全局数据类型定义
// 说明：所有新增字段均为可选，保证旧版本（iPad 上已存在）的数据可以无损读取。

export type Difficulty = 1 | 2 | 3
export type GameMode = 'individual' | 'team'

/* ----------------------------- 人物形象 ----------------------------- */

export interface AvatarConfig {
  /** 脸型 */
  face: string
  /** 肤色 */
  skin: string
  /** 发型 */
  hair: string
  /** 发色 */
  hairColor: string
  /** 眼睛 */
  eyes: string
  /** 衣饰（服装） */
  outfit: string
  /** 服装颜色 */
  outfitColor: string
  /** 配饰 */
  accessory: string
}

/* ----------------------------- 学生档案 ----------------------------- */

export interface CategoryStat {
  completed: number
  totalScore: number
  avgScore: number
}

export interface CategoryStats {
  tongueTwister: CategoryStat
  recitation: CategoryStat
  impromptu: CategoryStat
  imitation: CategoryStat
}

export interface StudentStats {
  /** 累计总积分（跨学期、跨班级，学生管理中心展示的就是这个） */
  totalScore: number
  sessionsAttended: number
  winCount: number
  mvpCount: number
  currentLevel: number
  currentRank: string
  categoryStats: CategoryStats
}

export interface SemesterHistoryEntry {
  semester: string
  score: number
  sessions: number
  /** 可选：记录来自哪个班级，便于区分不同班级的本学期积分 */
  classId?: string
}

export interface StudentRecord {
  id: string
  name: string
  /** 兼容旧数据的 emoji 头像 */
  emoji: string
  /** 新的人物形象配置（旧数据会在迁移层自动补齐） */
  avatar?: AvatarConfig
  stats: StudentStats
  inventory: any[]
  achievements: string[]
  semesterHistory: SemesterHistoryEntry[]
  createdAt: string
}

/* ----------------------------- 班级数据 ----------------------------- */

export interface ClassRecord {
  id: string
  name: string
  semester: string
  createdAt: string
  totalSessions: number
  /** 班级成员（学生 id） */
  studentIds: string[]
  /** 旧格式兼容字段 */
  students?: any[]
  /**
   * 本学期积分：studentId -> 该生在本班创建后累计获得的积分。
   * 这就是「班级管理」里显示的积分，与学生的累计总积分相互独立。
   */
  scores?: Record<string, number>
  /** 学生在班内的出勤次数 */
  attendance?: Record<string, number>
  /** 班级创建时间戳，用于界定「本学期」 */
  startedAt?: number
}

/* ----------------------------- 对局配置 ----------------------------- */

export interface GameConfig {
  classId: string
  gameMode: GameMode
  participants: string[]
  teams: any[] | null
  difficulty: Difficulty
}

export interface CheckinRecord {
  classId: string
  studentIds: string[]
}

/* --------------------------- 等级 / 称号 --------------------------- */

export const RANK_NAMES = ['口语新星', '表达达人', '演讲精英', '口才大师', '语言传奇'] as const

export const RANK_COLORS: Record<string, string> = {
  口语新星: '#B0BEC5',
  表达达人: '#4CAF50',
  演讲精英: '#2196F3',
  口才大师: '#9C27B0',
  语言传奇: '#FFD700',
}

/** 根据总积分计算等级（1-5），各页面统一使用，避免规则不一致 */
export function levelFromScore(totalScore: number): number {
  if (totalScore >= 2000) return 5
  if (totalScore >= 1000) return 4
  if (totalScore >= 500) return 3
  if (totalScore >= 200) return 2
  return 1
}

export function rankFromLevel(level: number): string {
  return RANK_NAMES[Math.min(Math.max(level, 1), 5) - 1]
}

export function rankColor(rank?: string): string {
  return RANK_COLORS[rank || '口语新星'] || '#B0BEC5'
}
