import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getRandomQuestion, CELL_TYPE_TO_QUESTION, CARD_POOL } from '../data/questions'

// ==================== 棋盘配置 ====================
const BOARD_CELLS = [
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

// ==================== 判断卡片类型的工具函数 ====================
function getCardType(card: any): string {
  if (card.cardType) return card.cardType
  if (card.id) {
    if (card.id.includes('skip')) return 'skip'
    if (card.id.includes('double')) return 'double'
    if (card.id.includes('assign')) return 'assign'
    if (card.id.includes('steal')) return 'steal'
    if (card.id.includes('shield')) return 'shield'
    if (card.id.includes('swap')) return 'swap'
    if (card.id.includes('lucky')) return 'lucky'
  }
  return 'unknown'
}

// ==================== 指定卡弹窗 ====================
function AssignCardModal({ actor, candidates, onSelect, onCancel }: {
  actor: any
  candidates: any[]
  onSelect: (target: any) => void
  onCancel: () => void
}) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 2100,
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: '20px', padding: '24px',
        width: '90%', maxWidth: '500px',
      }}>
        <h3 style={{ marginBottom: '16px' }}>👉 使用指定卡</h3>
        <p style={{ marginBottom: '16px', color: '#666' }}>
          {actor.icon} {actor.name} 使用了指定卡！请选择一位同学代替完成任务：
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {candidates.map((c: any) => (
            <button key={c.id} onClick={() => onSelect(c)} style={{
              padding: '14px', borderRadius: '12px', fontSize: '16px',
              backgroundColor: '#f5f5f5', border: '2px solid #E0E0E0',
              display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
            }}>
              <span style={{ fontSize: '24px' }}>{c.icon}</span>
              <span style={{ fontWeight: 'bold' }}>{c.name}</span>
              <span style={{ marginLeft: 'auto', color: '#666' }}>{c.score}分</span>
            </button>
          ))}
        </div>
        <button onClick={onCancel} style={{
          width: '100%', padding: '12px', borderRadius: '10px',
          backgroundColor: '#f5f5f5', color: '#666', fontSize: '15px',
        }}>取消</button>
      </div>
    </div>
  )
}

