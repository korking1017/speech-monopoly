// 人物形象渲染组件
// 纯 SVG 绘制，无外部资源依赖，可在 iPad 离线环境稳定显示。

import { useMemo } from 'react'
import type { AvatarConfig } from '../types'
import { colorOf, normalizeAvatar } from '../data/avatar'

interface AvatarProps {
  avatar?: AvatarConfig | null
  /** 用于旧数据补全时生成稳定随机形象 */
  seed?: string
  size?: number
  /** 圆形裁剪，用于棋盘棋子 / 列表头像 */
  rounded?: boolean
  /** 额外的描边颜色 */
  ringColor?: string
  className?: string
  style?: React.CSSProperties
  title?: string
}

/** 加深颜色，用于阴影 */
function shade(hex: string, amount = -0.12): string {
  const c = hex.replace('#', '')
  const full = c.length === 3 ? c.split('').map((x) => x + x).join('') : c
  const num = parseInt(full, 16)
  let r = (num >> 16) & 255
  let g = (num >> 8) & 255
  let b = num & 255
  if (amount < 0) {
    r = Math.round(r * (1 + amount))
    g = Math.round(g * (1 + amount))
    b = Math.round(b * (1 + amount))
  } else {
    r = Math.round(r + (255 - r) * amount)
    g = Math.round(g + (255 - g) * amount)
    b = Math.round(b + (255 - b) * amount)
  }
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

/* ------------------------------- 脸型 ------------------------------- */

function FaceShape({ face, fill }: { face: string; fill: string }) {
  switch (face) {
    case 'square':
      return <rect x={28} y={26} width={44} height={48} rx={15} fill={fill} />
    case 'heart':
      return (
        <path
          d="M50 75 C 32 62 26 46 28 37 C 30 27 41 23 50 31 C 59 23 70 27 72 37 C 74 46 68 62 50 75 Z"
          fill={fill}
        />
      )
    case 'long':
      return <ellipse cx={50} cy={50} rx={20} ry={27} fill={fill} />
    case 'oval':
      return <ellipse cx={50} cy={49} rx={22} ry={25.5} fill={fill} />
    default:
      return <ellipse cx={50} cy={49} rx={24} ry={24} fill={fill} />
  }
}

/* ------------------------------- 头发 ------------------------------- */

function HairBack({ hair, color }: { hair: string; color: string }) {
  const dark = shade(color)
  switch (hair) {
    case 'long':
      return <ellipse cx={50} cy={54} rx={28} ry={33} fill={dark} />
    case 'bob':
      return <ellipse cx={50} cy={51} rx={27} ry={27} fill={dark} />
    case 'twintails':
      return (
        <g fill={dark}>
          <ellipse cx={50} cy={52} rx={25} ry={26} />
          <ellipse cx={23} cy={56} rx={9} ry={15} />
          <ellipse cx={77} cy={56} rx={9} ry={15} />
        </g>
      )
    case 'ponytail':
      return (
        <g fill={dark}>
          <ellipse cx={50} cy={52} rx={25} ry={26} />
          <ellipse cx={76} cy={58} rx={8} ry={17} />
        </g>
      )
    case 'bun':
      return (
        <g fill={dark}>
          <ellipse cx={50} cy={52} rx={25} ry={25} />
          <circle cx={50} cy={19} r={11} />
        </g>
      )
    case 'curly':
      return (
        <g fill={dark}>
          <circle cx={34} cy={30} r={13} />
          <circle cx={50} cy={24} r={14} />
          <circle cx={66} cy={30} r={13} />
          <circle cx={28} cy={44} r={10} />
          <circle cx={72} cy={44} r={10} />
        </g>
      )
    default:
      return null
  }
}

function HairFront({ hair, color }: { hair: string; color: string }) {
  const light = shade(color, 0.08)
  switch (hair) {
    case 'buzz':
      return (
        <path
          d="M29 45 Q 30 24 50 24 Q 70 24 71 45 Q 67 31 50 31 Q 33 31 29 45 Z"
          fill={color}
        />
      )
    case 'bob':
      return (
        <path
          d="M26 47 Q 26 21 50 21 Q 74 21 74 47 L 74 41 Q 64 34 50 34 Q 36 34 26 41 Z"
          fill={light}
        />
      )
    case 'long':
      return (
        <path
          d="M27 46 Q 28 22 50 22 Q 72 22 73 46 Q 70 30 52 32 Q 44 32 41 38 Q 36 32 27 46 Z"
          fill={light}
        />
      )
    case 'ponytail':
      return (
        <path
          d="M28 44 Q 30 23 50 23 Q 71 23 72 45 Q 66 29 50 33 Q 40 35 28 44 Z"
          fill={light}
        />
      )
    case 'twintails':
      return (
        <path
          d="M28 46 Q 28 23 50 23 Q 72 23 72 46 Q 64 32 50 32 Q 36 32 28 46 Z"
          fill={light}
        />
      )
    case 'curly':
      return (
        <g fill={light}>
          <circle cx={36} cy={33} r={10} />
          <circle cx={50} cy={28} r={11} />
          <circle cx={64} cy={33} r={10} />
        </g>
      )
    case 'bun':
      return (
        <path
          d="M29 45 Q 30 25 50 25 Q 70 25 71 45 Q 65 33 50 33 Q 35 33 29 45 Z"
          fill={light}
        />
      )
    default:
      return (
        <path
          d="M28 45 Q 30 23 50 23 Q 70 23 72 45 Q 65 30 50 31 Q 35 31 28 45 Z"
          fill={light}
        />
      )
  }
}

/* ------------------------------- 眼睛 ------------------------------- */

function Star({ cx, cy, r, fill }: { cx: number; cy: number; r: number; fill: string }) {
  const points: string[] = []
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45
    const a = (Math.PI / 5) * i - Math.PI / 2
    points.push(`${cx + rad * Math.cos(a)},${cy + rad * Math.sin(a)}`)
  }
  return <polygon points={points.join(' ')} fill={fill} />
}

