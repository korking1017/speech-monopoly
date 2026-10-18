// 人物形象编辑器
// 可设置：脸型 / 肤色 / 发型 / 发色 / 眼睛 / 衣饰 / 服装颜色 / 配饰
// 左侧实时预览，右侧分类选择，全部为内置 SVG 部件。

import { useState, useMemo } from 'react'
import type { AvatarConfig } from '../types'
import Avatar from './Avatar'
import {
  AVATAR_PARTS,
  DEFAULT_AVATAR,
  normalizeAvatar,
  randomAvatar,
  type ColorOption,
  type PartOption,
} from '../data/avatar'

type PartKey = keyof AvatarConfig

const TABS: { key: PartKey; label: string; icon: string; kind: 'part' | 'color' }[] = [
  { key: 'face', label: '脸型', icon: '🙂', kind: 'part' },
  { key: 'skin', label: '肤色', icon: '🎨', kind: 'color' },
  { key: 'hair', label: '发型', icon: '💇', kind: 'part' },
  { key: 'hairColor', label: '发色', icon: '🖌️', kind: 'color' },
  { key: 'eyes', label: '眼睛', icon: '👀', kind: 'part' },
  { key: 'outfit', label: '衣饰', icon: '👕', kind: 'part' },
  { key: 'outfitColor', label: '衣服颜色', icon: '🌈', kind: 'color' },
  { key: 'accessory', label: '配饰', icon: '👑', kind: 'part' },
]

export default function AvatarBuilder({
  value,
  seed,
  onChange,
  size = 140,
}: {
  value?: AvatarConfig | null
  seed?: string
  onChange: (next: AvatarConfig) => void
  size?: number
}) {
  const [tab, setTab] = useState<PartKey>('face')

  const current = useMemo(() => normalizeAvatar(value, seed), [value, seed])
  const active = TABS.find((t) => t.key === tab)!

  const options: (PartOption | ColorOption)[] = AVATAR_PARTS[active.key] as any
  const isColor = active.kind === 'color'

  const setPart = (id: string) => {
    onChange({ ...current, [active.key]: id })
  }

  return (
    <div>
      {/* 预览区 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          padding: '14px',
          backgroundColor: '#F7F9FE',
          borderRadius: '16px',
          marginBottom: '14px',
        }}
      >
        <div
          style={{
            padding: '8px',
            backgroundColor: '#fff',
            borderRadius: '50%',
            boxShadow: '0 6px 18px rgba(91,141,239,0.18)',
          }}
        >
          <Avatar avatar={current} seed={seed} size={size} rounded />
        </div>
        <button
          onClick={() => onChange(randomAvatar(`${seed || ''}_${Date.now()}`))}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: 'bold',
            backgroundColor: '#fff',
            color: '#5B8DEF',
            border: '2px solid #D6E2FB',
          }}
        >
          🎲 随机形象
        </button>
      </div>

      {/* 分类标签 */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '10px' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flexShrink: 0,
              padding: '8px 12px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 'bold',
              backgroundColor: tab === t.key ? '#5B8DEF' : '#f5f5f5',
              color: tab === t.key ? '#fff' : '#555',
              border: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* 部件选择 */}
      {isColor ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {(options as ColorOption[]).map((opt) => {
            const selected = (current as any)[active.key] === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => setPart(opt.id)}
                title={opt.label}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  backgroundColor: opt.swatch,
                  border: selected ? '3px solid #5B8DEF' : '3px solid #fff',
                  boxShadow: selected
                    ? '0 0 0 2px rgba(91,141,239,0.35)'
                    : '0 1px 4px rgba(0,0,0,0.12)',
                  cursor: 'pointer',
                }}
              />
            )
          })}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: '8px' }}>
          {(options as PartOption[]).map((opt) => {
            const selected = (current as any)[active.key] === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => setPart(opt.id)}
                style={{
                  padding: '8px 4px',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: selected ? '#EAF1FF' : '#f9f9f9',
                  border: selected ? '2px solid #5B8DEF' : '2px solid transparent',
                  cursor: 'pointer',
                }}
              >
                <Avatar
                  avatar={{ ...current, [active.key]: opt.id } as AvatarConfig}
                  size={44}
                  rounded
                />
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: selected ? 'bold' : 'normal',
                    color: selected ? '#5B8DEF' : '#666',
                  }}
                >
                  {opt.label}
                </span>
              </button>
            )
          })}
        </div>
      )}

      <div style={{ marginTop: '12px', textAlign: 'center' }}>
        <button
          onClick={() => onChange({ ...DEFAULT_AVATAR })}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            fontSize: '13px',
            backgroundColor: '#f5f5f5',
            color: '#666',
            border: 'none',
          }}
        >
          恢复默认
        </button>
      </div>
    </div>
  )
}