// ==================== 任务弹窗 ====================
function TaskModal({ question, actor, onComplete, onSkip, onUseCard }: {
  question: any
  actor: any
  onComplete: (stars: number, bonuses: any) => void
  onSkip: () => void
  onUseCard: (card: any) => string
}) {
  const [timer, setTimer] = useState(question.timeLimit)
  const [stars, setStars] = useState(0)
  const [bonuses, setBonuses] = useState({ loudVoice: false, goodEmotion: false, creative: false })
  const [phase, setPhase] = useState<'performing' | 'scoring'>('performing')
  const [showCards, setShowCards] = useState(false)
  const [cardMessage, setCardMessage] = useState('')

  useEffect(() => {
    if (phase === 'performing' && timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000)
      return () => clearInterval(interval)
    }
    if (timer === 0) setPhase('scoring')
  }, [timer, phase])

  const handleUseCard = (card: any) => {
    const msg = onUseCard(card)
    setCardMessage(msg)
    setShowCards(false)
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 2000,
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: '20px', padding: '24px',
        width: '90%', maxWidth: '550px', maxHeight: '85vh', overflow: 'auto',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px',
        }}>
          <div style={{
            display: 'inline-block', padding: '6px 14px', borderRadius: '20px',
            backgroundColor: '#FFF3E0', color: '#FF9800', fontWeight: 'bold', fontSize: '14px',
          }}>
            {question.type === 'tongue_twister' && '🔤 绕口令'}
            {question.type === 'recitation' && '📖 朗诵'}
            {question.type === 'impromptu' && '💡 即兴演讲'}
            {question.type === 'imitation' && '🎭 模仿秀'}
          </div>
          <div style={{ fontSize: '13px', color: '#999' }}>
            {actor.icon} {actor.name} | 🎒×{actor.cards?.length || 0}
          </div>
        </div>

        <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>{question.title}</h3>
        <div style={{
          backgroundColor: '#f9f9f9', padding: '16px', borderRadius: '12px',
          marginBottom: '12px', fontSize: '16px', lineHeight: '1.8', whiteSpace: 'pre-wrap',
        }}>
          {question.content}
        </div>

        {cardMessage && (
          <div style={{
            padding: '10px', borderRadius: '10px', backgroundColor: '#E8F5E9',
            color: '#4CAF50', fontWeight: 'bold', marginBottom: '12px', textAlign: 'center',
          }}>
            {cardMessage}
          </div>
        )}

        <button onClick={() => setShowCards(!showCards)} style={{
          width: '100%', padding: '10px', borderRadius: '10px',
          backgroundColor: '#FFF8E1', border: '2px solid #FFD700',
          fontWeight: 'bold', fontSize: '14px', marginBottom: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}>
          🎒 使用道具 ({actor.cards?.length || 0}张)
        </button>

        {showCards && (
          <div style={{
            backgroundColor: '#f9f9f9', borderRadius: '12px', padding: '12px',
            marginBottom: '12px', maxHeight: '160px', overflow: 'auto',
          }}>
            {(!actor.cards || actor.cards.length === 0) ? (
              <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>暂无道具</div>
            ) : (
              actor.cards.map((card: any, i: number) => (
                <div key={card.id || i} style={{
                  display: 'flex', alignItems: 'center', padding: '10px',
                  backgroundColor: '#fff', borderRadius: '10px', marginBottom: '6px', gap: '10px',
                }}>
                  <span style={{ fontSize: '24px' }}>{card.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{card.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{card.description}</div>
                  </div>
                  <button onClick={() => handleUseCard(card)} style={{
                    padding: '6px 14px', borderRadius: '8px', fontSize: '13px',
                    backgroundColor: '#5B8DEF', color: '#fff', fontWeight: 'bold',
                  }}>使用</button>
                </div>
              ))
            )}
          </div>
        )}

        {phase === 'performing' && (
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <span style={{
              fontSize: '36px', fontWeight: 'bold',
              color: timer <= 5 ? '#F44336' : '#FF9800',
            }}>⏱️ {timer}s</span>
            <div style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>等待学生完成...</div>
          </div>
        )}

        {phase === 'scoring' && (
          <div style={{ borderTop: '2px solid #f0f0f0', paddingTop: '16px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '15px' }}>⭐ 教师评分</div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => setStars(s)} style={{
                  fontSize: '40px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                  filter: s <= stars ? 'none' : 'grayscale(1)',
                  transform: s <= stars ? 'scale(1.15)' : 'scale(1)', transition: 'all 0.2s',
                }}>⭐</button>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginBottom: '16px', color: '#FF9800', fontWeight: 'bold' }}>
              {stars === 0 && '请点击星星评分'}
              {stars === 1 && '⭐ 需要多加练习'}
              {stars === 2 && '⭐⭐ 有进步空间'}
              {stars === 3 && '⭐⭐⭐ 基本完成'}
              {stars === 4 && '⭐⭐⭐⭐ 表现不错'}
              {stars === 5 && '⭐⭐⭐⭐⭐ 非常优秀！'}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>额外加分：</div>
              {[
                { key: 'loudVoice', label: '声音洪亮 (+1分)' },
                { key: 'goodEmotion', label: '情感饱满 (+1分)' },
                { key: 'creative', label: '创意发挥 (+1分)' },
              ].map(item => (
                <label key={item.key} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  marginBottom: '6px', cursor: 'pointer',
                }}>
                  <input type="checkbox" checked={(bonuses as any)[item.key]}
                    onChange={e => setBonuses({ ...bonuses, [item.key]: e.target.checked })}
                    style={{ width: '20px', height: '20px' }} />
                  {item.label}
                </label>
              ))}
            </div>
            <div style={{
              textAlign: 'center', padding: '10px', backgroundColor: '#FFF8E1',
              borderRadius: '10px', marginBottom: '16px', fontWeight: 'bold', fontSize: '16px',
            }}>
              预计得分：{stars + (bonuses.loudVoice ? 1 : 0) + (bonuses.goodEmotion ? 1 : 0) + (bonuses.creative ? 1 : 0)} 分
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={onSkip} style={{
                flex: 1, padding: '12px', borderRadius: '10px',
                backgroundColor: '#f5f5f5', color: '#666', fontSize: '15px',
              }}>跳过</button>
              <button onClick={() => { if (stars === 0) { alert('请先评星！'); return } onComplete(stars, bonuses) }} style={{
                flex: 2, padding: '12px', borderRadius: '10px',
                backgroundColor: '#4CAF50', color: '#fff', fontSize: '15px', fontWeight: 'bold',
              }}>✅ 确认评分</button>
            </div>
          </div>
        )}

        {phase === 'performing' && (
          <button onClick={() => setPhase('scoring')} style={{
            width: '100%', padding: '10px', borderRadius: '10px',
            backgroundColor: '#f5f5f5', color: '#666', fontSize: '14px', marginTop: '8px',
          }}>学生已完成，开始评分 →</button>
        )}
      </div>
    </div>
  )
}

