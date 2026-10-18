// 人物形象部件库
// 全部使用内置 SVG 绘制，不依赖网络与图片资源，iPad 离线可用。
// 旧学生没有形象数据时，会依据 id 生成一个「稳定的」随机形象（每次打开都一致）。

import type { AvatarConfig } from '../types'

export interface PartOption {
  id: string
  label: string
}

export interface ColorOption extends PartOption {
  /** 色块预览使用的颜色 */
  swatch: string
}

export const FACE_OPTIONS: PartOption[] = [
  { id: 'round', label: '圆脸' },
  { id: 'oval', label: '鹅蛋脸' },
  { id: 'square', label: '方形脸' },
  { id: 'heart', label: '心形脸' },
  { id: 'long', label: '长脸' },
]

export const SKIN_OPTIONS: ColorOption[] = [
  { id: 'skin1', label: '白皙', swatch: '#FFE3CE' },
  { id: 'skin2', label: '自然', swatch: '#F7CFAE' },
  { id: 'skin3', label: '小麦', swatch: '#E0AC7E' },
  { id: 'skin4', label: '健康', swatch: '#C68642' },
  { id: 'skin5', label: '深棕', swatch: '#8D5524' },
]

export const HAIR_OPTIONS: PartOption[] = [
  { id: 'short', label: '短发' },
  { id: 'bob', label: '波波头' },
  { id: 'long', label: '长直发' },
  { id: 'ponytail', label: '马尾' },
  { id: 'twintails', label: '双马尾' },
  { id: 'curly', label: '卷发' },
  { id: 'buzz', label: '寸头' },
  { id: 'bun', label: '丸子头' },
]

export const HAIR_COLOR_OPTIONS: ColorOption[] = [
  { id: 'hairBlack', label: '黑色', swatch: '#2B2B2B' },
  { id: 'hairBrown', label: '棕色', swatch: '#6B4226' },
  { id: 'hairBlonde', label: '金色', swatch: '#E8C56A' },
  { id: 'hairRed', label: '红棕', swatch: '#B5482A' },
  { id: 'hairBlue', label: '蓝色', swatch: '#3F6FB5' },
  { id: 'hairPurple', label: '紫色', swatch: '#8A5BB5' },
  { id: 'hairPink', label: '粉色', swatch: '#E58BB0' },
  { id: 'hairGray', label: '银灰', swatch: '#B9BEC4' },
]

export const EYE_OPTIONS: PartOption[] = [
  { id: 'normal', label: '普通' },
  { id: 'smile', label: '笑眼' },
  { id: 'wink', label: '眨眼' },
  { id: 'big', label: '大眼' },
  { id: 'star', label: '星星眼' },
]

export const OUTFIT_OPTIONS: PartOption[] = [
  { id: 'tshirt', label: 'T恤' },
  { id: 'hoodie', label: '连帽衫' },
  { id: 'shirt', label: '衬衫领带' },
  { id: 'dress', label: '连衣裙' },
  { id: 'sweater', label: '毛衣' },
  { id: 'sport', label: '运动服' },
]

export const OUTFIT_COLOR_OPTIONS: ColorOption[] = [
  { id: 'outfitBlue', label: '蓝色', swatch: '#5B8DEF' },
  { id: 'outfitRed', label: '红色', swatch: '#EF5B5B' },
  { id: 'outfitGreen', label: '绿色', swatch: '#4CAF50' },
  { id: 'outfitYellow', label: '黄色', swatch: '#F5C542' },
  { id: 'outfitPurple', label: '紫色', swatch: '#9C6BE0' },
  { id: 'outfitTeal', label: '青色', swatch: '#28B5B5' },
  { id: 'outfitOrange', label: '橙色', swatch: '#FF9642' },
  { id: 'outfitPink', label: '粉色', swatch: '#F58FB5' },
]

export const ACCESSORY_OPTIONS: PartOption[] = [
  { id: 'none', label: '无' },
  { id: 'glasses', label: '眼镜' },
  { id: 'hat', label: '帽子' },
  { id: 'bow', label: '蝴蝶结' },
  { id: 'headphones', label: '耳机' },
  { id: 'crown', label: '皇冠' },
  { id: 'flower', label: '小花' },
]

