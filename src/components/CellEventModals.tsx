// 棋盘特殊格子的结果弹窗：奖励格 / 幸运转盘 / 道具格
// 效果在进入弹窗时已经结算完成，弹窗负责「清楚地告诉老师发生了什么」。

import { useEffect, useState } from 'react'
import { Modal, styles } from './UI'

export type CellEventKind = 'bonus' | 'fortune' | 'card'

export interface CellEvent {
  kind: CellEventKind
  actorName: string
  /** 幸运转盘：中奖扇区索引 */
  rewardIndex?: number
  /** 幸运转盘：奖励文案 */
  rewardLabel?: string
  /** 道具格：抽到的卡 */
  card?: { icon?: string; name?: string; description?: string }
  /** 奖励格：加分 */
  points?: number
}

/** 与 GamePage 中结算逻辑一一对应的转盘奖励 */
export const FORTUNE_REWARDS = [
  { key: 'double', label: '积分翻倍', icon: '✨', color: '#FF9800' },
  { key: 'p2', label: '获得 2 分', icon: '💎', color: '#5B8DEF' },
  { key: 'p3', label: '获得 3 分', icon: '⭐', color: '#4CAF50' },
  { key: 'card', label: '获得道具卡', icon: '🎁', color: '#9C6BE0' },
  { key: 'move', label: '前进 1 格', icon: '🏃', color: '#00BCD4' },
] as const

const SEG = 360 / FORTUNE_REWARDS.length

function Wheel({ rewardIndex }: { rewardIndex: number }) {
  const [rotation, setRotation] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    // 先让 0 度渲染一帧，再转到目标角度，过渡才会生效
    const spin = setTimeout(() => {
      // 让中奖扇区中心停在正上方，并多转 5 圈
      setRotation(360 * 5 - (rewardIndex * SEG + SEG / 2))
    }, 60)
    const timer = setTimeout(() => setDone(true), 2400)
    return () => {
      clearTimeout(spin)
      clearTimeout(timer)
    }
  }, [rewardIndex])

  const gradient = FORTUNE_REWARDS.map(
    (r, i) => `${r.color} ${i * SEG}deg ${(i + 1) * SEG}deg`,
  ).join(', ')

  return (
    <div
      style={{
        position: 'relative',
        width: 210,
        height: 210,
        margin: '0 auto 10px',
      }}
    >
      {/* 指针 */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: -8,
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '11px solid transparent',
          borderRight: '11px solid transparent',
          borderTop: '20px solid #F44336',
          zIndex: 5,
          filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))',
        }}
      />
      {/* 转盘 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          backgroundColor: '#F1F1F1',
          backgroundImage: `conic-gradient(${gradient})`,
          border: '6px solid #fff',
          boxShadow: '0 6px 18px rgba(0,0,0,0.22)',
          transform: `rotate(${rotation}deg)`,
          transition: 'transform 2.2s cubic-bezier(0.17, 0.67, 0.12, 1)',
        }}
      >
        {FORTUNE_REWARDS.map((r, i) => {
          const angle = i * SEG + SEG / 2
          return (
            <span
              key={r.key}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                fontSize: 20,
                lineHeight: 1,
                transform: `translate(-50%,-50%) rotate(${angle}deg) translateY(-64px) rotate(${-angle}deg)`,
              }}
            >
              {r.icon}
            </span>
          )
        })}
      </div>
      {/* 中心轴 */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 34,
          height: 34,
          marginLeft: -17,
          marginTop: -17,
          borderRadius: '50%',
          backgroundColor: '#fff',
          boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 17,
          zIndex: 4,
        }}
      >
        🎰
      </div>
      {/* 转动中提示 */}
      {!done && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: -26,
            textAlign: 'center',
            fontSize: 13,
            color: '#999',
          }}
        >
          转盘转动中…
        </div>
      )}
    </div>
  )
}