// ==================== PK弹窗 ====================
function BattleModal({ attacker, opponents, onSelect, onCancel }: {
  attacker: any; opponents: any[]; onSelect: (result: { opponent: any; winner: string }) => void; onCancel: () => void
}) {
  const [step, setStep] = useState<'select' | 'battle' | 'result'>('select')
  const [selectedOpponent, setSelectedOpponent] = useState<any>(null)
  const [winner, setWinner] = useState<string | null>(null)
  const question = getRandomQuestion('tongue_twister', 2)

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 2000,
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: '20px', padding: '24px',
        width: '90%', maxWidth: '550px', maxHeight: '85vh', overflow: 'auto',
      }}>
        <div style={{
          display: 'inline-block', padding: '6px 14px', borderRadius: '20px',
          backgroundColor: '#FFEBEE', color: '#F44336', fontWeight: 'bold', fontSize: '14px', marginBottom: '16px',
        }}>⚔️ 强制PK对战</div>

        {step === 'select' && (
          <>
            <p style={{ marginBottom: '16px', color: '#666' }}>{attacker.icon} {attacker.name} 触发了PK格！请选择对手：</p>
            {opponents.map((opp: any) => (
              <button key={opp.id} onClick={() => { setSelectedOpponent(opp); setStep('battle') }} style={{
                width: '100%', padding: '14px', borderRadius: '12px', fontSize: '16px',
                backgroundColor: '#f5f5f5', border: '2px solid #E0E0E0',
                display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '8px',
              }}>
                <span style={{ fontSize: '24px' }}>{opp.icon}</span>
                <span style={{ fontWeight: 'bold' }}>{opp.name}</span>
                <span style={{ marginLeft: 'auto', color: '#666' }}>{opp.score}分</span>
              </button>
            ))}
            <button onClick={onCancel} style={{
              width: '100%', padding: '12px', borderRadius: '10px', marginTop: '8px',
              backgroundColor: '#f5f5f5', color: '#666', fontSize: '15px',
            }}>取消PK</button>
          </>
        )}

        {step === 'battle' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '16px' }}>
              <div style={{ textAlign: 'center' }}><span style={{ fontSize: '36px' }}>{attacker.icon}</span><div style={{ fontWeight: 'bold' }}>{attacker.name}</div></div>
              <span style={{ fontSize: '28px', color: '#F44336' }}>VS</span>
              <div style={{ textAlign: 'center' }}><span style={{ fontSize: '36px' }}>{selectedOpponent?.icon}</span><div style={{ fontWeight: 'bold' }}>{selectedOpponent?.name}</div></div>
            </div>
            {question && (
              <div style={{ backgroundColor: '#f9f9f9', padding: '16px', borderRadius: '12px', marginBottom: '16px', textAlign: 'center' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>PK题目：{question.title}</div>
                <div style={{ fontSize: '15px', lineHeight: '1.6' }}>{question.content}</div>
              </div>
            )}
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '16px' }}>请两位同学分别完成，然后由老师判定胜负</p>
            <div style={{ fontWeight: 'bold', marginBottom: '12px', textAlign: 'center' }}>获胜方：</div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => { setWinner(attacker.id); setStep('result') }} style={{ flex: 1, padding: '14px', borderRadius: '12px', fontSize: '16px', backgroundColor: '#E8F5E9', border: '2px solid #4CAF50', fontWeight: 'bold', cursor: 'pointer' }}>{attacker.icon} {attacker.name} 胜</button>
              <button onClick={() => { setWinner(selectedOpponent?.id); setStep('result') }} style={{ flex: 1, padding: '14px', borderRadius: '12px', fontSize: '16px', backgroundColor: '#E8F5E9', border: '2px solid #4CAF50', fontWeight: 'bold', cursor: 'pointer' }}>{selectedOpponent?.icon} {selectedOpponent?.name} 胜</button>
            </div>
            <button onClick={() => { setWinner('draw'); setStep('result') }} style={{ width: '100%', padding: '12px', borderRadius: '10px', marginTop: '10px', backgroundColor: '#FFF3E0', border: '2px solid #FF9800', fontWeight: 'bold', cursor: 'pointer' }}>🤝 平局</button>
          </>
        )}

        {step === 'result' && (
          <>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>{winner === attacker.id ? '🎉' : winner === 'draw' ? '🤝' : '😢'}</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                {winner === attacker.id ? `${attacker.name} 获胜！获得2分` : winner === 'draw' ? '平局！双方各得1分' : `${selectedOpponent?.name} 获胜！获得2分`}
              </div>
            </div>
            <button onClick={() => onSelect({ opponent: selectedOpponent, winner: winner! })} style={{ width: '100%', padding: '14px', borderRadius: '10px', backgroundColor: '#4CAF50', color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>✅ 确认结果</button>
          </>
        )}
      </div>
    </div>
  )
}

