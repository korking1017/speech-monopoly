// 统一数据层
// 设计原则（非常重要）：只做「字段补齐」，绝不删除、绝不覆盖已有数据。
// iPad 上已经存在的 localStorage 数据在升级后会被原样读出，
// 仅在缺少新字段时补上默认值，因此学生信息不会丢失。

import type {
  AvatarConfig,
  CategoryStats,
  ClassRecord,
  StudentRecord,
  StudentStats,
  SemesterHistoryEntry,
} from '../types'
import { levelFromScore, rankFromLevel } from '../types'
import { randomAvatar, normalizeAvatar } from '../data/avatar'
import { defaultQuestions } from '../data/questions'

export const KEYS = {
  students: 'speech_students',
  classes: 'speech_classes',
  questionBank: 'speech_question_bank',
  checkin: 'speech_current_checkin',
  gameConfig: 'speech_current_game_config',
  schemaVersion: 'speech_schema_version',
} as const

/** 当前数据结构版本号，用于未来继续做无损升级 */
export const CURRENT_SCHEMA_VERSION = 2

/* ----------------------------- 基础读写 ----------------------------- */

function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed as T
  } catch (e) {
    console.error(`[storage] 解析 ${key} 失败，已忽略该条数据（不会清除原数据）`, e)
    return null
  }
}

function writeJSON(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (e) {
    console.error(`[storage] 写入 ${key} 失败`, e)
    alert('保存失败：设备存储空间可能已满。请勿关闭页面，建议先导出备份。')
    return false
  }
}

/* --------------------------- 默认值构造函数 --------------------------- */

export function createDefaultCategoryStats(): CategoryStats {
  return {
    tongueTwister: { completed: 0, totalScore: 0, avgScore: 0 },
    recitation: { completed: 0, totalScore: 0, avgScore: 0 },
    impromptu: { completed: 0, totalScore: 0, avgScore: 0 },
    imitation: { completed: 0, totalScore: 0, avgScore: 0 },
  }
}

export function createDefaultStats(): StudentStats {
  return {
    totalScore: 0,
    sessionsAttended: 0,
    winCount: 0,
    mvpCount: 0,
    currentLevel: 1,
    currentRank: rankFromLevel(1),
    categoryStats: createDefaultCategoryStats(),
  }
}

/**
 * 把任意来源（旧版本数据 / 手工导入）的学生对象补齐成完整 StudentRecord。
 * 已有字段一律保留。
 */
export function normalizeStudent(raw: any): StudentRecord {
  const stats: StudentStats = {
    ...createDefaultStats(),
    ...(raw?.stats || {}),
  }
  // categoryStats 可能整体缺失，也可能缺少其中某一项
  stats.categoryStats = {
    ...createDefaultCategoryStats(),
    ...(raw?.stats?.categoryStats || {}),
  }
  // 等级/称号始终按总积分重算，避免旧数据里等级与积分不一致
  stats.currentLevel = levelFromScore(stats.totalScore || 0)
  stats.currentRank = rankFromLevel(stats.currentLevel)

  const semesterHistory: SemesterHistoryEntry[] = Array.isArray(raw?.semesterHistory)
    ? raw.semesterHistory
    : []
  const achievements: string[] = Array.isArray(raw?.achievements) ? raw.achievements : []
  const inventory: any[] = Array.isArray(raw?.inventory) ? raw.inventory : []

  return {
    // 旧数据一定有 id；实在没有就补一个，保证 React key 稳定
    id: String(raw?.id ?? `stu_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`),
    name: String(raw?.name ?? '未命名'),
    emoji: raw?.emoji || '👤',
    // 老学生没有 avatar 字段：按 id 生成一个稳定的随机形象，保证每次打开一致
    avatar: normalizeAvatar(raw?.avatar, raw?.id),
    stats,
    inventory,
    achievements,
    semesterHistory,
    createdAt: raw?.createdAt || new Date().toISOString(),
  }
}