export default function CellEventModal({
  event,
  onClose,
}: {
  event: CellEvent
  onClose: () => void
}) {
  const [revealed, setRevealed] = useState(event.kind !== 'fortune')

  useEffect(() => {
    if (event.kind !== 'fortune') return
    setRevealed(false)
    const t = setTimeout(() => setRevealed(true), 2400)
    return () => clearTimeout(t)
  }, [event])

  if (event.kind === 'bonus') {
    return (
      <Modal title="⭐ 奖励格" onClose={onClose} maxWidth={400}>
        <div style={{ textAlign: 'center', padding: '6px 0 4px' }}>
          <div style={{ fontSize: 56, lineHeight: 1, marginBottom: 10, animation: 'fadeInUp 0.3s ease-out' }}>
            ⭐
          </div>
          <div style={{ fontSize: 16, color: '#666', marginBottom: 6 }}>{event.actorName}</div>
          <div style={{ fontSize: 30, fontWeight: 'bold', color: '#FF9800', marginBottom: 8 }}>
            +{event.points ?? 3} 分
          </div>
          <div style={{ fontSize: 14, color: '#888' }}>踩到奖励格，直接获得积分！</div>
        </div>
        <button onClick={onClose} style={{ ...styles.primaryBtn, width: '100%', marginTop: 18, backgroundColor: '#FF9800' }}>
          太好了
        </button>
      </Modal>
    )
  }

  if (event.kind === 'fortune') {
    return (
      <Modal title="🎰 幸运转盘" onClose={onClose} maxWidth={420}>
        <div style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 10 }}>
          {event.actorName} 转动了幸运转盘
        </div>
        <Wheel rewardIndex={event.rewardIndex ?? 0} />
        <div style={{ height: 30 }} />
        <div
          style={{
            padding: '14px',
            borderRadius: 12,
            textAlign: 'center',
            backgroundColor: revealed ? '#FFF8E1' : '#F5F5F5',
            transition: 'background-color 0.3s',
          }}
        >
          {revealed ? (
            <>
              <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>恭喜获得</div>
              <div style={{ fontSize: 22, fontWeight: 'bold', color: '#FF9800' }}>
                {event.rewardLabel || '奖励'}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 14, color: '#aaa' }}>揭晓中…</div>
          )}
        </div>
        <button
          onClick={onClose}
          disabled={!revealed}
          style={{
            ...styles.primaryBtn,
            width: '100%',
            marginTop: 16,
            backgroundColor: revealed ? '#FF9800' : '#ccc',
          }}
        >
          {revealed ? '收下奖励' : '请稍候…'}
        </button>
      </Modal>
    )
  }

  // card
  return (
    <Modal title="🎴 道具格" onClose={onClose} maxWidth={400}>
      <div style={{ textAlign: 'center', padding: '4px 0' }}>
        <div style={{ fontSize: 14, color: '#666', marginBottom: 14 }}>{event.actorName} 抽到了道具</div>
        <div
          style={{
            display: 'inline-block',
            padding: '18px 22px',
            borderRadius: 16,
            background: 'linear-gradient(160deg, #FFF8E1 0%, #FFE9B8 100%)',
            border: '3px solid #FFD700',
            boxShadow: '0 6px 18px rgba(255,193,7,0.3)',
            minWidth: 150,
            animation: 'fadeInUp 0.35s ease-out',
          }}
        >
          <div style={{ fontSize: 46, lineHeight: 1, marginBottom: 8 }}>{event.card?.icon || '🎴'}</div>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#7A5B00' }}>{event.card?.name}</div>
          {event.card?.description && (
            <div style={{ fontSize: 12, color: '#8A6D1F', marginTop: 6, lineHeight: 1.5, maxWidth: 200 }}>
              {event.card.description}
            </div>
          )}
        </div>
        <div style={{ fontSize: 13, color: '#4CAF50', fontWeight: 'bold', marginTop: 16 }}>
          ✅ 已放入背包
        </div>
      </div>
      <button onClick={onClose} style={{ ...styles.primaryBtn, width: '100%', marginTop: 16, backgroundColor: '#F5B700' }}>
        收下
      </button>
    </Modal>
  )
}