function Eyes({ eyes, color = '#2B2B2B' }: { eyes: string; color?: string }) {
  const L = 41
  const R = 59
  const Y = 50
  if (eyes === 'smile') {
    return (
      <g stroke={color} strokeWidth={2.4} fill="none" strokeLinecap="round">
        <path d={`M${L - 3.5} ${Y + 1} Q ${L} ${Y - 3} ${L + 3.5} ${Y + 1}`} />
        <path d={`M${R - 3.5} ${Y + 1} Q ${R} ${Y - 3} ${R + 3.5} ${Y + 1}`} />
      </g>
    )
  }
  if (eyes === 'wink') {
    return (
      <g>
        <path
          d={`M${L - 3.5} ${Y} Q ${L} ${Y - 3.5} ${L + 3.5} ${Y}`}
          stroke={color}
          strokeWidth={2.4}
          fill="none"
          strokeLinecap="round"
        />
        <circle cx={R} cy={Y} r={3.4} fill={color} />
        <circle cx={R + 1.2} cy={Y - 1.2} r={1.2} fill="#fff" />
      </g>
    )
  }
  if (eyes === 'star') {
    return (
      <g>
        <Star cx={L} cy={Y} r={5} fill="#FFC107" />
        <Star cx={R} cy={Y} r={5} fill="#FFC107" />
      </g>
    )
  }
  const r = eyes === 'big' ? 4.6 : 3.4
  return (
    <g>
      <circle cx={L} cy={Y} r={r} fill={color} />
      <circle cx={R} cy={Y} r={r} fill={color} />
      <circle cx={L + r * 0.35} cy={Y - r * 0.35} r={r * 0.34} fill="#fff" />
      <circle cx={R + r * 0.35} cy={Y - r * 0.35} r={r * 0.34} fill="#fff" />
    </g>
  )
}

/* ------------------------------- 服装 ------------------------------- */