/** 把任意来源的班级对象补齐成完整 ClassRecord。 */
export function normalizeClass(raw: any): ClassRecord {
  // 旧格式把学生对象直接存在 class.students 里，新格式用 studentIds 引用学生库
  const studentIds: string[] = Array.isArray(raw?.studentIds)
    ? raw.studentIds.filter(Boolean).map(String)
    : Array.isArray(raw?.students)
      ? raw.students.map((s: any) => String(s?.id)).filter(Boolean)
      : []

  const createdAt = raw?.createdAt || new Date().toISOString()
  const startedAt = typeof raw?.startedAt === 'number' ? raw.startedAt : new Date(createdAt).getTime() || Date.now()

  return {
    id: String(raw?.id ?? `cls_${Date.now()}`),
    name: String(raw?.name ?? '未命名班级'),
    semester: raw?.semester || '',
    createdAt,
    startedAt,
    totalSessions: Number(raw?.totalSessions) || 0,
    studentIds,
    students: Array.isArray(raw?.students) ? raw.students : [],
    // 本学期积分/出勤：旧数据没有，补空对象（不会凭空产生积分）
    scores: raw?.scores && typeof raw.scores === 'object' ? { ...raw.scores } : {},
    attendance: raw?.attendance && typeof raw.attendance === 'object' ? { ...raw.attendance } : {},
  }
}

/* ------------------------------ 学生读写 ------------------------------ */

export function loadStudents(): StudentRecord[] {
  const raw = readJSON<any[]>(KEYS.students)
  const fromStore: StudentRecord[] = Array.isArray(raw) ? raw.map(normalizeStudent) : []

  // 兼容极旧格式：学生只内嵌在班级记录里、尚未写入学生库。
  // 这里把「学生库里没有」的内嵌学生补进来，保证老用户不丢人。
  const classesRaw = readJSON<any[]>(KEYS.classes)
  if (!Array.isArray(classesRaw)) return fromStore

  const known = new Set(fromStore.map((s) => s.id))
  const migrated: StudentRecord[] = []
  for (const cls of classesRaw) {
    const list = Array.isArray(cls?.students) ? cls.students : []
    for (const s of list) {
      const id = s?.id ? String(s.id) : ''
      if (id && !known.has(id)) {
        known.add(id)
        migrated.push(normalizeStudent(s))
      }
    }
  }

  return migrated.length > 0 ? [...fromStore, ...migrated] : fromStore
}

export function saveStudents(students: StudentRecord[]): boolean {
  return writeJSON(KEYS.students, students)
}

