import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getRandomQuestion, CELL_TYPE_TO_QUESTION, CARD_POOL } from '../data/questions'
import { BOARD_CELLS_INDIVIDUAL, BOARD_CELLS_TEAM } from '../data/board'
import Board3D from '../components/Board3D'
import Avatar from '../components/Avatar'
import { Modal, styles } from '../components/UI'
import CellEventModal, { FORTUNE_REWARDS } from '../components/CellEventModals'
import type { CellEvent } from '../components/CellEventModals'
import {
  loadClasses,
  loadStudents,
  loadGameConfig,
  saveClasses,
  saveStudents,
  clearGameSession,
} from '../utils/storage'
import { levelFromScore, rankFromLevel } from '../types'

function getCardType(card: any): string {
  if (card.cardType) return card.cardType
  if (card.id) {
    for (const key of ['double_dice', 'remote', 'sprint', 'skip', 'double', 'assign', 'steal', 'shield', 'swap', 'lucky']) {
      if (card.id.includes(key)) return key
    }
  }
  return 'unknown'
}

function TaskModal({ question, actor, onComplete, onSkip, onUseCard }: { question: any; actor: any; onComplete: (stars: number, bonuses: any) => void; onSkip: () => void; onUseCard: (card: any) => string }) {
  const [timer, setTimer] = useState(question.timeLimit)
  const [stars, setStars] = useState(0)
  const [bonuses, setBonuses] = useState({ loudVoice: false, goodEmotion: false, creative: false })
  const [phase, setPhase] = useState<'performing' | 'scoring'>('performing')
  const [showCards, setShowCards] = useState(false)
  const [cardMessage, setCardMessage] = useState('')

  useEffect(() => {
    if (phase === 'performing' && timer > 0) { const i = setInterval(() => setTimer((t: number) => t - 1), 1000); return () => clearInterval(i) }
    if (timer === 0) setPhase('scoring')
  }, [timer, phase])

  const typeLabel = 
    question.type === 'team_cooperate' ? '🤲 团队合作' : 
    question.type === 'team_battle' ? '🥊 团队对抗' :
    question.type === 'tongue_twister' ? '🔤 绕口令' : 
    question.type === 'recitation' ? '📖 朗诵' : 
    question.type === 'impromptu' ? '💡 即兴演讲' : 
    question.type === 'imitation' ? '🎭 模仿秀' : 
    question.type === 'teamwork' ? '🤝 团队协作' : '📋 任务'

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '24px', width: '90%', maxWidth: '550px', maxHeight: '85vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'inline-block', padding: '6px 14px', borderRadius: '20px', backgroundColor: '#FFF3E0', color: '#FF9800', fontWeight: 'bold', fontSize: '14px' }}>{typeLabel}</div>
          <div style={{ fontSize: '13px', color: '#999' }}>{actor.icon} {actor.name} | 🎒×{actor.cards?.length || 0}</div>
        </div>
        <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>{question.title}</h3>
        <div style={{ backgroundColor: '#f9f9f9', padding: '16px', borderRadius: '12px', marginBottom: '12px', fontSize: '16px', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{question.content}</div>
        {cardMessage && <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#E8F5E9', color: '#4CAF50', fontWeight: 'bold', marginBottom: '12px', textAlign: 'center' }}>{cardMessage}</div>}
        <button onClick={() => setShowCards(!showCards)} style={{ width: '100%', padding: '10px', borderRadius: '10px', backgroundColor: '#FFF8E1', border: '2px solid #FFD700', fontWeight: 'bold', fontSize: '14px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>🎒 使用道具 ({actor.cards?.length || 0}张)</button>
        {showCards && (
          <div style={{ backgroundColor: '#f9f9f9', borderRadius: '12px', padding: '12px', marginBottom: '12px', maxHeight: '160px', overflow: 'auto' }}>
            {(!actor.cards || actor.cards.length === 0) ? <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>暂无道具</div> :
              actor.cards.map((card: any, i: number) => (
                <div key={card.id || i} style={{ display: 'flex', alignItems: 'center', padding: '10px', backgroundColor: '#fff', borderRadius: '10px', marginBottom: '6px', gap: '10px' }}>
                  <span style={{ fontSize: '24px' }}>{card.icon}</span><div style={{ flex: 1 }}><div style={{ fontWeight: 'bold', fontSize: '14px' }}>{card.name}</div><div style={{ fontSize: '12px', color: '#666' }}>{card.description}</div></div>
                  <button onClick={() => { const msg = onUseCard(card); setCardMessage(msg); setShowCards(false) }} style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '13px', backgroundColor: '#5B8DEF', color: '#fff', fontWeight: 'bold' }}>使用</button>
                </div>
              ))}
          </div>
        )}
        {phase === 'performing' && <div style={{ textAlign: 'center', marginBottom: '12px' }}><span style={{ fontSize: '36px', fontWeight: 'bold', color: timer <= 5 ? '#F44336' : '#FF9800' }}>⏱️ {timer}s</span><div style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>等待完成...</div></div>}
        {phase === 'scoring' && (
          <div style={{ borderTop: '2px solid #f0f0f0', paddingTop: '16px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '15px' }}>⭐ 教师评分</div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>{[1,2,3,4,5].map(s => <button key={s} onClick={() => setStars(s)} style={{ fontSize: '40px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', filter: s<=stars?'none':'grayscale(1)', transform: s<=stars?'scale(1.15)':'scale(1)', transition: 'all 0.2s' }}>⭐</button>)}</div>
            <div style={{ textAlign: 'center', marginBottom: '16px', color: '#FF9800', fontWeight: 'bold' }}>{stars===0?'请点击星星评分':stars===1?'⭐ 需要多加练习':stars===2?'⭐⭐ 有进步空间':stars===3?'⭐⭐⭐ 基本完成':stars===4?'⭐⭐⭐⭐ 表现不错':'⭐⭐⭐⭐⭐ 非常优秀！'}</div>
            <div style={{ marginBottom: '16px' }}><div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>额外加分：</div>
              <label style={{ display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px',cursor:'pointer' }}><input type="checkbox" checked={bonuses.loudVoice} onChange={e => setBonuses({...bonuses,loudVoice:e.target.checked})} style={{ width:'20px',height:'20px' }} />声音洪亮 (+1分)</label>
              <label style={{ display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px',cursor:'pointer' }}><input type="checkbox" checked={bonuses.goodEmotion} onChange={e => setBonuses({...bonuses,goodEmotion:e.target.checked})} style={{ width:'20px',height:'20px' }} />情感饱满 (+1分)</label>
              <label style={{ display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px',cursor:'pointer' }}><input type="checkbox" checked={bonuses.creative} onChange={e => setBonuses({...bonuses,creative:e.target.checked})} style={{ width:'20px',height:'20px' }} />创意发挥 (+1分)</label>
            </div>
            <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#FFF8E1', borderRadius: '10px', marginBottom: '16px', fontWeight: 'bold', fontSize: '16px' }}>预计得分：{stars+(bonuses.loudVoice?1:0)+(bonuses.goodEmotion?1:0)+(bonuses.creative?1:0)} 分</div>
            <div style={{ display: 'flex', gap: '10px' }}><button onClick={onSkip} style={{ flex:1,padding:'12px',borderRadius:'10px',backgroundColor:'#f5f5f5',color:'#666',fontSize:'15px' }}>跳过</button><button onClick={()=>{if(stars===0){alert('请先评星！');return}onComplete(stars,bonuses)}} style={{ flex:2,padding:'12px',borderRadius:'10px',backgroundColor:'#4CAF50',color:'#fff',fontSize:'15px',fontWeight:'bold' }}>✅ 确认评分</button></div>
          </div>
        )}
        {phase === 'performing' && <button onClick={()=>setPhase('scoring')} style={{ width:'100%',padding:'10px',borderRadius:'10px',backgroundColor:'#f5f5f5',color:'#666',fontSize:'14px',marginTop:'8px' }}>学生已完成，开始评分 →</button>}
      </div>
    </div>
  )
}

function BattleModal({ attacker, opponents, onComplete, onCancel }: { attacker: any; opponents: any[]; onComplete: (r: { opponent: any; winner: string }) => void; onCancel: () => void }) {
  const [step, setStep] = useState<'select'|'battle'|'result'>('select')
  const [selectedOpponent, setSelectedOpponent] = useState<any>(null)
  const [winner, setWinner] = useState<string|null>(null)
  const question = getRandomQuestion('tongue_twister', 2)
  return (
    <div style={{ position:'fixed',top:0,left:0,right:0,bottom:0,backgroundColor:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2000 }}>
      <div style={{ backgroundColor:'#fff',borderRadius:'20px',padding:'24px',width:'90%',maxWidth:'550px',maxHeight:'85vh',overflow:'auto' }}>
        <div style={{ display:'inline-block',padding:'6px 14px',borderRadius:'20px',backgroundColor:'#FFEBEE',color:'#F44336',fontWeight:'bold',fontSize:'14px',marginBottom:'16px' }}>⚔️ 强制PK对战</div>
        {step==='select'&&<><p style={{ marginBottom:'16px',color:'#666' }}>{attacker.icon} {attacker.name} 触发了PK格！请选择对手：</p>{opponents.map((opp:any)=><button key={opp.id} onClick={()=>{setSelectedOpponent(opp);setStep('battle')}} style={{ width:'100%',padding:'14px',borderRadius:'12px',fontSize:'16px',backgroundColor:'#f5f5f5',border:'2px solid #E0E0E0',display:'flex',alignItems:'center',gap:'10px',cursor:'pointer',marginBottom:'8px' }}><span style={{ fontSize:'24px' }}>{opp.icon}</span><span style={{ fontWeight:'bold' }}>{opp.name}</span><span style={{ marginLeft:'auto',color:'#666' }}>{opp.score}分</span></button>)}<button onClick={onCancel} style={{ width:'100%',padding:'12px',borderRadius:'10px',marginTop:'8px',backgroundColor:'#f5f5f5',color:'#666',fontSize:'15px' }}>取消PK</button></>}
        {step==='battle'&&<><div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:'20px',marginBottom:'16px' }}><div style={{ textAlign:'center' }}><span style={{ fontSize:'36px' }}>{attacker.icon}</span><div style={{ fontWeight:'bold' }}>{attacker.name}</div></div><span style={{ fontSize:'28px',color:'#F44336' }}>VS</span><div style={{ textAlign:'center' }}><span style={{ fontSize:'36px' }}>{selectedOpponent?.icon}</span><div style={{ fontWeight:'bold' }}>{selectedOpponent?.name}</div></div></div>{question?<div style={{ backgroundColor:'#f9f9f9',padding:'16px',borderRadius:'12px',marginBottom:'16px',textAlign:'center' }}><div style={{ fontWeight:'bold',marginBottom:'8px' }}>PK题目：{question.title}</div><div style={{ fontSize:'15px',lineHeight:'1.6' }}>{question.content}</div></div>:<div style={{ backgroundColor:'#f9f9f9',padding:'16px',borderRadius:'12px',marginBottom:'16px',textAlign:'center',color:'#999' }}>暂无可用的PK题目</div>}<p style={{ textAlign:'center',color:'#666',marginBottom:'16px' }}>请两位同学分别完成，然后由老师判定胜负</p><div style={{ fontWeight:'bold',marginBottom:'12px',textAlign:'center' }}>获胜方：</div><div style={{ display:'flex',gap:'12px',justifyContent:'center' }}><button onClick={()=>{setWinner(attacker.id);setStep('result')}} style={{ flex:1,padding:'14px',borderRadius:'12px',fontSize:'16px',backgroundColor:'#E8F5E9',border:'2px solid #4CAF50',fontWeight:'bold',cursor:'pointer' }}>{attacker.icon} {attacker.name} 胜</button><button onClick={()=>{setWinner(selectedOpponent?.id);setStep('result')}} style={{ flex:1,padding:'14px',borderRadius:'12px',fontSize:'16px',backgroundColor:'#E8F5E9',border:'2px solid #4CAF50',fontWeight:'bold',cursor:'pointer' }}>{selectedOpponent?.icon} {selectedOpponent?.name} 胜</button></div><button onClick={()=>{setWinner('draw');setStep('result')}} style={{ width:'100%',padding:'12px',borderRadius:'10px',marginTop:'10px',backgroundColor:'#FFF3E0',border:'2px solid #FF9800',fontWeight:'bold',cursor:'pointer' }}>🤝 平局</button></>}
        {step==='result'&&<><div style={{ textAlign:'center',padding:'20px' }}><div style={{ fontSize:'48px',marginBottom:'12px' }}>{winner===attacker.id?'🎉':winner==='draw'?'🤝':'😢'}</div><div style={{ fontSize:'20px',fontWeight:'bold' }}>{winner===attacker.id?`${attacker.name} 获胜！获得2分`:winner==='draw'?'平局！双方各得1分':`${selectedOpponent?.name} 获胜！获得2分`}</div></div><button onClick={()=>onComplete({opponent:selectedOpponent,winner:winner!})} style={{ width:'100%',padding:'14px',borderRadius:'10px',backgroundColor:'#4CAF50',color:'#fff',fontSize:'16px',fontWeight:'bold' }}>✅ 确认结果</button></>}
      </div>
    </div>
  )
}

function TeamBattleModal({ attacker, opponents, onComplete, onCancel }: { attacker: any; opponents: any[]; onComplete: (r: { opponent: any; winner: string; stars: number }) => void; onCancel: () => void }) {
  const [step, setStep] = useState<'select'|'battle'|'result'>('select')
  const [selectedOpponent, setSelectedOpponent] = useState<any>(null)
  const [winner, setWinner] = useState<string|null>(null)
  const [stars, setStars] = useState(0)
  const question = getRandomQuestion('team_battle', 3)
  return (
    <div style={{ position:'fixed',top:0,left:0,right:0,bottom:0,backgroundColor:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2000 }}>
      <div style={{ backgroundColor:'#fff',borderRadius:'20px',padding:'24px',width:'90%',maxWidth:'550px',maxHeight:'85vh',overflow:'auto' }}>
        <div style={{ display:'inline-block',padding:'6px 14px',borderRadius:'20px',backgroundColor:'#FFEBEE',color:'#FF5722',fontWeight:'bold',fontSize:'14px',marginBottom:'16px' }}>🥊 团队对抗</div>
        {step==='select'&&<><p style={{ marginBottom:'16px',color:'#666' }}>{attacker.icon} {attacker.name} 触发团队对抗！</p>{opponents.map((opp:any)=><button key={opp.id} onClick={()=>{setSelectedOpponent(opp);setStep('battle')}} style={{ width:'100%',padding:'14px',borderRadius:'12px',fontSize:'16px',backgroundColor:'#f5f5f5',border:'2px solid #E0E0E0',display:'flex',alignItems:'center',gap:'10px',cursor:'pointer',marginBottom:'8px' }}><span style={{ fontSize:'24px' }}>{opp.icon}</span><span style={{ fontWeight:'bold' }}>{opp.name}</span><span style={{ marginLeft:'auto',color:'#666' }}>{opp.score}分</span></button>)}<button onClick={onCancel} style={{ width:'100%',padding:'12px',borderRadius:'10px',marginTop:'8px',backgroundColor:'#f5f5f5',color:'#666',fontSize:'15px' }}>取消</button></>}
        {step==='battle'&&<><div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:'20px',marginBottom:'16px' }}><div style={{ textAlign:'center' }}><span style={{ fontSize:'36px' }}>{attacker.icon}</span><div style={{ fontWeight:'bold' }}>{attacker.name}</div></div><span style={{ fontSize:'28px',color:'#FF5722' }}>VS</span><div style={{ textAlign:'center' }}><span style={{ fontSize:'36px' }}>{selectedOpponent?.icon}</span><div style={{ fontWeight:'bold' }}>{selectedOpponent?.name}</div></div></div>{question?<div style={{ backgroundColor:'#f9f9f9',padding:'16px',borderRadius:'12px',marginBottom:'16px',textAlign:'center' }}><div style={{ fontWeight:'bold',marginBottom:'8px' }}>对抗项目：{question.title}</div><div style={{ fontSize:'15px',lineHeight:'1.6' }}>{question.content}</div></div>:<div style={{ backgroundColor:'#f9f9f9',padding:'16px',borderRadius:'12px',marginBottom:'16px',textAlign:'center',color:'#999' }}>暂无可用的对抗题目</div>}<p style={{ textAlign:'center',color:'#666',marginBottom:'16px' }}>请两队分别完成，然后由老师评分并判定胜负</p><div style={{ fontWeight:'bold',marginBottom:'8px',textAlign:'center' }}>基础评分：</div><div style={{ display:'flex',gap:'8px',justifyContent:'center',marginBottom:'16px' }}>{[1,2,3,4,5].map(s=><button key={s} onClick={()=>setStars(s)} style={{ fontSize:'32px',background:'none',border:'none',cursor:'pointer',filter:s<=stars?'none':'grayscale(1)' }}>⭐</button>)}</div><div style={{ fontWeight:'bold',marginBottom:'12px',textAlign:'center' }}>获胜方：</div><div style={{ display:'flex',gap:'12px',justifyContent:'center' }}><button onClick={()=>{setWinner(attacker.id);setStep('result')}} style={{ flex:1,padding:'14px',borderRadius:'12px',fontSize:'16px',backgroundColor:'#E8F5E9',border:'2px solid #4CAF50',fontWeight:'bold',cursor:'pointer' }}>{attacker.icon} {attacker.name} 胜</button><button onClick={()=>{setWinner(selectedOpponent?.id);setStep('result')}} style={{ flex:1,padding:'14px',borderRadius:'12px',fontSize:'16px',backgroundColor:'#E8F5E9',border:'2px solid #4CAF50',fontWeight:'bold',cursor:'pointer' }}>{selectedOpponent?.icon} {selectedOpponent?.name} 胜</button></div><button onClick={()=>{setWinner('draw');setStep('result')}} style={{ width:'100%',padding:'12px',borderRadius:'10px',marginTop:'10px',backgroundColor:'#FFF3E0',border:'2px solid #FF9800',fontWeight:'bold',cursor:'pointer' }}>🤝 平局</button></>}
        {step==='result'&&<><div style={{ textAlign:'center',padding:'20px' }}><div style={{ fontSize:'48px',marginBottom:'12px' }}>{winner===attacker.id?'🎉':winner==='draw'?'🤝':'😢'}</div><div style={{ fontSize:'20px',fontWeight:'bold' }}>{winner===attacker.id?`${attacker.name} 获胜！+${stars+2}分`:winner==='draw'?`平局！双方各+${stars}分`:`${selectedOpponent?.name} 获胜！+${stars+2}分`}</div></div><button onClick={()=>onComplete({opponent:selectedOpponent,winner:winner!,stars})} style={{ width:'100%',padding:'14px',borderRadius:'10px',backgroundColor:'#4CAF50',color:'#fff',fontSize:'16px',fontWeight:'bold' }}>✅ 确认结果</button></>}
      </div>
    </div>
  )
}

// 遥控卡选点数弹窗
function RemoteControlModal({ actor, onSelect, onCancel }: { actor: any; onSelect: (num: number) => void; onCancel: () => void }) {
  return (
    <div style={{ position:'fixed',top:0,left:0,right:0,bottom:0,backgroundColor:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2100 }}>
      <div style={{ backgroundColor:'#fff',borderRadius:'20px',padding:'24px',width:'90%',maxWidth:'400px',textAlign:'center' }}>
        <div style={{ fontSize:'40px',marginBottom:'12px' }}>🎯</div>
        <h3 style={{ marginBottom:'8px' }}>遥控卡</h3>
        <p style={{ color:'#666',marginBottom:'20px' }}>{actor.icon} {actor.name} 请选择前进步数：</p>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'10px',marginBottom:'16px' }}>
          {[1,2,3,4,5,6].map(n => (
            <button key={n} onClick={() => onSelect(n)} style={{
              padding:'16px',borderRadius:'12px',fontSize:'24px',fontWeight:'bold',
              backgroundColor:'#5B8DEF',color:'#fff',border:'none',cursor:'pointer',
            }}>{n}</button>
          ))}
        </div>
        <button onClick={onCancel} style={{ width:'100%',padding:'12px',borderRadius:'10px',backgroundColor:'#f5f5f5',color:'#666',fontSize:'15px' }}>取消</button>
      </div>
    </div>
  )
}

function PreDiceCardModal({ actor, onUse, onClose }: { actor: any; onUse: (card: any) => string; onClose: () => void }) {
  const [message, setMessage] = useState('')
  return (
    <div style={{ position:'fixed',top:0,left:0,right:0,bottom:0,backgroundColor:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2000 }} onClick={onClose}>
      <div style={{ backgroundColor:'#fff',borderRadius:'20px',padding:'24px',width:'90%',maxWidth:'500px',maxHeight:'80vh',overflow:'auto' }} onClick={e=>e.stopPropagation()}>
        <h3 style={{ marginBottom:'16px' }}>🎒 {actor.icon} {actor.name} 的道具</h3>
        {message&&<div style={{ padding:'10px',borderRadius:'10px',backgroundColor:'#E8F5E9',color:'#4CAF50',fontWeight:'bold',marginBottom:'12px',textAlign:'center' }}>{message}</div>}
        {(!actor.cards||actor.cards.length===0)?<div style={{ textAlign:'center',padding:'30px',color:'#999' }}><div style={{ fontSize:'40px',marginBottom:'8px' }}>🎒</div><p>还没有道具卡</p></div>:
          <div style={{ display:'flex',flexDirection:'column',gap:'8px',maxHeight:'300px',overflow:'auto' }}>{actor.cards.map((card:any,i:number)=><div key={card.id||i} style={{ display:'flex',alignItems:'center',padding:'12px',backgroundColor:'#f9f9f9',borderRadius:'10px',gap:'10px' }}><span style={{ fontSize:'24px' }}>{card.icon}</span><div style={{ flex:1 }}><div style={{ fontWeight:'bold',fontSize:'14px' }}>{card.name}</div><div style={{ fontSize:'12px',color:'#666' }}>{card.description}</div></div><button onClick={()=>{const msg=onUse(card);setMessage(msg)}} style={{ padding:'6px 14px',borderRadius:'8px',fontSize:'13px',backgroundColor:'#5B8DEF',color:'#fff',fontWeight:'bold' }}>使用</button></div>)}</div>}
        <button onClick={onClose} style={{ width:'100%',padding:'12px',borderRadius:'10px',marginTop:'12px',backgroundColor:'#f5f5f5',color:'#666',fontSize:'15px' }}>关闭</button>
      </div>
    </div>
  )
}

function AssignCardModal2({ assignForActor, candidates, onSelect, onCancel }: { assignForActor: any; candidates: any[]; onSelect: (t: any) => void; onCancel: () => void }) {
  return (
    <div style={{ position:'fixed',top:0,left:0,right:0,bottom:0,backgroundColor:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2100 }}>
      <div style={{ backgroundColor:'#fff',borderRadius:'20px',padding:'24px',width:'90%',maxWidth:'500px' }}>
        <h3 style={{ marginBottom:'16px' }}>👉 使用指定卡（平分得分）</h3>
        <p style={{ marginBottom:'16px',color:'#666' }}>{assignForActor.icon} {assignForActor.name} 使用指定卡！选择代替者：</p>
        <div style={{ display:'flex',flexDirection:'column',gap:'8px',marginBottom:'16px' }}>{candidates.map((c:any)=><button key={c.id} onClick={()=>onSelect(c)} style={{ padding:'14px',borderRadius:'12px',fontSize:'16px',backgroundColor:'#f5f5f5',border:'2px solid #E0E0E0',display:'flex',alignItems:'center',gap:'10px',cursor:'pointer' }}><span style={{ fontSize:'24px' }}>{c.icon}</span><span style={{ fontWeight:'bold' }}>{c.name}</span></button>)}</div>
        <button onClick={onCancel} style={{ width:'100%',padding:'12px',borderRadius:'10px',backgroundColor:'#f5f5f5',color:'#666',fontSize:'15px' }}>取消</button>
      </div>
    </div>
  )
}

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
  const [gameMode, setGameMode] = useState<'individual'|'team'>('individual')
  const [difficulty, setDifficulty] = useState<1|2|3>(1)
  const [currentQuestion, setCurrentQuestion] = useState<any>(null)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [currentActorForTask, setCurrentActorForTask] = useState<any>(null)
  const [usedQuestionIds, setUsedQuestionIds] = useState<string[]>([])
  const [showBattleModal, setShowBattleModal] = useState(false)
  const [battleAttacker, setBattleAttacker] = useState<any>(null)
  const [showTeamBattleModal, setShowTeamBattleModal] = useState(false)
  const [teamBattleAttacker, setTeamBattleAttacker] = useState<any>(null)
  const [pendingDoubleCard, setPendingDoubleCard] = useState(false)
  const [pendingSkipCard, setPendingSkipCard] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignCardData, setAssignCardData] = useState<any>(null)
  const [assignForActor, setAssignForActor] = useState<any>(null)
  const [showPreDiceModal, setShowPreDiceModal] = useState(false)
  const [preDiceActor, setPreDiceActor] = useState<any>(null)
  const [pendingSprint, setPendingSprint] = useState(0)
  const [pendingDoubleDice, setPendingDoubleDice] = useState(false)
  const [finishOrder, setFinishOrder] = useState<string[]>([])
  const [specifiedTaskTarget, setSpecifiedTaskTarget] = useState<any>(null)
  const [showRemoteModal, setShowRemoteModal] = useState(false)
  const [remoteActor, setRemoteActor] = useState<any>(null)
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  /** 奖励格 / 幸运转盘 / 道具格 的结果弹窗 */
  const [cellEvent, setCellEvent] = useState<CellEvent | null>(null)

  const boardCells = gameMode === 'team' ? BOARD_CELLS_TEAM : BOARD_CELLS_INDIVIDUAL
  const totalCells = boardCells.length

  useEffect(() => {
    const classes = loadClasses()
    const config = loadGameConfig()
    const found = classes.find((c) => c.id === classId) || null
    setClassData(found)
    if (!config) return

    setGameMode(config.gameMode)
    setDifficulty(config.difficulty || 1)

    // 学生档案统一从学生库读取（旧班级内嵌格式已在 storage 层迁移）
    const allStudents = loadStudents()
    const participantsIds: string[] = config.participants || []
    let checkedInStudents = allStudents.filter((s) => participantsIds.includes(s.id))

    // 兜底：兼容极旧的、学生只存在班级里的数据结构
    if (checkedInStudents.length === 0 && found) {
      const legacy = found.students || []
      checkedInStudents = legacy.filter((s: any) => participantsIds.includes(s.id))
    }

    if (config.gameMode === 'individual') {
      setParticipants(
        checkedInStudents.map((s) => ({
          ...s,
          avatar: s.avatar,
          position: 0,
          score: 0,
          cards: [...(s.inventory || [])],
          actionCount: 0,
        })),
      )
    } else {
      setTeams(
        (config.teams || []).map((t: any) => ({
          ...t,
          position: 0,
          score: 0,
          cards: [],
          actionCount: 0,
          members: (t.memberIds || [])
            .map((mid: string) => checkedInStudents.find((s) => s.id === mid))
            .filter(Boolean),
        })),
      )
    }
  }, [classId])

  const actors: any[] = gameMode === 'individual' ? participants : teams

  const updateActor = useCallback((actorId: string, updates: any) => {
    if (gameMode === 'individual') setParticipants(prev => prev.map(p => p.id === actorId ? { ...p, ...updates } : p))
    else setTeams(prev => prev.map(t => t.id === actorId ? { ...t, ...updates } : t))
  }, [gameMode])

  const addScore = useCallback((actorId: string, points: number) => {
    if (gameMode === 'individual') setParticipants(prev => prev.map(p => p.id === actorId ? { ...p, score: p.score + points } : p))
    else setTeams(prev => prev.map(t => t.id === actorId ? { ...t, score: t.score + points } : t))
  }, [gameMode])

  const removeCardById = useCallback((actorId: string, cardId: string) => {
    if (gameMode === 'individual') setParticipants(prev => prev.map(p => p.id === actorId ? { ...p, cards: p.cards.filter((c: any) => c.id !== cardId) } : p))
    else setTeams(prev => prev.map(t => t.id === actorId ? { ...t, cards: t.cards.filter((c: any) => c.id !== cardId) } : t))
  }, [gameMode])

  const addCard = useCallback((actorId: string) => {
    const randomCard = CARD_POOL[Math.floor(Math.random() * CARD_POOL.length)]
    const newCard = { ...randomCard, id: randomCard.id + '_' + Date.now(), quantity: 1 }
    if (gameMode === 'individual') setParticipants(prev => prev.map(p => p.id === actorId ? { ...p, cards: [...p.cards, newCard] } : p))
    else setTeams(prev => prev.map(t => t.id === actorId ? { ...t, cards: [...t.cards, newCard] } : t))
    return newCard
  }, [gameMode])

  const getActorById = useCallback((actorId: string) => actors.find(a => a.id === actorId), [actors])
  const addHistory = useCallback((item: any) => { setActionHistory(prev => [item, ...prev].slice(0, 50)) }, [])

  // 执行移动
  const doMove = useCallback((actorId: string, steps: number) => {
    const actor = getActorById(actorId)
    if (!actor) return
    const newPos = Math.min((actor.position || 0) + steps, totalCells - 1)
    updateActor(actorId, { position: newPos, actionCount: (actor.actionCount || 0) + 1 })
    handleCellEvent(actorId, newPos)
    setSelectedActorId(null)
  }, [getActorById, totalCells, updateActor])

  const handleCellEvent = useCallback((actorId: string, newPosition: number) => {
    const cell = boardCells[newPosition]
    const actor = getActorById(actorId)
    if (!actor) return
    const actorName = actor.icon + ' ' + (actor.name || '')

    if (pendingSkipCard) {
      setPendingSkipCard(false)
      addScore(actorId, 2)
      addHistory({ text: `${actorName} 使用免答卡 🛡️ 跳过任务 +2分`, time: Date.now(), actorId, taskType: null, finalScore: 2, stars: 0 })
      return
    }

    const taskTypes = ['tongue_twister', 'recitation', 'impromptu', 'imitation', 'teamwork', 'team_cooperate']
    if (taskTypes.includes(cell.type)) {
      const qType = CELL_TYPE_TO_QUESTION[cell.type]
      if (qType) {
        const question = getRandomQuestion(qType, difficulty, usedQuestionIds)
        if (question) {
          setUsedQuestionIds(prev => [...prev, question.id])
          setCurrentQuestion(question)
          setCurrentActorForTask(actor)
          setShowTaskModal(true)
        } else {
          addScore(actorId, 3)
          addHistory({ text: `${actorName} 完成任务 +3分（无可用题目）`, time: Date.now(), actorId, taskType: cell.type, finalScore: 3, stars: 0 })
        }
      }
      return
    }

    if (cell.type === 'team_battle') {
      const opponents = actors.filter(a => a.id !== actorId)
      if (opponents.length > 0) { setTeamBattleAttacker(actor); setShowTeamBattleModal(true) }
      else alert('没有可以对抗的队伍！')
      return
    }

    if (cell.type === 'battle') {
      if (gameMode === 'individual') {
        const opponents = actors.filter(a => a.id !== actorId)
        if (opponents.length > 0) { setBattleAttacker(actor); setShowBattleModal(true) }
        else alert('没有对手！')
      }
      return
    }

    switch (cell.type) {
      case 'bonus': {
        addScore(actorId, 3)
        addHistory({ text: `${actorName} 触发奖励格 ⭐ +3分`, time: Date.now(), actorId, taskType: null, finalScore: 3, stars: 0 })
        // 弹窗告知（积分已结算完成）
        setCellEvent({ kind: 'bonus', actorName, points: 3 })
        break
      }
      case 'card': {
        const newCard = addCard(actorId)
        addHistory({ text: `${actorName} 获得道具卡 ${newCard.icon}${newCard.name}`, time: Date.now(), actorId, taskType: null, finalScore: 0, stars: 0 })
        setCellEvent({ kind: 'card', actorName, card: newCard })
        break
      }
      case 'trap': updateActor(actorId, { position: Math.max(0, newPosition - 2) }); addHistory({ text: `${actorName} 触发陷阱 💣 后退2格`, time: Date.now(), actorId, taskType: null, finalScore: 0, stars: 0 }); break
      case 'fortune': {
        const idx = Math.floor(Math.random() * FORTUNE_REWARDS.length)
        const rw = FORTUNE_REWARDS[idx]
        if (rw.key === 'double') addScore(actorId, actor.score)
        else if (rw.key === 'p2') addScore(actorId, 2)
        else if (rw.key === 'p3') addScore(actorId, 3)
        else if (rw.key === 'card') addCard(actorId)
        else updateActor(actorId, { position: Math.min(totalCells - 1, newPosition + 1) })
        addHistory({ text: `${actorName} 幸运转盘 🎰 ${rw.label}`, time: Date.now(), actorId, taskType: null, finalScore: 0, stars: 0 })
        // 弹窗里播放转盘动画
        setCellEvent({ kind: 'fortune', actorName, rewardIndex: idx, rewardLabel: rw.label })
        break
      }
      case 'end': {
        const order = finishOrder.length; const bonusPoints = order === 0 ? 3 : order === 1 ? 2 : order === 2 ? 1 : 0
        setFinishOrder(prev => [...prev, actorId])
        if (bonusPoints > 0) addScore(actorId, bonusPoints)
        addHistory({ text: `🏆 ${actorName} 到达终点！第${order+1}名 +${bonusPoints}分`, time: Date.now(), actorId, taskType: null, finalScore: bonusPoints, stars: 0 })
        break
      }
    }
  }, [actors, usedQuestionIds, difficulty, addScore, addCard, updateActor, getActorById, pendingSkipCard, addHistory, gameMode, boardCells, totalCells, finishOrder])

  /** 任意弹窗打开时，禁止掷骰子 / 切换行动者 */
  const modalOpen =
    showTaskModal ||
    showBattleModal ||
    showTeamBattleModal ||
    showAssignModal ||
    showPreDiceModal ||
    showRemoteModal ||
    showEndConfirm ||
    Boolean(cellEvent)

  const rollDice = () => {
    if (!selectedActorId || isRolling || modalOpen) return
    setIsRolling(true)
    let roll = Math.floor(Math.random() * 6) + 1
    if (pendingDoubleDice) { const roll2 = Math.floor(Math.random() * 6) + 1; roll = Math.max(roll, roll2); setPendingDoubleDice(false) }
    if (pendingSprint > 0) { roll += pendingSprint; setPendingSprint(0) }
    let count = 0
    const interval = setInterval(() => { setDiceResult(Math.floor(Math.random()*6)+1); count++; if (count > 10) { clearInterval(interval); setDiceResult(roll); setIsRolling(false); doMove(selectedActorId, roll) } }, 100)
  }

  const handleTaskComplete = (stars: number, bonuses: any) => {
    const bonusPoints = (bonuses.loudVoice?1:0)+(bonuses.goodEmotion?1:0)+(bonuses.creative?1:0)
    let totalScore = stars+bonusPoints
    if (pendingDoubleCard) { totalScore*=2; setPendingDoubleCard(false) }
    const actor = currentActorForTask
    if (specifiedTaskTarget && actor) {
      const halfScore = Math.ceil(totalScore / 2)
      addScore(actor.id, halfScore); addScore(specifiedTaskTarget.id, halfScore)
      addHistory({ text: `${actor.icon} ${actor.name} 与 ${specifiedTaskTarget.icon} ${specifiedTaskTarget.name} 平分得分 ⭐${stars} = 各${halfScore}分`, time: Date.now(), actorId: actor.id, taskType: currentQuestion?.type, finalScore: halfScore, stars })
      setSpecifiedTaskTarget(null)
    } else if (actor) {
      addScore(actor.id, totalScore)
      addHistory({ text: `${actor.icon} ${actor.name} 完成${currentQuestion?.title} ⭐${stars} ${pendingDoubleCard?'双倍！':''}= ${totalScore}分`, time: Date.now(), actorId: actor.id, taskType: currentQuestion?.type, finalScore: totalScore, stars })
    }
    setShowTaskModal(false); setCurrentQuestion(null); setCurrentActorForTask(null)
  }

  const handleTaskSkip = () => {
    const actor = currentActorForTask; if (actor) addHistory({ text: `${actor.icon} ${actor.name} 跳过了任务`, time: Date.now(), actorId: actor.id, taskType: null, finalScore: 0, stars: 0 })
    setShowTaskModal(false); setCurrentQuestion(null); setCurrentActorForTask(null); setSpecifiedTaskTarget(null)
  }

  const handleUseCardInTask = (card: any): string => {
    const actor = currentActorForTask; if (!actor) return '无法使用道具'
    const ct = getCardType(card)
    switch (ct) {
      case 'skip': removeCardById(actor.id, card.id); setPendingSkipCard(true); setShowTaskModal(false); setCurrentQuestion(null); setCurrentActorForTask(null); setSpecifiedTaskTarget(null); addHistory({ text: `${actor.icon} ${actor.name} 使用免答卡 🛡️ +2分`, time: Date.now(), actorId: actor.id, taskType: null, finalScore: 2, stars: 0 }); return '✅ 免答卡已使用！+2分'
      case 'double': setPendingDoubleCard(true); removeCardById(actor.id, card.id); return '✅ 双倍积分卡已激活！'
      case 'lucky': { const pts = Math.floor(Math.random()*4)+2; addScore(actor.id, pts); removeCardById(actor.id, card.id); addHistory({ text: `${actor.icon} ${actor.name} 幸运卡 +${pts}分`, time: Date.now(), actorId: actor.id, taskType: null, finalScore: pts, stars: 0 }); return `🍀 +${pts}分！` }
      case 'steal': { const others = actors.filter(a=>a.id!==actor.id); if (others.length===0) return '没有目标'; const t = others[0]; addScore(actor.id,2); addScore(t.id,-2); removeCardById(actor.id,card.id); addHistory({ text: `${actor.icon} ${actor.name} 偷分卡 从${t.name}偷2分`, time: Date.now(), actorId: actor.id, taskType: null, finalScore: 2, stars: 0 }); return `🕵️ 从${t.name}偷取2分！` }
      case 'swap': { const others = actors.filter(a=>a.id!==actor.id); if (others.length===0) return '没有目标'; const t = others[0]; const ap=actor.position; updateActor(actor.id,{position:t.position}); updateActor(t.id,{position:ap}); removeCardById(actor.id,card.id); addHistory({ text: `${actor.icon} ${actor.name} 交换卡 与${t.name}换位`, time: Date.now(), actorId: actor.id, taskType: null, finalScore: 0, stars: 0 }); return `🔄 已换位！` }
      case 'assign': setAssignCardData(card); setAssignForActor(actor); setShowAssignModal(true); return '👉 选择代替者（平分得分）'
      default: return `该道具请在掷骰子前使用`
    }
  }

  const handleUseCardPreDice = (card: any): string => {
    const actor = preDiceActor; if (!actor) return '无法使用'
    const ct = getCardType(card)
    switch (ct) {
      case 'double_dice': setPendingDoubleDice(true); removeCardById(actor.id, card.id); setShowPreDiceModal(false); return '✅ 双骰卡已激活！'
      case 'sprint': setPendingSprint(2); removeCardById(actor.id, card.id); setShowPreDiceModal(false); return '✅ 抢跑卡已激活！'
      case 'remote': removeCardById(actor.id, card.id); setRemoteActor(actor); setShowPreDiceModal(false); setShowRemoteModal(true); return ''
      case 'swap': { const others = actors.filter(a=>a.id!==actor.id); if (others.length===0) return '没有目标'; const t = others[0]; const aPos = actor.position; updateActor(actor.id,{position:t.position}); updateActor(t.id,{position:aPos}); removeCardById(actor.id,card.id); addHistory({ text: `${actor.icon} ${actor.name} 交换卡 与${t.name}换位`, time: Date.now(), actorId: actor.id, taskType: null, finalScore: 0, stars: 0 }); return `🔄 已换位！` }
      case 'steal': { const others = actors.filter(a=>a.id!==actor.id); if (others.length===0) return '没有目标'; const t = others[0]; addScore(actor.id,2); addScore(t.id,-2); removeCardById(actor.id,card.id); addHistory({ text: `${actor.icon} ${actor.name} 偷分卡 从${t.name}偷2分`, time: Date.now(), actorId: actor.id, taskType: null, finalScore: 2, stars: 0 }); return `🕵️ 从${t.name}偷取2分！` }
      case 'lucky': { const pts = Math.floor(Math.random()*4)+2; addScore(actor.id, pts); removeCardById(actor.id, card.id); addHistory({ text: `${actor.icon} ${actor.name} 幸运卡 +${pts}分`, time: Date.now(), actorId: actor.id, taskType: null, finalScore: pts, stars: 0 }); return `🍀 +${pts}分！` }
      case 'skip': setPendingSkipCard(true); removeCardById(actor.id, card.id); return '✅ 免答卡已激活！'
      case 'double': setPendingDoubleCard(true); removeCardById(actor.id, card.id); return '✅ 双倍积分卡已激活！'
      case 'shield': removeCardById(actor.id, card.id); return '✅ 护盾卡已激活！'
      default: return `该道具请在任务中使用`
    }
  }

  const handleRemoteSelect = (num: number) => {
    if (!remoteActor) return
    addHistory({ text: `${remoteActor.icon} ${remoteActor.name} 使用遥控卡 🎯 前进${num}步`, time: Date.now(), actorId: remoteActor.id, taskType: null, finalScore: 0, stars: 0 })
    setShowRemoteModal(false)
    doMove(remoteActor.id, num)
    setRemoteActor(null)
  }

  const handleAssignSelect = (target: any) => {
    if (!assignCardData || !assignForActor) return
    removeCardById(assignForActor.id, assignCardData.id)
    setSpecifiedTaskTarget(target)
    addHistory({ text: `${assignForActor.icon} ${assignForActor.name} 使用指定卡 👉 与 ${target.icon} ${target.name} 平分得分`, time: Date.now(), actorId: assignForActor.id, taskType: null, finalScore: 0, stars: 0 })
    setShowAssignModal(false); setAssignCardData(null); setAssignForActor(null)
  }

  const handleBattleResult = ({ opponent, winner }: { opponent: any; winner: string }) => {
    if (!battleAttacker) return
    if (winner === 'draw') { addScore(battleAttacker.id, 1); addScore(opponent.id, 1); addHistory({ text: `⚔️ PK平局！各+1分`, time: Date.now(), actorId: battleAttacker.id, taskType: 'battle', finalScore: 1, stars: 0 }) }
    else if (winner === battleAttacker.id) { addScore(battleAttacker.id, 2); addScore(opponent.id, -2); addHistory({ text: `⚔️ ${battleAttacker.name} PK胜！+2分`, time: Date.now(), actorId: battleAttacker.id, taskType: 'battle', finalScore: 2, stars: 0 }) }
    else { addScore(opponent.id, 2); addScore(battleAttacker.id, -2); addHistory({ text: `⚔️ ${opponent.name} PK胜！+2分`, time: Date.now(), actorId: opponent.id, taskType: 'battle', finalScore: 2, stars: 0 }) }
    setShowBattleModal(false); setBattleAttacker(null)
  }

  const handleTeamBattleComplete = (result: { opponent: any; winner: string; stars: number }) => {
    if (!teamBattleAttacker) return
    const baseScore = result.stars || 3
    if (result.winner === 'draw') { addScore(teamBattleAttacker.id, baseScore); addScore(result.opponent.id, baseScore); addHistory({ text: `🥊 团队对抗平局！各+${baseScore}分`, time: Date.now(), actorId: teamBattleAttacker.id, taskType: 'team_battle', finalScore: baseScore, stars: result.stars }) }
    else if (result.winner === teamBattleAttacker.id) { addScore(teamBattleAttacker.id, baseScore+2); addHistory({ text: `🥊 ${teamBattleAttacker.name} 对抗胜！+${baseScore+2}分`, time: Date.now(), actorId: teamBattleAttacker.id, taskType: 'team_battle', finalScore: baseScore+2, stars: result.stars }) }
    else { addScore(result.opponent.id, baseScore+2); addHistory({ text: `🥊 ${result.opponent.name} 对抗胜！+${baseScore+2}分`, time: Date.now(), actorId: result.opponent.id, taskType: 'team_battle', finalScore: baseScore+2, stars: result.stars }) }
    setShowTeamBattleModal(false); setTeamBattleAttacker(null)
  }

  /**
   * 下课结算（积分关键逻辑）
   * 本局每个角色获得的 score 会同时写入两处：
   *   1. 学生档案 stats.totalScore —— 累计总积分（学生管理中心显示）
   *   2. 班级 scores[studentId]    —— 本学期积分（班级详情页显示）
   * 两套数据互相独立，互不覆盖。
   */
  const handleEndClass = () => {
    if (!classData) {
      clearGameSession()
      navigate('/')
      return
    }

    const classes = loadClasses()
    const allStudents = loadStudents()
    const classIndex = classes.findIndex((c) => c.id === classId)

    // 本局每人获得的积分：studentId -> { gained, sessions }
    const gains = new Map<string, number>()

    if (gameMode === 'individual') {
      for (const p of participants) {
        gains.set(p.id, (gains.get(p.id) || 0) + (p.score || 0))
      }
    } else {
      for (const team of teams) {
        const members = team.members || []
        if (members.length === 0) continue
        const perMember = Math.ceil((team.score || 0) / members.length)
        for (const m of members) {
          if (!m?.id) continue
          gains.set(m.id, (gains.get(m.id) || 0) + perMember)
        }
      }
    }

    const isTeamMode = gameMode === 'team'

    // 1) 更新学生档案：累计总积分 + 出勤 + 学期历史 + 形象 + 道具
    const updatedStudents = allStudents.map((s) => {
      const gained = gains.get(s.id)
      if (gained === undefined) return s

      const totalScore = (s.stats.totalScore || 0) + gained
      const level = levelFromScore(totalScore)

      const updated = {
        ...s,
        stats: {
          ...s.stats,
          totalScore,
          sessionsAttended: (s.stats.sessionsAttended || 0) + 1,
          currentLevel: level,
          currentRank: rankFromLevel(level),
        },
        semesterHistory: [
          ...(s.semesterHistory || []),
          {
            semester: classData.semester,
            score: gained,
            sessions: 1,
            classId: classData.id,
          },
        ],
      }

      // 个人战：把本局剩余道具写回学生背包
      if (!isTeamMode) {
        const actor = participants.find((p) => p.id === s.id)
        if (actor) updated.inventory = actor.cards || []
      }
      return updated
    })

    // 2) 更新班级：本学期积分 + 出勤 + 课时
    const updatedClasses = classes.map((c) => {
      if (c.id !== classId) return c
      const scores = { ...(c.scores || {}) }
      const attendance = { ...(c.attendance || {}) }
      for (const [studentId, gained] of gains) {
        scores[studentId] = (scores[studentId] || 0) + gained
        attendance[studentId] = (attendance[studentId] || 0) + 1
      }
      return {
        ...c,
        scores,
        attendance,
        totalSessions: (c.totalSessions || 0) + 1,
      }
    })

    saveStudents(updatedStudents)
    saveClasses(updatedClasses)
    if (classIndex === -1) console.warn('[GamePage] 未找到对应班级，仅更新了学生数据')

    clearGameSession()
    navigate('/')
  }

  const renderBoard = () => (
    <Board3D
      cells={boardCells}
      actors={actors}
      selectedActorId={selectedActorId}
      onSelectActor={(id) => {
        if (modalOpen) return
        setSelectedActorId(id)
      }}
    />
  )

  const selectedActor = selectedActorId ? getActorById(selectedActorId) : null

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', padding: '0 4px' }}>
        <button onClick={()=>navigate('/')} style={{ fontSize:'18px',background:'none',padding:'6px' }}>←</button>
        <span style={{ fontWeight:'bold',fontSize:'14px' }}>{classData?.name||'课堂中'} <span style={{ marginLeft:'6px',fontSize:'11px',padding:'1px 6px',borderRadius:'8px',backgroundColor:difficulty===1?'#E8F5E9':difficulty===2?'#FFF3E0':'#FFEBEE',color:difficulty===1?'#4CAF50':difficulty===2?'#FF9800':'#F44336' }}>{difficulty===1?'初级':difficulty===2?'中级':'高级'}</span> <span style={{ fontSize:'11px',color:'#999' }}>({gameMode==='team'?'团队':'个人'}·{totalCells}格)</span></span>
        <button onClick={()=>setShowEndConfirm(true)} style={{ padding:'8px 14px',borderRadius:'8px',backgroundColor:'#F44336',color:'#fff',fontWeight:'bold',fontSize:'13px' }}>📋 下课</button>
      </div>
      <div style={{ marginBottom: '12px' }}>{renderBoard()}</div>
      <div style={{ backgroundColor:'#fff',borderRadius:'14px',padding:'12px',marginBottom:'8px',textAlign:'center',boxShadow:'0 2px 6px rgba(0,0,0,0.05)' }}>
        <div style={{ width:'50px',height:'50px',borderRadius:'10px',backgroundColor:'#FFF8E1',border:'3px solid #FF9800',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 6px',fontSize:'26px',fontWeight:'bold',animation:isRolling?'diceRoll 0.4s linear infinite':undefined }}>{diceResult||'🎲'}</div>
        <button onClick={rollDice} disabled={!selectedActorId||isRolling||modalOpen} style={{ padding:'10px 24px',borderRadius:'10px',fontSize:'16px',fontWeight:'bold',backgroundColor:selectedActorId&&!isRolling&&!modalOpen?'#FF9800':'#ccc',color:'#fff' }}>{isRolling?'滚动中...':'🎲 掷骰子'}</button>
        {!selectedActorId&&!isRolling&&<div style={{ marginTop:'6px',fontSize:'12px',color:'#999' }}>请先在上方棋盘或下方选择行动者</div>}
        {(pendingDoubleCard||pendingSkipCard||pendingDoubleDice||pendingSprint>0)&&<div style={{ marginTop:'6px',fontWeight:'bold',fontSize:'13px' }}>{pendingDoubleCard&&<span style={{ color:'#FF9800' }}>✨双倍 </span>}{pendingSkipCard&&<span style={{ color:'#2196F3' }}>🛡️免答 </span>}{pendingDoubleDice&&<span style={{ color:'#9C6EB5' }}>🎲双骰 </span>}{pendingSprint>0&&<span style={{ color:'#4CAF50' }}>🏃抢跑+2 </span>}</div>}
      </div>
      <div style={{ backgroundColor:'#fff',borderRadius:'14px',padding:'12px',marginBottom:'8px',boxShadow:'0 2px 6px rgba(0,0,0,0.05)' }}>
        <div style={{ fontWeight:'bold',marginBottom:'8px',fontSize:'14px',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
          <span>👥 选择行动者：</span>
          {selectedActor && <button onClick={()=>{setPreDiceActor(selectedActor);setShowPreDiceModal(true)}} style={{ padding:'6px 14px',borderRadius:'8px',backgroundColor:'#FFF8E1',border:'2px solid #FFD700',fontWeight:'bold',fontSize:'13px',display:'flex',alignItems:'center',gap:'4px' }}>🎒 道具({selectedActor.cards?.length||0})</button>}
        </div>
        <div style={{ display:'flex',gap:'6px',flexWrap:'wrap' }}>
          {actors.map((actor:any)=>{
            const locked = modalOpen
            const active = selectedActorId===actor.id
            const isTeam = Array.isArray(actor.members) && actor.members.length>0
            return (
              <button key={actor.id} onClick={()=>setSelectedActorId(actor.id)} disabled={locked}
                style={{ padding:'8px 12px',borderRadius:'12px',fontSize:'14px',backgroundColor:active?'#5B8DEF':'#f5f5f5',color:active?'#fff':'#333',fontWeight:'bold',border:active?'none':'2px solid #E0E0E0',display:'flex',alignItems:'center',gap:'6px',opacity:locked?0.5:1 }}>
                {isTeam
                  ? <span style={{ fontSize:'20px' }}>{actor.icon}</span>
                  : <Avatar avatar={actor.avatar} seed={actor.id} size={26} rounded />}
                <span>{actor.name}</span>
                <span style={{ backgroundColor:active?'rgba(255,255,255,0.3)':'#E8EFF9',borderRadius:'16px',padding:'1px 8px',fontSize:'12px',color:active?'#fff':'#5B8DEF' }}>{actor.score}分</span>
              </button>
            )
          })}
        </div>
      </div>
      {actionHistory.length>0&&<div style={{ backgroundColor:'#fff',borderRadius:'14px',padding:'12px',boxShadow:'0 2px 6px rgba(0,0,0,0.05)' }}><div style={{ fontWeight:'bold',marginBottom:'6px',fontSize:'13px' }}>📋 行动记录</div><div style={{ maxHeight:'100px',overflow:'auto' }}>{actionHistory.map((r:any,i:number)=><div key={i} style={{ fontSize:'12px',padding:'3px 0',color:'#666',borderBottom:'1px solid #f5f5f5' }}>{r.text}</div>)}</div></div>}
      {showTaskModal&&currentQuestion&&currentActorForTask&&<TaskModal question={currentQuestion} actor={currentActorForTask} onComplete={handleTaskComplete} onSkip={handleTaskSkip} onUseCard={handleUseCardInTask} />}
      {showBattleModal&&battleAttacker&&<BattleModal attacker={battleAttacker} opponents={actors.filter(a=>a.id!==battleAttacker.id)} onComplete={handleBattleResult} onCancel={()=>{setShowBattleModal(false);setBattleAttacker(null)}} />}
      {showTeamBattleModal&&teamBattleAttacker&&<TeamBattleModal attacker={teamBattleAttacker} opponents={actors.filter(a=>a.id!==teamBattleAttacker.id)} onComplete={handleTeamBattleComplete} onCancel={()=>{setShowTeamBattleModal(false);setTeamBattleAttacker(null)}} />}
      {showAssignModal&&assignForActor&&<AssignCardModal2 assignForActor={assignForActor} candidates={actors.filter(a=>a.id!==assignForActor.id)} onSelect={handleAssignSelect} onCancel={()=>{setShowAssignModal(false);setAssignCardData(null);setAssignForActor(null)}} />}
      {showPreDiceModal&&preDiceActor&&<PreDiceCardModal actor={preDiceActor} onUse={handleUseCardPreDice} onClose={()=>{setShowPreDiceModal(false);setPreDiceActor(null)}} />}
      {showRemoteModal&&remoteActor&&<RemoteControlModal actor={remoteActor} onSelect={handleRemoteSelect} onCancel={()=>{setShowRemoteModal(false);setRemoteActor(null)}} />}

      {/* 奖励格 / 幸运转盘 / 道具格 结果弹窗 */}
      {cellEvent&&<CellEventModal event={cellEvent} onClose={()=>setCellEvent(null)} />}

      {/* 下课结算确认 */}
      {showEndConfirm&&(
        <Modal
          title="📋 下课结算"
          onClose={()=>setShowEndConfirm(false)}
          maxWidth={460}
        >
          <p style={{ fontSize:'15px',lineHeight:1.8,color:'#555' }}>
            确定要下课并结算本局积分吗？
          </p>
          <div style={{ backgroundColor:'#F7F9FE',borderRadius:'12px',padding:'12px',margin:'12px 0',fontSize:'13px',color:'#555',lineHeight:1.8 }}>
            本局得分将同时记录到：
            <br />· 学生档案的<strong>累计总积分</strong>（学生管理中心）
            <br />· 本班的<strong>本学期积分</strong>（班级详情页）
          </div>
          {actors.length>0&&(
            <div style={{ maxHeight:'180px',overflow:'auto',marginBottom:'4px' }}>
              {[...actors].sort((a:any,b:any)=>(b.score||0)-(a.score||0)).map((a:any)=>(
                <div key={a.id} style={{ display:'flex',alignItems:'center',gap:'8px',padding:'6px 0',fontSize:'13px',borderBottom:'1px solid #f2f2f2' }}>
                  <span style={{ flex:1 }}>{a.icon||''} {a.name}</span>
                  <span style={{ fontWeight:'bold',color:'#4CAF50' }}>+{a.score||0} 分</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ display:'flex',gap:'10px',marginTop:'18px' }}>
            <button onClick={()=>setShowEndConfirm(false)} style={{ ...styles.ghostBtn,flex:1 }}>继续游戏</button>
            <button onClick={()=>{setShowEndConfirm(false);handleEndClass()}} style={{ ...styles.dangerBtn,flex:2 }}>确认下课</button>
          </div>
        </Modal>
      )}
    </div>
  )
}