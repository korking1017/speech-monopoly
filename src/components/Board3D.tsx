// 2D 仿 3D（等距/2.5D）棋盘
// 通过等距投影 + 立体厚度 + 投影 + 移动动画，营造实体桌游棋盘的观感。
// 格子顺序沿用原有蛇形回合路径，玩法与旧版本完全一致。

import { useMemo, useRef, useState, useEffect } from 'react'
import type { BoardCell } from '../data/board'
import { computeBoardLayout } from '../data/board'
import Avatar from './Avatar'

/** 等距菱形裁剪路径 */
const RHOMBUS = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'

export interface BoardActor {
  id: string
  name: string
  avatar?: any
  icon?: string
  position: number
  score?: number
  color?: string
  members?: any[]
}

interface Board3DProps {
  cells: BoardCell[]
  actors: BoardActor[]
  selectedActorId?: string | null
  onSelectActor?: (id: string) => void
}

/** 将颜色加深/变浅，用于立体面的明暗 */
function shadeColor(hex: string, amount: number): string {
  const c = String(hex || '#CCCCCC').replace('#', '')
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

export default function Board3D({
  cells,
  actors,
  selectedActorId,
  onSelectActor,
}: Board3DProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(760)

  // 自适应宽度：iPad 竖屏 / 横屏都能完整显示
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const update = () => setContainerWidth(el.clientWidth || 760)
    update()
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update)
      return () => window.removeEventListener('resize', update)
    }
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const layout = useMemo(
    () => computeBoardLayout(cells.length, containerWidth),
    [cells.length, containerWidth],
  )

  const showLabel = layout.tileW >= 46
  const showIndex = layout.tileW >= 52

  /** 把棋子按所在格分组，同一格内左右错开避免重叠 */
  const pieces = useMemo(() => {
    const byCell = new Map<number, BoardActor[]>()
    for (const a of actors) {
      const pos = Math.max(0, Math.min(a.position ?? 0, cells.length - 1))
      if (!byCell.has(pos)) byCell.set(pos, [])
      byCell.get(pos)!.push(a)
    }
    const list: { actor: BoardActor; x: number; y: number; key: string }[] = []
    for (const [pos, group] of byCell) {
      const lay = layout.cells[pos]
      if (!lay) continue
      const spread = Math.min(layout.tileW * 0.4, 26)
      group.forEach((actor, idx) => {
        const offset = (idx - (group.length - 1) / 2) * spread
        list.push({ actor, x: lay.x + offset, y: lay.y, key: actor.id })
      })
    }
    return list
  }, [actors, cells.length, layout])

  // 路径连接线（体现蛇形回合路线）
  const connectors = useMemo(() => {
    const list: { x: number; y: number; len: number; angle: number; key: string }[] = []
    for (let i = 0; i < layout.cells.length - 1; i++) {
      const a = layout.cells[i]
      const b = layout.cells[i + 1]
      const dx = b.x - a.x
      const dy = b.y - a.y
      list.push({
        x: a.x,
        y: a.y,
        len: Math.hypot(dx, dy),
        angle: (Math.atan2(dy, dx) * 180) / Math.PI,
        key: `c${i}`,
      })
    }
    return list
  }, [layout])

  const pieceSize = Math.max(18, Math.min(40, layout.tileW * 0.58))

  return (
    <div
      ref={wrapRef}
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        perspective: '1500px',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: layout.width,
          height: layout.height,
          // 整体轻微倾斜，增强立体纵深感
          transform: 'rotateX(5deg)',
        }}
      >
        {/* 棋盘底板（立体厚度 + 柔和投影） */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: layout.height * 0.02,
            width: layout.width,
            height: layout.height * 0.9,
            borderRadius: '20px',
            background: 'linear-gradient(160deg, #46577C 0%, #2A3550 55%, #1E2740 100%)',
            boxShadow: `0 ${layout.depth + 8}px 0 #161C2C, 0 ${layout.depth + 24}px 34px rgba(0,0,0,0.38)`,
            zIndex: 0,
          }}
        />

        {/* 路径连接线 */}
        {connectors.map((c) => (
          <div
            key={c.key}
            style={{
              position: 'absolute',
              left: c.x,
              top: c.y,
              width: c.len,
              height: 3,
              borderRadius: 2,
              backgroundColor: 'rgba(255,255,255,0.18)',
              transformOrigin: '0 50%',
              transform: `rotate(${c.angle}deg)`,
              zIndex: 1,
              pointerEvents: 'none',
            }}
          />
        ))}

        {/*
          格子渲染分两遍：
          第一遍画所有「立体侧面」，第二遍画所有「顶面 + 内容」。
          否则后画格子的侧面向下偏移后，会盖住前一个格子的文字。
        */}

        {/* 第一遍：立体侧面（向下偏移的深色菱形，露出的部分即厚度） */}
        {cells.map((cell, i) => {
          const lay = layout.cells[i]
          if (!lay) return null
          return (
            <div
              key={`side-${cell.index}`}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: layout.tileW,
                height: layout.tileH,
                transform: `translate(${lay.x - layout.tileW / 2}px, ${lay.y - layout.tileH / 2 + layout.depth}px)`,
                backgroundColor: shadeColor(cell.color, -0.44),
                clipPath: RHOMBUS,
                zIndex: 10 + Math.round(lay.y),
                pointerEvents: 'none',
              }}
            />
          )
        })}

        {/* 第二遍：顶面 + 图标文字 */}
        {cells.map((cell, i) => {
          const lay = layout.cells[i]
          if (!lay) return null
          const base = cell.color
          const topLight = shadeColor(base, 0.36)
          const topMid = shadeColor(base, 0.04)

          return (
            <div
              key={cell.index}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: layout.tileW,
                height: layout.tileH,
                transform: `translate(${lay.x - layout.tileW / 2}px, ${lay.y - layout.tileH / 2}px)`,
                // 靠后的格子层级更低，保证遮挡关系正确
                zIndex: 20 + Math.round(lay.y),
              }}
            >
              {/* 顶面（仅背景参与菱形裁剪） */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(135deg, ${topLight} 0%, ${base} 48%, ${topMid} 100%)`,
                  clipPath: RHOMBUS,
                  boxShadow: 'inset 0 0 12px rgba(255,255,255,0.22)',
                }}
              />

              {/* 内容层：不做裁剪，保证图标与文字完整可读 */}
              <div style={{ position: 'absolute', inset: 0 }}>
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-118%)',
                    textAlign: 'center',
                    fontSize: Math.max(9, layout.tileW * (showLabel ? 0.19 : 0.28)),
                    lineHeight: 1,
                    filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))',
                  }}
                >
                  {cell.icon}
                </div>
                {showLabel && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: '50%',
                      transform: 'translateY(12%)',
                      textAlign: 'center',
                      fontSize: Math.max(6.5, layout.tileW * 0.105),
                      lineHeight: 1.1,
                      color: 'rgba(255,255,255,0.98)',
                      fontWeight: 'bold',
                      textShadow: '0 1px 2px rgba(0,0,0,0.55)',
                      whiteSpace: 'nowrap',
                      letterSpacing: '-0.03em',
                    }}
                  >
                    {cell.title}
                  </div>
                )}
              </div>

              {/* 序号 */}
              {showIndex && (
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%,-50%) translate(${layout.tileW * 0.33}px, ${-layout.tileH * 0.06}px)`,
                    fontSize: Math.max(7, layout.tileW * 0.12),
                    color: 'rgba(255,255,255,0.55)',
                    fontWeight: 'bold',
                    pointerEvents: 'none',
                  }}
                >
                  {cell.index}
                </div>
              )}
            </div>
          )
        })}

        {/* 棋子层：独立于格子，位置变化时可平滑过渡 */}
        {pieces.map(({ actor, x, y, key }) => {
          const isSelected = actor.id === selectedActorId
          const isTeam = Array.isArray(actor.members) && actor.members.length > 0
          return (
            <div
              key={key}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: pieceSize,
                height: pieceSize,
                // 用 transform 定位，位置变化由 transition 平滑动画
                transform: `translate(${x - pieceSize / 2}px, ${y - pieceSize / 2 - pieceSize * 0.72}px)`,
                transition: 'transform 0.55s cubic-bezier(0.34, 1.25, 0.64, 1)',
                zIndex: 1000 + Math.round(y),
              }}
            >
              {/* 地面投影 */}
              <span
                style={{
                  position: 'absolute',
                  left: '50%',
                  bottom: -pieceSize * 0.18,
                  width: pieceSize * 0.8,
                  height: pieceSize * 0.28,
                  marginLeft: -pieceSize * 0.4,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0,0,0,0.35)',
                  filter: 'blur(1.5px)',
                }}
              />
              {isSelected && (
                <span
                  style={{
                    position: 'absolute',
                    inset: -3,
                    borderRadius: '50%',
                    border: '3px solid #FFD700',
                    animation: 'pulseRing 1.4s ease-in-out infinite',
                  }}
                />
              )}
              {isTeam ? (
                /* 团队棋子：队伍色圆章 + 队徽 */
                <button
                  onClick={() => onSelectActor?.(actor.id)}
                  title={`${actor.name}${actor.score !== undefined ? ` · ${actor.score}分` : ''}`}
                  style={{
                    position: 'relative',
                    width: pieceSize,
                    height: pieceSize,
                    padding: 0,
                    border: 'none',
                    borderRadius: '50%',
                    minWidth: 0,
                    minHeight: 0,
                    zIndex: 2,
                    background: `radial-gradient(circle at 35% 30%, ${shadeColor(actor.color || '#5B8DEF', 0.35)}, ${actor.color || '#5B8DEF'})`,
                    boxShadow: `0 2px 0 ${shadeColor(actor.color || '#5B8DEF', -0.35)}, inset 0 0 0 2px rgba(255,255,255,0.5)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: pieceSize * 0.55,
                    lineHeight: 1,
                  }}
                >
                  {actor.icon || '🏳️'}
                </button>
              ) : (
                <button
                  onClick={() => onSelectActor?.(actor.id)}
                  title={`${actor.name}${actor.score !== undefined ? ` · ${actor.score}分` : ''}`}
                  style={{
                    position: 'relative',
                    width: pieceSize,
                    height: pieceSize,
                    padding: 0,
                    border: 'none',
                    background: 'none',
                    minWidth: 0,
                    minHeight: 0,
                    zIndex: 2,
                  }}
                >
                  <Avatar avatar={actor.avatar} seed={actor.id} size={pieceSize} rounded />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