function Outfit({ outfit, color }: { outfit: string; color: string }) {
  const dark = shade(color, -0.22)
  const light = shade(color, 0.18)
  // 半身像：躯干向下延伸出画布，由圆形裁剪自然收边，衣饰颜色更醒目
  const torso = 'M6 122 Q 10 92 34 82 Q 42 78 50 78 Q 58 78 66 82 Q 90 92 94 122 Z'

  return (
    <g>
      <path d={torso} fill={color} />

      {outfit === 'shirt' && (
        <>
          {/* 白衬衫领 + 领带 */}
          <path d="M41 80 L50 94 L59 80 Q 50 77 41 80 Z" fill="#fff" />
          <path d="M50 92 L44 122 L56 122 Z" fill={dark} />
          <path d="M50 92 L46 84 L54 84 Z" fill={dark} />
        </>
      )}

      {outfit === 'hoodie' && (
        <>
          {/* 帽子轮廓 + 抽绳 + 口袋 */}
          <path d="M34 82 Q 50 98 66 82 Q 50 76 34 82 Z" fill={dark} />
          <path d="M45 90 L44 108 M55 90 L56 108" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
          <path d="M26 110 Q 50 116 74 110" stroke={dark} strokeWidth={4} fill="none" strokeLinecap="round" />
        </>
      )}

      {outfit === 'dress' && (
        <>
          {/* 花边领 */}
          <path d="M36 81 Q 43 90 50 82 Q 57 90 64 81 Q 50 76 36 81 Z" fill={light} />
          <path d="M28 96 Q 50 102 72 96" stroke={light} strokeWidth={2.4} fill="none" />
        </>
      )}

      {outfit === 'sweater' && (
        <>
          {/* 罗纹高领 + 针织纹理 */}
          <path d="M38 82 Q 50 92 62 82" stroke={dark} strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d="M24 100 Q 50 106 76 100" stroke={light} strokeWidth={2} fill="none" opacity={0.75} />
          <path d="M26 112 Q 50 118 74 112" stroke={light} strokeWidth={2} fill="none" opacity={0.5} />
        </>
      )}

      {outfit === 'sport' && (
        <>
          {/* 运动服 V 领 + 肩部条纹 */}
          <path d="M42 81 L50 92 L58 81" stroke="#fff" strokeWidth={2.6} fill="none" />
          <path d="M22 90 L14 120 M78 90 L86 120" stroke="#fff" strokeWidth={4} opacity={0.9} />
          <path d="M50 96 L50 120" stroke="#fff" strokeWidth={2} opacity={0.6} />
        </>
      )}

      {outfit === 'tshirt' && (
        <path d="M39 81 Q 50 92 61 81" stroke={dark} strokeWidth={3} fill="none" strokeLinecap="round" />
      )}

      {/* 外轮廓，增强立体感 */}
      <path d={torso} fill="none" stroke={dark} strokeWidth={1.2} opacity={0.45} />
    </g>
  )
}

/* ------------------------------- 配饰 ------------------------------- */

function Accessory({ accessory }: { accessory: string }) {
  switch (accessory) {
    case 'glasses':
      return (
        <g stroke="#3A3A3A" strokeWidth={1.8} fill="rgba(255,255,255,0.28)">
          <circle cx={41} cy={50} r={8} />
          <circle cx={59} cy={50} r={8} />
          <path d="M49 50 L51 50 M33 48 L27 46 M67 48 L73 46" />
        </g>
      )
    case 'hat':
      return (
        <g>
          <ellipse cx={50} cy={27} rx={30} ry={5.5} fill="#E05B5B" />
          <path d="M32 27 Q 32 8 50 8 Q 68 8 68 27 Z" fill="#EF6B6B" />
          <path d="M32 24 L68 24 L68 27 L32 27 Z" fill="#C94B4B" />
        </g>
      )
    case 'bow':
      return (
        <g fill="#EF5B8B">
          <path d="M68 22 L60 17 L60 27 Z" />
          <path d="M68 22 L76 17 L76 27 Z" />
          <circle cx={68} cy={22} r={2.6} fill="#C94570" />
        </g>
      )
    case 'headphones':
      return (
        <g>
          <path d="M24 48 Q 24 18 50 18 Q 76 18 76 48" stroke="#4A5568" strokeWidth={5} fill="none" />
          <rect x={18} y={42} width={11} height={17} rx={5} fill="#5B8DEF" />
          <rect x={71} y={42} width={11} height={17} rx={5} fill="#5B8DEF" />
        </g>
      )
    case 'crown':
      return (
        <g>
          <path d="M32 22 L38 10 L44 20 L50 8 L56 20 L62 10 L68 22 Z" fill="#FFD54A" />
          <rect x={32} y={22} width={36} height={5} rx={2} fill="#F0BE2E" />
          <circle cx={50} cy={13} r={2} fill="#EF5B5B" />
        </g>
      )
    case 'flower':
      return (
        <g transform="translate(70 26)">
          <g fill="#F58FB5">
            <circle cx={0} cy={-4} r={3.4} />
            <circle cx={4} cy={0} r={3.4} />
            <circle cx={0} cy={4} r={3.4} />
            <circle cx={-4} cy={0} r={3.4} />
          </g>
          <circle cx={0} cy={0} r={2.4} fill="#FFE066" />
        </g>
      )
    default:
      return null
  }
}