/** 新增学生：自动分配形象与默认统计 */
export function createStudent(name: string, avatar?: AvatarConfig): StudentRecord {
  const id = `stu_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  return {
    id,
    name: name.trim(),
    emoji: '👤',
    avatar: avatar ? normalizeAvatar(avatar, id) : randomAvatar(id),
    stats: createDefaultStats(),
    inventory: [],
    achievements: [],
    semesterHistory: [],
    createdAt: new Date().toISOString(),
  }
}

/* ------------------------------ 班级读写 ------------------------------ */

export function loadClasses(): ClassRecord[] {
  const raw = readJSON<any[]>(KEYS.classes)
  if (!Array.isArray(raw)) return []
  return raw.map(normalizeClass)
}

export function saveClasses(classes: ClassRecord[]): boolean {
  return writeJSON(KEYS.classes, classes)
}

/**
 * 取某学生在本班的「本学期积分」。
 * 优先读班级的 scores 记录；若班级是从更早版本升级而来（还没有 scores），
 * 则回退读取该生 semesterHistory 中与本班学期匹配的记录，保证老用户看到合理数值。
 */
export function getClassScore(cls: ClassRecord | null | undefined, studentId: string, student?: StudentRecord | null): number {
  if (!cls) return 0
  if (cls.scores && Object.prototype.hasOwnProperty.call(cls.scores, studentId)) {
    return cls.scores[studentId] || 0
  }
  // 老数据回退：按学期名称匹配历史记录
  const history = student?.semesterHistory || []
  const matched = history.filter((h) => !cls.semester || h.semester === cls.semester)
  if (matched.length > 0) {
    return matched.reduce((sum, h) => sum + (h.score || 0), 0)
  }
  return 0
}

/** 取某学生在本班的出勤次数（老数据回退到全局出勤） */
export function getClassAttendance(cls: ClassRecord | null | undefined, studentId: string, student?: StudentRecord | null): number {
  if (!cls) return 0
  if (cls.attendance && Object.prototype.hasOwnProperty.call(cls.attendance, studentId)) {
    return cls.attendance[studentId] || 0
  }
  return student?.stats?.sessionsAttended || 0
}

/** 本班本学期总积分（只统计当前在班学生） */
export function getClassTotalScore(cls: ClassRecord | null | undefined, students: StudentRecord[] = []): number {
  if (!cls) return 0
  const map = new Map(students.map((s) => [s.id, s]))
  return cls.studentIds.reduce(
    (sum, sid) => sum + getClassScore(cls, sid, map.get(sid)),
    0,
  )
}

/* ------------------------- 对局配置 / 签到 ------------------------- */

export function loadCheckin() {
  return readJSON<{ classId: string; studentIds: string[] }>(KEYS.checkin)
}

export function saveCheckin(data: { classId: string; studentIds: string[] }) {
  return writeJSON(KEYS.checkin, data)
}

export function loadGameConfig() {
  return readJSON<any>(KEYS.gameConfig)
}

export function saveGameConfig(config: any) {
  return writeJSON(KEYS.gameConfig, config)
}

export function clearGameSession() {
  localStorage.removeItem(KEYS.gameConfig)
  localStorage.removeItem(KEYS.checkin)
}

/* ------------------------------ 题库 ------------------------------ */

export function ensureQuestionBank() {
  const raw = readJSON<Record<string, any[]>>(KEYS.questionBank)
  if (!raw || typeof raw !== 'object') {
    // 首次使用：写入一份完整默认题库
    writeJSON(KEYS.questionBank, JSON.parse(JSON.stringify(defaultQuestions)))
    return
  }
  // 补齐后续版本新增的题目分类，不覆盖用户自己编辑过的内容
  let changed = false
  for (const key of Object.keys(defaultQuestions)) {
    if (!Array.isArray(raw[key])) {
      raw[key] = JSON.parse(JSON.stringify(defaultQuestions[key]))
      changed = true
    }
  }
  if (changed) writeJSON(KEYS.questionBank, raw)
}

/* ---------------------------- 升级前快照 ---------------------------- */

/**
 * 升级前自动留一份「原始数据快照」。
 * 这是最后一道保险：即使迁移逻辑出现意外，也能一键恢复升级前的数据。
 */
const BACKUP_KEYS = {
  students: 'speech_backup_v1_students',
  classes: 'speech_backup_v1_classes',
  at: 'speech_backup_v1_at',
} as const

function createPreUpgradeBackup() {
  try {
    // 已经升级过就不再覆盖快照，始终保留最早的原始数据
    if (localStorage.getItem(KEYS.schemaVersion) === String(CURRENT_SCHEMA_VERSION)) return
    const rawStudents = localStorage.getItem(KEYS.students)
    const rawClasses = localStorage.getItem(KEYS.classes)
    if (!rawStudents && !rawClasses) return

    // 数据过大时跳过，避免撑爆 localStorage 配额
    const size = (rawStudents?.length || 0) + (rawClasses?.length || 0)
    if (size > 2_000_000) {
      console.warn('[storage] 数据较大，跳过升级前自动快照')
      return
    }

    if (rawStudents) localStorage.setItem(BACKUP_KEYS.students, rawStudents)
    if (rawClasses) localStorage.setItem(BACKUP_KEYS.classes, rawClasses)
    localStorage.setItem(BACKUP_KEYS.at, new Date().toISOString())
    console.info('[storage] 已保存升级前数据快照')
  } catch (e) {
    console.warn('[storage] 升级前快照失败（不影响升级本身）', e)
  }
}

/** 是否存在升级前快照 */
export function hasPreUpgradeBackup(): boolean {
  try {
    return Boolean(
      localStorage.getItem(BACKUP_KEYS.students) || localStorage.getItem(BACKUP_KEYS.classes),
    )
  } catch {
    return false
  }
}

/** 升级前快照的时间 */
export function preUpgradeBackupTime(): string | null {
  try {
    return localStorage.getItem(BACKUP_KEYS.at)
  } catch {
    return null
  }
}

/** 恢复到升级前的原始数据 */
export function restorePreUpgradeBackup(): { ok: boolean; message: string } {
  try {
    const rawStudents = localStorage.getItem(BACKUP_KEYS.students)
    const rawClasses = localStorage.getItem(BACKUP_KEYS.classes)
    if (!rawStudents && !rawClasses) return { ok: false, message: '没有找到升级前快照' }
    if (rawStudents) localStorage.setItem(KEYS.students, rawStudents)
    if (rawClasses) localStorage.setItem(KEYS.classes, rawClasses)
    return { ok: true, message: '已恢复升级前的数据，请刷新页面' }
  } catch (e) {
    console.error('[storage] 恢复快照失败', e)
    return { ok: false, message: '恢复失败' }
  }
}

/* ------------------------------ 初始化 ------------------------------ */

let initialized = false

/**
 * 应用启动时调用一次：
 * 1. 保存升级前快照（仅首次升级时）
 * 2. 补齐题库
 * 3. 把学生/班级数据规范化后写回（只补字段，不删数据）
 * 4. 记录 schema 版本
 */
export function initStorage() {
  if (initialized) return
  initialized = true

  // 第一步永远是留快照，之后再做任何规范化
  createPreUpgradeBackup()

  ensureQuestionBank()

  const rawStudents = localStorage.getItem(KEYS.students)
  const rawClasses = localStorage.getItem(KEYS.classes)

  // 学生数据规范化。即使原先没有 speech_students，
  // 只要班级里内嵌了学生，也会在这里把它们落库，避免老用户数据丢失。
  const students = loadStudents()
  if (students.length > 0 && (rawStudents || rawClasses)) {
    saveStudents(students)
  }

  // 班级数据规范化 + 为老班级补种「本学期积分/出勤」
  if (rawClasses) {
    const classes = loadClasses()
    const studentMap = new Map(students.map((s) => [s.id, s]))
    let seeded = false

    for (const cls of classes) {
      // 已有积分记录的班级（新版本创建的）不再补种
      if (cls.scores && Object.keys(cls.scores).length > 0) continue

      for (const sid of cls.studentIds) {
        const stu = studentMap.get(sid)
        if (!stu) continue
        const matched = (stu.semesterHistory || []).filter(
          (h) => !cls.semester || h.semester === cls.semester,
        )
        if (matched.length === 0) continue
        const score = matched.reduce((sum, h) => sum + (h.score || 0), 0)
        const sessions = matched.reduce((sum, h) => sum + (h.sessions || 0), 0)
        if (score !== 0) {
          cls.scores = { ...(cls.scores || {}), [sid]: score }
          cls.attendance = { ...(cls.attendance || {}), [sid]: sessions }
          seeded = true
        }
      }
    }

    if (classes.length > 0) saveClasses(classes)
    if (seeded) console.info('[storage] 已按历史记录为老班级补种本学期积分')
  }

  try {
    localStorage.setItem(KEYS.schemaVersion, String(CURRENT_SCHEMA_VERSION))
  } catch {
    /* 忽略：版本号写入失败不影响使用 */
  }
}

/** 导出全部数据（用于备份，避免用户误操作丢数据） */
export function exportAllData() {
  return {
    exportedAt: new Date().toISOString(),
    schemaVersion: CURRENT_SCHEMA_VERSION,
    students: readJSON(KEYS.students) || [],
    classes: readJSON(KEYS.classes) || [],
    questionBank: readJSON(KEYS.questionBank) || {},
  }
}

/** 从备份恢复（用于换设备 / 误删恢复） */
export function importAllData(data: any): { ok: boolean; message: string } {
  try {
    if (!data || typeof data !== 'object') return { ok: false, message: '备份文件格式不正确' }
    if (Array.isArray(data.students)) {
      saveStudents(data.students.map(normalizeStudent))
    }
    if (Array.isArray(data.classes)) {
      saveClasses(data.classes.map(normalizeClass))
    }
    if (data.questionBank && typeof data.questionBank === 'object') {
      writeJSON(KEYS.questionBank, data.questionBank)
    }
    return { ok: true, message: '数据已恢复' }
  } catch (e) {
    console.error('[storage] 恢复备份失败', e)
    return { ok: false, message: '恢复失败，原数据未被修改' }
  }
}
