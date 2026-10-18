import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ClassRecord, StudentRecord } from '../types'
import { loadClasses, saveClasses, loadStudents } from '../utils/storage'
import Avatar from '../components/Avatar'
import { Modal, styles } from '../components/UI'

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
  cls: ClassRecord
  onEnter: () => void
  onManage: () => void
  onDelete: () => void
}) {
  return (
    <div style={S.card}>
      <div style={S.cardTitle} onClick={onEnter}>📚 {cls.name}</div>
      <div style={S.cardInfo} onClick={onEnter}>
        👥 {cls.studentIds.length}名学生 | 📅 已上{cls.totalSessions}节课 | {cls.semester}
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
  onClose: () => void; onCreate: (name: string, studentIds: string[]) => void
}) {
  const [className, setClassName] = useState('')
  const [allStudents, setAllStudents] = useState<StudentRecord[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    setAllStudents(loadStudents())
  }, [])

  const toggleStudent = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const handleCreate = () => {
    if (!className.trim()) { alert('请输入班级名称'); return }
    if (selectedIds.size < 1) { alert('请至少选择1名学生'); return }
    onCreate(className.trim(), Array.from(selectedIds))
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
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            选择学生（已选 {selectedIds.size} 人）：
          </label>
          {allStudents.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
              <p>暂无学生数据</p>
              <p style={{ fontSize: '13px' }}>请先在「学生管理」中添加学生</p>
            </div>
          ) : (
            <div style={{ maxHeight: '250px', overflow: 'auto' }}>
              {allStudents.map((s: any) => (
                <div key={s.id} onClick={() => toggleStudent(s.id)} style={{
                  display: 'flex', alignItems: 'center', padding: '10px',
                  marginBottom: '6px', backgroundColor: selectedIds.has(s.id) ? '#E8EFF9' : '#f9f9f9',
                  borderRadius: '10px', cursor: 'pointer',
                  border: selectedIds.has(s.id) ? '2px solid #5B8DEF' : '2px solid transparent',
                }}>
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '6px',
                    border: selectedIds.has(s.id) ? '2px solid #5B8DEF' : '2px solid #ccc',
                    backgroundColor: selectedIds.has(s.id) ? '#5B8DEF' : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginRight: '10px', fontSize: '14px', color: '#fff', fontWeight: 'bold',
                    flexShrink: 0,
                  }}>{selectedIds.has(s.id) ? '✓' : ''}</div>
                  <Avatar avatar={s.avatar} seed={s.id} size={34} rounded />
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{s.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>积分：{s.stats.totalScore} | Lv.{s.stats.currentLevel}</div>
                  </div>
                </div>
              ))}
            </div>
          )}        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button style={S.cancelBtn} onClick={onClose}>取消</button>
          <button style={S.confirmBtn} onClick={handleCreate}>创建班级</button>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [classes, setClasses] = useState<ClassRecord[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [deletingClass, setDeletingClass] = useState<ClassRecord | null>(null)
  const navigate = useNavigate()

  const refresh = () => setClasses(loadClasses())

  useEffect(() => {
    refresh()
  }, [])

  const persist = (updated: ClassRecord[]) => {
    setClasses(updated)
    saveClasses(updated)
  }

  const handleCreateClass = (name: string, studentIds: string[]) => {
    const now = new Date()
    const newClass: ClassRecord = {
      id: `cls_${Date.now()}`,
      name,
      semester: `${now.getFullYear()}年${now.getMonth() + 1}月`,
      createdAt: now.toISOString(),
      startedAt: now.getTime(),
      totalSessions: 0,
      studentIds,
      students: [],
      // 新班级的本学期积分从 0 开始，不会继承学生的历史总积分
      scores: Object.fromEntries(studentIds.map((id) => [id, 0])),
      attendance: Object.fromEntries(studentIds.map((id) => [id, 0])),
    }
    persist([...classes, newClass])
    setShowCreateModal(false)
  }

  const handleDeleteClass = (cls: ClassRecord) => {
    persist(classes.filter((c) => c.id !== cls.id))
    setDeletingClass(null)
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
            <p style={{ fontSize: '13px', marginTop: '8px' }}>提示：请先在「学生管理」中添加学生</p>
          </div>
        ) : (
          classes.map((cls) => (
            <ClassCard key={cls.id} cls={cls}
              onEnter={() => navigate(`/checkin/${cls.id}`)}
              onManage={() => navigate(`/class/${cls.id}`)}
              onDelete={() => setDeletingClass(cls)}
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
        <button style={S.secondaryBtn} onClick={() => navigate('/students')}>
          👥 学生管理
        </button>
      </div>

      <div style={{ marginTop: '10px', display: 'flex', gap: '12px' }}>
        <button style={S.secondaryBtn} onClick={() => navigate('/question-bank')}>
          📚 题库管理
        </button>
      </div>

      {showCreateModal && (
        <CreateClassModal onClose={() => setShowCreateModal(false)} onCreate={handleCreateClass} />
      )}

      {deletingClass && (
        <Modal title="🗑️ 删除班级" onClose={() => setDeletingClass(null)} maxWidth={420}>
          <p style={{ fontSize: '15px', lineHeight: 1.8, color: '#555' }}>
            确定要删除「{deletingClass.name}」吗？
            <br />
            <span style={{ color: '#4CAF50' }}>学生档案和累计总积分保留在学生管理中心，不会丢失。</span>
            <br />
            <span style={{ color: '#F44336', fontSize: '13px' }}>该班的本学期积分记录将一并删除。</span>
          </p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={() => setDeletingClass(null)} style={{ ...styles.ghostBtn, flex: 1 }}>取消</button>
            <button onClick={() => handleDeleteClass(deletingClass)} style={{ ...styles.dangerBtn, flex: 2 }}>
              确认删除
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}