/* ------------------------------ 主组件 ------------------------------ */

export default function Avatar({
  avatar,
  seed,
  size = 64,
  rounded = false,
  ringColor,
  className,
  style,
  title,
}: AvatarProps) {
  const config = useMemo(() => normalizeAvatar(avatar, seed), [avatar, seed])
  const skin = colorOf(config.skin)
  const hair = colorOf(config.hairColor)
  const outfit = colorOf(config.outfitColor)

  const clipId = useMemo(
    () => `avclip_${Math.random().toString(36).slice(2, 9)}`,
    [],
  )

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      style={{ display: 'block', flexShrink: 0, ...style }}
      role="img"
      aria-label={title || '人物形象'}
    >
      <title>{title || '人物形象'}</title>
      <defs>
        <clipPath id={clipId}>
          <circle cx={50} cy={50} r={50} />
        </clipPath>
      </defs>
      <g clipPath={rounded ? `url(#${clipId})` : undefined}>
        {rounded && <circle cx={50} cy={50} r={50} fill="#F1F5FD" />}
        {/* 后层头发 */}
        <HairBack hair={config.hair} color={hair} />
        {/* 脖子 */}
        <rect x={44} y={64} width={12} height={16} rx={5} fill={shade(skin, -0.12)} />
        {/* 耳朵 */}
        <ellipse cx={27.5} cy={51} rx={4} ry={5.5} fill={shade(skin, -0.06)} />
        <ellipse cx={72.5} cy={51} rx={4} ry={5.5} fill={shade(skin, -0.06)} />
        {/* 脸 */}
        <FaceShape face={config.face} fill={skin} />
        <ellipse cx={50} cy={58} rx={13} ry={9} fill="#FF9AA2" opacity={0.13} />
        {/* 前层头发 */}
        <HairFront hair={config.hair} color={hair} />
        {/* 五官 */}
        <g stroke={shade(hair, -0.3)} strokeWidth={1.6} strokeLinecap="round" opacity={0.75}>
          <path d="M37 42 Q 41 40 45 42" fill="none" />
          <path d="M55 42 Q 59 40 63 42" fill="none" />
        </g>
        <Eyes eyes={config.eyes} />
        <path
          d="M45 60 Q 50 65 55 60"
          stroke="#B4525A"
          strokeWidth={1.9}
          fill="none"
          strokeLinecap="round"
        />
        {/* 腮红 */}
        <ellipse cx={34} cy={56} rx={4} ry={2.6} fill="#FF8FA3" opacity={0.35} />
        <ellipse cx={66} cy={56} rx={4} ry={2.6} fill="#FF8FA3" opacity={0.35} />
        {/* 身体 */}
        <Outfit outfit={config.outfit} color={outfit} />
        {/* 配饰 */}
        <Accessory accessory={config.accessory} />
      </g>
      {ringColor && (
        <circle cx={50} cy={50} r={48} fill="none" stroke={ringColor} strokeWidth={4} />
      )}
    </svg>
  )
}
