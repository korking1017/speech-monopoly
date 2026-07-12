import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const S = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '20px' } as React.CSSProperties,
  title: { textAlign: 'center', marginBottom: '30px', marginTop: '20px' } as React.CSSProperties,
  h1: { fontSize: '32px', color: '#5B8DEF' },
  subtitle: { color: '#666', marginTop: '8px' },
  card: {
    backgroundColor: '#fff', borderRadius: '16px', padding: '20px',
    marginBottom: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    cursor: 'pointer', transition: 'transform 0.2s',
  } as React.CSSProperties,
  cardTitle: { fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' },
  cardInfo: { fontSize: '14px', color: '#666' },
  cardActions: { display: 'flex', gap: '8px', marginTop: '12px' } as React.CSSProperties,
  actionBtn: {
    padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold',
    cursor: 'pointer', border: 'none',
  } as React.CSSProperties,
  emptyBox: {
    textAlign: 'center', padding: '60px 20px',
    backgroundColor: '#fff', borderRadius: '16px', color: '#999',
  } as React.CSSProperties,
  primaryBtn: {
    width: '100%', padding: '16px', borderRadius: '16px', fontSize: '18px',
    backgroundColor: '#5B8DEF', color: '#fff', fontWeight: 'bold',
    boxShadow: '0 4px 12px rgba(91,141,239,0.3)',
  } as React.CSSProperties,
  secondaryBtn: {
    flex: 1, padding: '14px', borderRadius: '12px', fontSize: '16px',
    backgroundColor: '#fff', color: '#5B8DEF', border: '2px solid #5B8DEF',
  } as React.CSSProperties,
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  } as React.CSSProperties,
  modalBox: {
    backgroundColor: '#fff', borderRadius: '20px', padding: '30px',
    width: '90%', maxWidth: '500px', maxHeight: '80vh', overflow: 'auto',
  } as React.CSSProperties,
  input: {
    width: '100%', padding: '12px', fontSize: '16px',
    border: '2px solid #E0E0E0', borderRadius: '8px',
  } as React.CSSProperties,
  textarea: {
    width: '100%', padding: '12px', fontSize: '16px',
    border: '2px solid #E0E0E0', borderRadius: '8px', resize: 'vertical' as const,
  },
  cancelBtn: {
    padding: '12px 24px', borderRadius: '12px', fontSize: '16px',
    backgroundColor: '#f5f5f5', color: '#333',
  } as React.CSSProperties,
  confirmBtn: {
    padding: '12px 24px', borderRadius: '12px', fontSize: '16px',
    backgroundColor: '#5B8DEF', color: '#fff', fontWeight: 'bold',
  } as React.CSSProperties,
}

function ClassCard({ cls, onEnter, onManage, onDelete }: {
  cls: any
  onEnter: () => void
  onManage: () => void
  onDelete: () => void
}) {
  return (
    <div style={S.card}>
      <div style={S.cardTitle} onClick={onEnter}>📚 {cls.name}</div>
      <div style={S.cardInfo} onClick={onEnter}>
        👥 {cls.students.length}名学生 | 📅 已上{cls.totalSessions}节课 | {cls.semester}
      </div>
      <div style={S.cardActions}>
        <button onClick={(e) => { e.stopPropagation(); onEnter() }} style={{
          ...S.actionBtn, backgroundColor: '#5B8DEF', color: '#fff',
        }}>📋 上课</button>
        <button onClick={(e) => { e.stopPropagation(); onManage() }} style={{
          ...S.actionBtn, backgroundColor: '#E8EFF9', color: '#5B8DEF',
        }}>👥 管理</button>
        <button onClick={(e) => { e.stopPropagation(); onDelete() }} style={{
          ...S.actionBtn, backgroundColor: '#FFEBEE', color: '#F44336',
        }}>🗑️ 删除</button>
      </div>
    </div>
  )
}