// ==================== 主游戏页面 ====================
export default function GamePage() {
  const { classId } = useParams<{ classId: string }>()
  const navigate = useNavigate()
  const [classData, setClassData] = useState<any>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [selectedActorId, setSelectedActorId] = useState<string | null>(null)
  const [diceResult, setDiceResult] = useState<number | null>(null)
  const [isRolling, setIsRolling] = useState(false)
  const [actionHistory, setActionHistory] = useState<any[]>([])
  const [gameMode, setGameMode] = useState<'individual' | 'team'>('individual')
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(1)
  const [currentQuestion, setCurrentQuestion] = useState<any>(null)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [currentActorForTask, setCurrentActorForTask] = useState<any>(null)
  const [usedQuestionIds, setUsedQuestionIds] = useState<string[]>([])
  const [showBattleModal, setShowBattleModal] = useState(false)
  const [battleAttacker, setBattleAttacker] = useState<any>(null)
  const [pendingDoubleCard, setPendingDoubleCard] = useState(false)
  const [pendingSkipCard, setPendingSkipCard] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignCardData, setAssignCardData] = useState<any>(null)
  const [assignForActor, setAssignForActor] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem('speech_classes')
    const configData = localStorage.getItem('speech_current_game_config')
    if (stored && configData) {
      const classes = JSON.parse(stored)
      const found = classes.find((c: any) => c.id === classId)
      const config = JSON.parse(configData)
      setClassData(found)
      setGameMode(config.gameMode)
      setDifficulty(config.difficulty || 1)

      const checkedInStudents = found.students.filter((s: any) => config.participants.includes(s.id))

      if (config.gameMode === 'individual') {
        setParticipants(checkedInStudents.map((s: any) => ({
          ...s, position: 0, score: 0, cards: [...(s.inventory || [])], actionCount: 0,
        })))
      } else {
        setTeams(config.teams.map((t: any) => ({
          ...t, position: 0, score: 0, cards: [], actionCount: 0,
          members: t.memberIds.map((mid: string) => checkedInStudents.find((s: any) => s.id === mid)).filter(Boolean),
        })))
      }
    }
  }, [classId])

  const actors: any[] = gameMode === 'individual' ? participants : teams

  const updateActor = useCallback((actorId: string, updates: any) => {
    if (gameMode === 'individual') {
      setParticipants(prev => prev.map(p => p.id === actorId ? { ...p, ...updates } : p))
    } else {
      setTeams(prev => prev.map(t => t.id === actorId ? { ...t, ...updates } : t))
    }
  }, [gameMode])

  const addScore = useCallback((actorId: string, points: number) => {
    if (gameMode === 'individual') {
      setParticipants(prev => prev.map(p => p.id === actorId ? { ...p, score: p.score + points } : p))
    } else {
      setTeams(prev => prev.map(t => t.id === actorId ? { ...t, score: t.score + points } : t))
    }
  }, [gameMode])

  const removeCardById = useCallback((actorId: string, cardId: string) => {
    if (gameMode === 'individual') {
      setParticipants(prev => prev.map(p =>
        p.id === actorId ? { ...p, cards: p.cards.filter((c: any) => c.id !== cardId) } : p
      ))
    } else {
      setTeams(prev => prev.map(t =>
        t.id === actorId ? { ...t, cards: t.cards.filter((c: any) => c.id !== cardId) } : t
      ))
    }
  }, [gameMode])

  const addCard = useCallback((actorId: string) => {
    const randomCard = CARD_POOL[Math.floor(Math.random() * CARD_POOL.length)]
    const newCard = { ...randomCard, id: randomCard.id + '_' + Date.now(), quantity: 1 }
    if (gameMode === 'individual') {
      setParticipants(prev => prev.map(p => p.id === actorId ? { ...p, cards: [...p.cards, newCard] } : p))
    } else {
      setTeams(prev => prev.map(t => t.id === actorId ? { ...t, cards: [...t.cards, newCard] } : t))
    }
    return newCard
  }, [gameMode])

  const getActorById = useCallback((actorId: string) => actors.find(a => a.id === actorId), [actors])

  const addHistory = useCallback((text: string) => {
    setActionHistory(prev => [{ text, time: Date.now() }, ...prev].slice(0, 30))
  }, [])

  const handleCellEvent = useCallback((actorId: string, newPosition: number) => {
    const cell = BOARD_CELLS[newPosition]
    const actor = getActorById(actorId)
    if (!actor) return
    const actorName = actor.icon + ' ' + (actor.name || '')

    if (pendingSkipCard) {
      setPendingSkipCard(false)
      addHistory(`${actorName} 使用免答卡 🛡️ 跳过任务`)
      return
    }

    switch (cell.type) {
      case 'tongue_twister':
      case 'recitation':
      case 'impromptu':
      case 'imitation': {
        const qType = CELL_TYPE_TO_QUESTION[cell.type]
        if (qType) {
          const question = getRandomQuestion(qType, difficulty, usedQuestionIds)
          if (question) {
            setUsedQuestionIds(prev => [...prev, question.id])
            setCurrentQuestion(question)
            setCurrentActorForTask(actor)
            setShowTaskModal(true)
          }
        }
        break
      }
      case 'battle': {
        const opponents = actors.filter(a => a.id !== actorId)
        if (opponents.length > 0) {
          setBattleAttacker(actor)
          setShowBattleModal(true)
        } else { alert('没有可以PK的对手！') }
        break
      }
      case 'bonus':
        addScore(actorId, 3)
        addHistory(`${actorName} 触发奖励格 ⭐ +3分`)
        break
      case 'card': {
        const newCard = addCard(actorId)
        addHistory(`${actorName} 获得道具卡 ${newCard.icon}${newCard.name}`)
        alert(`${actorName} 获得道具卡：${newCard.icon} ${newCard.name}！\n${newCard.description}`)
        break
      }
      case 'trap':
        updateActor(actorId, { position: Math.max(0, newPosition - 2) })
        addHistory(`${actorName} 触发陷阱 💣 后退2格`)
        alert(`${actorName} 踩到陷阱！后退2格！`)
        break
      case 'fortune': {
        const rewards = ['积分翻倍！', '获得2分', '获得3分', '获得一张道具卡', '前进1格']
        const reward = rewards[Math.floor(Math.random() * rewards.length)]
        if (reward.includes('积分翻倍')) addScore(actorId, actor.score)
        else if (reward.includes('2分')) addScore(actorId, 2)
        else if (reward.includes('3分')) addScore(actorId, 3)
        else if (reward.includes('道具卡')) addCard(actorId)
        else updateActor(actorId, { position: Math.min(29, newPosition + 1) })
        addHistory(`${actorName} 幸运转盘 🎰 ${reward}`)
        alert(`${actorName} 幸运转盘结果：${reward}`)
        break
      }
      case 'end':
        addHistory(`🏆 ${actorName} 到达终点！`)
        alert(`🏆 恭喜 ${actorName} 到达终点！`)
        break
    }
  }, [actors, usedQuestionIds, difficulty, addScore, addCard, updateActor, getActorById, pendingSkipCard, addHistory])

  const rollDice = () => {
    if (!selectedActorId || isRolling || showTaskModal || showBattleModal || showAssignModal) return
    setIsRolling(true)
    const roll = Math.floor(Math.random() * 6) + 1
    let count = 0
    const interval = setInterval(() => {
      setDiceResult(Math.floor(Math.random() * 6) + 1)
      count++
      if (count > 10) {
        clearInterval(interval)
        setDiceResult(roll)
        setIsRolling(false)
        const actor = getActorById(selectedActorId)
        const newPos = Math.min((actor?.position || 0) + roll, 29)
        updateActor(selectedActorId, { position: newPos, actionCount: (actor?.actionCount || 0) + 1 })
        handleCellEvent(selectedActorId, newPos)
        setSelectedActorId(null)
      }
    }, 100)
  }

  const handleTaskComplete = (stars: number, bonuses: any) => {
    const bonusPoints = (bonuses.loudVoice ? 1 : 0) + (bonuses.goodEmotion ? 1 : 0) + (bonuses.creative ? 1 : 0)
    let totalScore = stars + bonusPoints
    if (pendingDoubleCard) {
      totalScore *= 2
      setPendingDoubleCard(false)
    }
    const actor = currentActorForTask
    if (actor) {
      addScore(actor.id, totalScore)
      addHistory(`${actor.icon} ${actor.name} 完成${currentQuestion?.title} ⭐${stars} ${pendingDoubleCard ? '双倍！' : ''}= ${totalScore}分`)
    }
    setShowTaskModal(false)
    setCurrentQuestion(null)
    setCurrentActorForTask(null)
  }

  const handleTaskSkip = () => {
    const actor = currentActorForTask
    if (actor) addHistory(`${actor.icon} ${actor.name} 跳过了任务`)
    setShowTaskModal(false)
    setCurrentQuestion(null)
    setCurrentActorForTask(null)
  }

  // ==================== 道具使用核心逻辑 ====================
  const handleUseCardInTask = (card: any): string => {
    const actor = currentActorForTask
    if (!actor) return '无法使用道具'

    const cardType = getCardType(card)
    console.log('使用道具:', card.name, '类型:', cardType, '卡片数据:', card)

    switch (cardType) {
      case 'skip': {
        removeCardById(actor.id, card.id)
        setPendingSkipCard(true)
        setShowTaskModal(false)
        setCurrentQuestion(null)
        setCurrentActorForTask(null)
        addHistory(`${actor.icon} ${actor.name} 使用免答卡 🛡️ 跳过任务`)
        return '✅ 免答卡已使用！任务已跳过。'
      }
      case 'double': {
        setPendingDoubleCard(true)
        removeCardById(actor.id, card.id)
        return '✅ 双倍积分卡已激活！本次任务得分将翻倍。'
      }
      case 'lucky': {
        const points = Math.floor(Math.random() * 4) + 2
        addScore(actor.id, points)
        removeCardById(actor.id, card.id)
        addHistory(`${actor.icon} ${actor.name} 使用幸运卡 🍀 +${points}分`)
        return `🍀 幸运卡：获得 ${points} 分！`
      }
      case 'steal': {
        const others = actors.filter(a => a.id !== actor.id)
        if (others.length === 0) return '没有可偷分的对象'
        const target = others[0]
        addScore(actor.id, 2)
        addScore(target.id, -2)
        removeCardById(actor.id, card.id)
        addHistory(`${actor.icon} ${actor.name} 使用偷分卡 🕵️ 从 ${target.name} 偷取2分`)
        return `🕵️ 成功从 ${target.name} 偷取2分！`
      }
      case 'swap': {
        const others = actors.filter(a => a.id !== actor.id)
        if (others.length === 0) return '没有可交换的对象'
        const target = others[0]
        const actorPos = actor.position
        updateActor(actor.id, { position: target.position })
        updateActor(target.id, { position: actorPos })
        removeCardById(actor.id, card.id)
        addHistory(`${actor.icon} ${actor.name} 使用交换卡 🔄 与 ${target.name} 交换位置`)
        return `🔄 已与 ${target.name} 交换位置！`
      }
      case 'assign': {
        // 保存卡片数据，显示选人弹窗
        setAssignCardData(card)
        setAssignForActor(actor)
        setShowAssignModal(true)
        return '👉 请在下方的弹窗中选择代替者'
      }
      default:
        return `未知道具类型: ${cardType}`
    }
  }

  const handleAssignSelect = (target: any) => {
    if (!assignCardData || !assignForActor) return
    const actor = assignForActor

    // 移除指定卡
    removeCardById(actor.id, assignCardData.id)
    addHistory(`${actor.icon} ${actor.name} 使用指定卡 👉 让 ${target.icon} ${target.name} 代替完成任务`)

    // 关闭当前任务弹窗
    setShowTaskModal(false)
    setCurrentQuestion(null)
    setCurrentActorForTask(null)

    // 把当前任务切换到目标身上
    if (currentQuestion) {
      setCurrentQuestion(currentQuestion)
      setCurrentActorForTask(target)
      // 延迟一下再打开，确保状态更新
      setTimeout(() => {
        setShowTaskModal(true)
      }, 100)
    }

    setShowAssignModal(false)
    setAssignCardData(null)
    setAssignForActor(null)
  }

  const handleBattleResult = ({ opponent, winner }: { opponent: any; winner: string }) => {
    if (!battleAttacker) return
    const aName = battleAttacker.icon + ' ' + (battleAttacker.name || '')
    const oName = opponent.icon + ' ' + (opponent.name || '')

    if (winner === 'draw') {
      addScore(battleAttacker.id, 1)
      addScore(opponent.id, 1)
      addHistory(`⚔️ ${aName} VS ${oName} 平局！各+1分`)
    } else if (winner === battleAttacker.id) {
      addScore(battleAttacker.id, 2)
      addScore(opponent.id, -2)
      addHistory(`⚔️ ${aName} 战胜 ${oName}！+2分`)
    } else {
      addScore(opponent.id, 2)
      addScore(battleAttacker.id, -2)
      addHistory(`⚔️ ${oName} 战胜 ${aName}！+2分`)
    }
    setShowBattleModal(false)
    setBattleAttacker(null)
  }

  const handleEndClass = () => {
    if (!confirm('确定要下课吗？所有积分和道具将保存到班级档案中。')) return
    const stored = localStorage.getItem('speech_classes')
    if (stored && classData) {
      const classes = JSON.parse(stored)
      const classIndex = classes.findIndex((c: any) => c.id === classId)
      if (classIndex !== -1) {
        if (gameMode === 'individual') {
          participants.forEach(p => {
            const si = classes[classIndex].students.findIndex((s: any) => s.id === p.id)
            if (si !== -1) {
              classes[classIndex].students[si].stats.totalScore += p.score
              classes[classIndex].students[si].stats.sessionsAttended += 1
              classes[classIndex].students[si].inventory = p.cards
            }
          })
        }
        classes[classIndex].totalSessions += 1
        localStorage.setItem('speech_classes', JSON.stringify(classes))
      }
    }
    localStorage.removeItem('speech_current_game_config')
    localStorage.removeItem('speech_current_checkin')
    navigate('/')
  }

  const renderBoard = () => {
    const size = Math.min(window.innerWidth - 40, 700)
    return (
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(10, 1fr)`, gap: '3px', width: size, height: size, margin: '0 auto' }}>
        {BOARD_CELLS.map(cell => {
          const onCell = actors.filter(a => a.position === cell.index)
          return (
            <div key={cell.index} style={{
              backgroundColor: cell.color + '22', border: `2px solid ${cell.color}`,
              borderRadius: '8px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', fontSize: '10px',
              padding: '2px', position: 'relative',
            }}>
              <span style={{ fontSize: '16px' }}>{cell.icon}</span>
              <span style={{ fontSize: '8px', color: '#666' }}>{cell.title}</span>
              {onCell.length > 0 && (
                <div style={{ position: 'absolute', bottom: '2px', display: 'flex', gap: '1px' }}>
                  {onCell.map(a => <span key={a.id} style={{ fontSize: '12px' }} title={a.name}>{a.icon || '👤'}</span>)}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '10px' }}>
      {/* 顶部 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', padding: '0 8px' }}>
        <button onClick={() => navigate('/')} style={{ fontSize: '20px', background: 'none', padding: '8px' }}>←</button>
        <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
          {classData?.name || '课堂中'}
          <span style={{ marginLeft: '8px', fontSize: '12px', padding: '2px 8px', borderRadius: '10px',
            backgroundColor: difficulty === 1 ? '#E8F5E9' : difficulty === 2 ? '#FFF3E0' : '#FFEBEE',
            color: difficulty === 1 ? '#4CAF50' : difficulty === 2 ? '#FF9800' : '#F44336' }}>
            {difficulty === 1 ? '初级' : difficulty === 2 ? '中级' : '高级'}
          </span>
        </span>
        <button onClick={handleEndClass} style={{ padding: '10px 18px', borderRadius: '10px', backgroundColor: '#F44336', color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>📋 下课</button>
      </div>

      {/* 棋盘 */}
      <div style={{ marginBottom: '12px', overflow: 'auto' }}>{renderBoard()}</div>

      {/* 骰子 */}
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '16px', marginBottom: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '12px', backgroundColor: '#FFF8E1', border: '3px solid #FF9800', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontSize: '30px', fontWeight: 'bold' }}>
          {diceResult || '🎲'}
        </div>
        <button onClick={rollDice} disabled={!selectedActorId || isRolling || showTaskModal || showBattleModal || showAssignModal} style={{
          padding: '12px 30px', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold',
          backgroundColor: selectedActorId && !isRolling && !showTaskModal && !showBattleModal && !showAssignModal ? '#FF9800' : '#ccc', color: '#fff',
        }}>{isRolling ? '滚动中...' : '🎲 掷骰子'}</button>
        {(pendingDoubleCard || pendingSkipCard) && (
          <div style={{ marginTop: '8px', fontWeight: 'bold', fontSize: '14px' }}>
            {pendingDoubleCard && <span style={{ color: '#FF9800' }}>✨ 双倍积分卡已激活 </span>}
            {pendingSkipCard && <span style={{ color: '#2196F3' }}>🛡️ 免答卡已激活</span>}
          </div>
        )}
      </div>

      {/* 选择行动者 */}
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '16px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '15px' }}>👥 选择行动者：</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {actors.map((actor: any) => (
            <button key={actor.id} onClick={() => setSelectedActorId(actor.id)} style={{
              padding: '12px 16px', borderRadius: '12px', fontSize: '15px',
              backgroundColor: selectedActorId === actor.id ? '#5B8DEF' : '#f5f5f5',
              color: selectedActorId === actor.id ? '#fff' : '#333', fontWeight: 'bold',
              border: selectedActorId === actor.id ? 'none' : '2px solid #E0E0E0',
              display: 'flex', alignItems: 'center', gap: '8px',
              opacity: (showTaskModal || showBattleModal || showAssignModal) ? 0.5 : 1,
            }} disabled={showTaskModal || showBattleModal || showAssignModal}>
              <span>{actor.icon || '👤'}</span>
              <span>{actor.name}</span>
              <span style={{
                backgroundColor: selectedActorId === actor.id ? 'rgba(255,255,255,0.3)' : '#E8EFF9',
                borderRadius: '20px', padding: '2px 10px', fontSize: '13px',
                color: selectedActorId === actor.id ? '#fff' : '#5B8DEF',
              }}>{actor.score}分</span>
            </button>
          ))}
        </div>
      </div>

      {/* 行动记录 */}
      {actionHistory.length > 0 && (
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>📋 行动记录</div>
          <div style={{ maxHeight: '120px', overflow: 'auto' }}>
            {actionHistory.map((r: any, i: number) => (
              <div key={i} style={{ fontSize: '13px', padding: '4px 0', color: '#666', borderBottom: '1px solid #f5f5f5' }}>{r.text}</div>
            ))}
          </div>
        </div>
      )}

      {/* 任务弹窗 */}
      {showTaskModal && currentQuestion && currentActorForTask && (
        <TaskModal question={currentQuestion} actor={currentActorForTask} onComplete={handleTaskComplete} onSkip={handleTaskSkip} onUseCard={handleUseCardInTask} />
      )}

      {/* PK弹窗 */}
      {showBattleModal && battleAttacker && (
        <BattleModal attacker={battleAttacker} opponents={actors.filter(a => a.id !== battleAttacker.id)} onSelect={handleBattleResult} onCancel={() => { setShowBattleModal(false); setBattleAttacker(null) }} />
      )}

      {/* 指定卡弹窗 */}
      {showAssignModal && assignForActor && (
        <AssignCardModal
          actor={assignForActor}
          candidates={actors.filter(a => a.id !== assignForActor.id)}
          onSelect={handleAssignSelect}
          onCancel={() => { setShowAssignModal(false); setAssignCardData(null); setAssignForActor(null) }}
        />
      )}
    </div>
  )
}