/** 部件的实际取值表（颜色型部件 id -> 颜色值） */
const COLOR_MAP: Record<string, string> = {}
for (const group of [SKIN_OPTIONS, HAIR_COLOR_OPTIONS, OUTFIT_COLOR_OPTIONS]) {
  for (const opt of group) COLOR_MAP[opt.id] = opt.swatch
}

export function colorOf(id: string): string {
  return COLOR_MAP[id] || '#CCCCCC'
}

/** 把颜色值反查为部件 id（用于从旧数据/自定义颜色还原） */
export function colorIdFromValue(value: string): string | null {
  for (const [id, color] of Object.entries(COLOR_MAP)) {
    if (color.toLowerCase() === String(value).toLowerCase()) return id
  }
  return null
}

export const AVATAR_PARTS = {
  face: FACE_OPTIONS,
  skin: SKIN_OPTIONS,
  hair: HAIR_OPTIONS,
  hairColor: HAIR_COLOR_OPTIONS,
  eyes: EYE_OPTIONS,
  outfit: OUTFIT_OPTIONS,
  outfitColor: OUTFIT_COLOR_OPTIONS,
  accessory: ACCESSORY_OPTIONS,
}

export const DEFAULT_AVATAR: AvatarConfig = {
  face: 'round',
  skin: 'skin2',
  hair: 'short',
  hairColor: 'hairBlack',
  eyes: 'normal',
  outfit: 'tshirt',
  outfitColor: 'outfitBlue',
  accessory: 'none',
}

/* --------------------------- 稳定随机与校验 --------------------------- */

/** 由字符串生成稳定哈希（同一学生每次得到相同形象） */
function hashString(str: string): number {
  let hash = 2166136261
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash)
}

function pick<T>(list: T[], hash: number, salt: number): T {
  return list[(hash + salt * 2654435761) % list.length]
}

/** 依据 seed 生成一个稳定的随机形象（新学生 / 老学生自动补全时使用） */
export function randomAvatar(seed: string): AvatarConfig {
  const h = hashString(String(seed || 'seed'))
  return {
    face: pick(FACE_OPTIONS, h, 1).id,
    skin: pick(SKIN_OPTIONS, h, 2).id,
    hair: pick(HAIR_OPTIONS, h, 3).id,
    hairColor: pick(HAIR_COLOR_OPTIONS, h, 4).id,
    eyes: pick(EYE_OPTIONS, h, 5).id,
    outfit: pick(OUTFIT_OPTIONS, h, 6).id,
    outfitColor: pick(OUTFIT_COLOR_OPTIONS, h, 7).id,
    accessory: h % 3 === 0 ? pick(ACCESSORY_OPTIONS, h, 8).id : 'none',
  }
}

function isValidId(list: PartOption[], id: unknown): boolean {
  return typeof id === 'string' && list.some((o) => o.id === id)
}

/**
 * 把不完整/非法的形象配置补齐为合法配置。
 * 缺少配置时按 seed 生成稳定随机形象；个别字段非法时只替换该字段。
 */
export function normalizeAvatar(raw: any, seed?: string): AvatarConfig {
  const fallback = randomAvatar(seed || 'seed')
  if (!raw || typeof raw !== 'object') return fallback

  // 兼容直接用颜色值存储的情况
  const skin = isValidId(SKIN_OPTIONS, raw.skin)
    ? raw.skin
    : colorIdFromValue(raw.skin) || fallback.skin
  const hairColor = isValidId(HAIR_COLOR_OPTIONS, raw.hairColor)
    ? raw.hairColor
    : colorIdFromValue(raw.hairColor) || fallback.hairColor
  const outfitColor = isValidId(OUTFIT_COLOR_OPTIONS, raw.outfitColor)
    ? raw.outfitColor
    : colorIdFromValue(raw.outfitColor) || fallback.outfitColor

  return {
    face: isValidId(FACE_OPTIONS, raw.face) ? raw.face : fallback.face,
    skin,
    hair: isValidId(HAIR_OPTIONS, raw.hair) ? raw.hair : fallback.hair,
    hairColor,
    eyes: isValidId(EYE_OPTIONS, raw.eyes) ? raw.eyes : fallback.eyes,
    outfit: isValidId(OUTFIT_OPTIONS, raw.outfit) ? raw.outfit : fallback.outfit,
    outfitColor,
    accessory: isValidId(ACCESSORY_OPTIONS, raw.accessory) ? raw.accessory : 'none',
  }
}