function CreateClassModal({ onClose, onCreate }: {
  onClose: () => void; onCreate: (name: string, students: string[]) => void
}) {
  const [className, setClassName] = useState('')
  const [studentInput, setStudentInput] = useState('')

  const handleCreate = () => {
    const students = studentInput.split('\n').map(s => s.trim()).filter(s => s.length > 0)
    if (!className.trim()) { alert('请输入班级名称'); return }
    if (students.length < 1) { alert('请至少输入1名学生（每行一个名字）'); return }
    onCreate(className, students)
  }

  return (
    <div style={S.modalOverlay} onClick={onClose}>
      <div style={S.modalBox} onClick={e => e.stopPropagation()}>
        <h2 style={{ marginBottom: '20px', fontSize: '24px' }}>🏫 创建新班级</h2>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>班级名称：</label>
          <input type="text" value={className} onChange={e => setClassName(e.target.value)}
            placeholder="例如：口才3班" style={S.input} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            学生名单（每行一个名字，可留空后续添加）：
          </label>
          <textarea value={studentInput} onChange={e => setStudentInput(e.target.value)}
            placeholder={'张三\n李四\n王五\n赵六'} rows={8} style={S.textarea} />
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button style={S.cancelBtn} onClick={onClose}>取消</button>
          <button style={S.confirmBtn} onClick={handleCreate}>创建班级</button>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [classes, setClasses] = useState<any[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const stored = localStorage.getItem('speech_classes')
    if (stored) setClasses(JSON.parse(stored))
  }, [])

  const saveClasses = (updated: any[]) => {
    setClasses(updated)
    localStorage.setItem('speech_classes', JSON.stringify(updated))
  }

  const handleCreateClass = (name: string, studentNames: string[]) => {
    const emojis = ['🦊', '🐱', '🐶', '🐼', '🦁', '🐯', '🐰', '🐨', '🐮', '🐷']
    const newClass = {
      id: Date.now().toString(),
      name,
      semester: new Date().getFullYear() + '年' + (new Date().getMonth() + 1) + '月',
      createdAt: new Date().toISOString(),
      totalSessions: 0,
      students: studentNames.map((name, i) => ({
        id: Date.now().toString() + i,
        name,
        emoji: emojis[i % emojis.length],
        stats: {
          totalScore: 0, sessionsAttended: 0, winCount: 0, mvpCount: 0,
          currentLevel: 1, currentRank: '口语新星',
          categoryStats: {
            tongueTwister: { completed: 0, totalScore: 0, avgScore: 0 },
            recitation: { completed: 0, totalScore: 0, avgScore: 0 },
            impromptu: { completed: 0, totalScore: 0, avgScore: 0 },
            imitation: { completed: 0, totalScore: 0, avgScore: 0 },
          },
        },
        inventory: [],
        achievements: [],
      })),
    }
    saveClasses([...classes, newClass])
    setShowCreateModal(false)
  }

  const handleDeleteClass = (classId: string, className: string) => {
    if (!confirm(`确定要删除「${className}」吗？\n该班级的所有数据将被永久删除！`)) return
    saveClasses(classes.filter(c => c.id !== classId))
  }

  return (
    <div style={S.container}>
      <div style={S.title}>
        <h1 style={S.h1}>🎯 口才大富翁</h1>
        <p style={S.subtitle}>少儿口才课堂互动游戏</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>📚 我的班级</h2>
        {classes.length === 0 ? (
          <div style={S.emptyBox}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <p>还没有班级，点击下方按钮创建一个吧！</p>
          </div>
        ) : (
          classes.map((cls: any) => (
            <ClassCard key={cls.id} cls={cls}
              onEnter={() => navigate(`/checkin/${cls.id}`)}
              onManage={() => navigate(`/class/${cls.id}`)}
              onDelete={() => handleDeleteClass(cls.id, cls.name)}
            />
          ))
        )}
      </div>

      <button style={S.primaryBtn} onClick={() => setShowCreateModal(true)}>
        + 创建新班级
      </button>

      <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
        <button style={S.secondaryBtn} onClick={() => navigate('/settings')}>
          ⚙️ 系统设置
        </button>
        <button style={S.secondaryBtn} onClick={() => navigate('/question-bank')}>
          📚 题库管理
        </button>
      </div>

      {showCreateModal && (
        <CreateClassModal onClose={() => setShowCreateModal(false)} onCreate={handleCreateClass} />
      )}
    </div>
  )
}