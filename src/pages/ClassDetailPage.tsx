import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const DEFAULT_EMOJIS = ['🦊', '🐱', '🐶', '🐼', '🦁', '🐯', '🐰', '🐨', '🐮', '🐷']

export default function ClassDetailPage() {
  const { classId } = useParams<{ classId: string }>()
  const navigate = useNavigate()
  const [classData, setClassData] = useState<any>(null)
  const [allClasses, setAllClasses] = useState<any[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newStudentName, setNewStudentName] = useState('')
  const [editingStudent, setEditingStudent] = useState<any>(null)
  const [editName, setEditName] = useState('')
  const [editEmoji, setEditEmoji] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('speech_classes')
    if (stored) {
      const classes = JSON.parse(stored)
      setAllClasses(classes)
      const found = classes.find((c: any) => c.id === classId)
      if (found) setClassData(found)
    }
  }, [classId])

  const saveClasses = (updatedClasses: any[]) => {
    setAllClasses(updatedClasses)
    localStorage.setItem('speech_classes', JSON.stringify(updatedClasses))
    const found = updatedClasses.find((c: any) => c.id === classId)
    if (found) setClassData(found)
  }

  // 添加学生
  const handleAddStudent = () => {
    if (!newStudentName.trim()) {
      alert('请输入学生姓名')
      return
    }
    const usedEmojis = classData.students.map((s: any) => s.emoji)
    const availableEmoji = DEFAULT_EMOJIS.find(e => !usedEmojis.includes(e)) || '👤'
    
    const newStudent = {
      id: Date.now().toString(),
      name: newStudentName.trim(),
      emoji: availableEmoji,
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
    }

    const updatedClasses = allClasses.map((c: any) => {
      if (c.id === classId) {
        return { ...c, students: [...c.students, newStudent] }
      }
      return c
    })
    saveClasses(updatedClasses)
    setNewStudentName('')
    setShowAddModal(false)
  }

  // 删除学生
  const handleDeleteStudent = (studentId: string, studentName: string) => {
    if (!confirm(`确定要删除「${studentName}」吗？\n该学生的所有积分和道具将被永久删除！`)) return
    
    const updatedClasses = allClasses.map((c: any) => {
      if (c.id === classId) {
        return { ...c, students: c.students.filter((s: any) => s.id !== studentId) }
      }
      return c
    })
    saveClasses(updatedClasses)
  }

  // 开始编辑学生
  const handleStartEdit = (student: any) => {
    setEditingStudent(student)
    setEditName(student.name)
    setEditEmoji(student.emoji)
  }

  // 保存编辑
  const handleSaveEdit = () => {
    if (!editName.trim()) {
      alert('姓名不能为空')
      return
    }
    const updatedClasses = allClasses.map((c: any) => {
      if (c.id === classId) {
        return {
          ...c,
          students: c.students.map((s: any) => {
            if (s.id === editingStudent.id) {
              return { ...s, name: editName.trim(), emoji: editEmoji }
            }
            return s
          }),
        }
      }
      return c
    })
    saveClasses(updatedClasses)
    setEditingStudent(null)
  }

  if (!classData) {
    return <div style={{ textAlign: 'center', padding: '100px 20px', color: '#999' }}>加载中...</div>
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      {/* 顶部导航 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button onClick={() => navigate('/')} style={{
            fontSize: '24px', background: 'none', minWidth: '44px', minHeight: '44px',
          }}>←</button>
          <div>
            <h2 style={{ fontSize: '22px', marginLeft: '8px' }}>📚 {classData.name}</h2>
            <div style={{ fontSize: '13px', color: '#666', marginLeft: '8px' }}>
              {classData.semester} | {classData.students.length}名学生 | 已上{classData.totalSessions}节课
            </div>
          </div>
        </div>
        <button onClick={() => setShowAddModal(true)} style={{
          padding: '10px 18px', borderRadius: '12px', backgroundColor: '#4CAF50',
          color: '#fff', fontWeight: 'bold', fontSize: '14px',
        }}>+ 添加学生</button>
      </div>

      {/* 快捷操作 */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => navigate(`/checkin/${classId}`)} style={{
          flex: 1, padding: '14px', borderRadius: '12px', fontSize: '16px',
          backgroundColor: '#5B8DEF', color: '#fff', fontWeight: 'bold',
        }}>📋 开始上课</button>
        <button onClick={() => navigate(`/class/${classId}/report`)} style={{
          flex: 1, padding: '14px', borderRadius: '12px', fontSize: '16px',
          backgroundColor: '#fff', color: '#5B8DEF', border: '2px solid #5B8DEF', fontWeight: 'bold',
        }}>📊 学期报告</button>
      </div>

      {/* 学生列表 */}
      <div style={{
        backgroundColor: '#fff', borderRadius: '16px', padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>👥 学生名单</h3>
        
        {classData.students.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>📭</div>
            <p>还没有学生，点击右上角添加吧！</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {classData.students.map((student: any) => (
              <div key={student.id} style={{
                display: 'flex', alignItems: 'center', padding: '14px',
                backgroundColor: '#f9f9f9', borderRadius: '12px', gap: '12px',
              }}>
                <span style={{ fontSize: '28px' }}>{student.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{student.name}</div>
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    Lv.{student.stats.currentLevel} {student.stats.currentRank} | 
                    总积分：{student.stats.totalScore} | 
                    出勤：{student.stats.sessionsAttended}次
                  </div>
                </div>
                {student.inventory && student.inventory.length > 0 && (
                  <span style={{ fontSize: '12px', color: '#5B8DEF' }}>🎒×{student.inventory.length}</span>
                )}
                <button onClick={() => handleStartEdit(student)} style={{
                  padding: '6px 12px', borderRadius: '8px', backgroundColor: '#E8EFF9',
                  color: '#5B8DEF', fontSize: '13px', fontWeight: 'bold',
                }}>✏️</button>
                <button onClick={() => handleDeleteStudent(student.id, student.name)} style={{
                  padding: '6px 12px', borderRadius: '8px', backgroundColor: '#FFEBEE',
                  color: '#F44336', fontSize: '13px', fontWeight: 'bold',
                }}>🗑️</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 添加学生弹窗 */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setShowAddModal(false)}>
          <div style={{
            backgroundColor: '#fff', borderRadius: '20px', padding: '24px',
            width: '90%', maxWidth: '400px',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '16px' }}>➕ 添加学生</h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>学生姓名：</label>
              <input type="text" value={newStudentName}
                onChange={e => setNewStudentName(e.target.value)}
                placeholder="输入姓名"
                onKeyDown={e => { if (e.key === 'Enter') handleAddStudent() }}
                autoFocus
                style={{
                  width: '100%', padding: '12px', fontSize: '16px',
                  border: '2px solid #E0E0E0', borderRadius: '8px',
                }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowAddModal(false)} style={{
                flex: 1, padding: '12px', borderRadius: '10px',
                backgroundColor: '#f5f5f5', color: '#666', fontSize: '15px',
              }}>取消</button>
              <button onClick={handleAddStudent} style={{
                flex: 2, padding: '12px', borderRadius: '10px',
                backgroundColor: '#4CAF50', color: '#fff', fontSize: '15px', fontWeight: 'bold',
              }}>✅ 确认添加</button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑学生弹窗 */}
      {editingStudent && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setEditingStudent(null)}>
          <div style={{
            backgroundColor: '#fff', borderRadius: '20px', padding: '24px',
            width: '90%', maxWidth: '400px',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '16px' }}>✏️ 编辑学生信息</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>头像：</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {DEFAULT_EMOJIS.map(emoji => (
                  <button key={emoji} onClick={() => setEditEmoji(emoji)} style={{
                    fontSize: '28px', padding: '6px', borderRadius: '8px',
                    backgroundColor: editEmoji === emoji ? '#E8EFF9' : '#f5f5f5',
                    border: editEmoji === emoji ? '2px solid #5B8DEF' : '2px solid transparent',
                    cursor: 'pointer',
                  }}>{emoji}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>姓名：</label>
              <input type="text" value={editName}
                onChange={e => setEditName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit() }}
                autoFocus
                style={{
                  width: '100%', padding: '12px', fontSize: '16px',
                  border: '2px solid #E0E0E0', borderRadius: '8px',
                }} />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setEditingStudent(null)} style={{
                flex: 1, padding: '12px', borderRadius: '10px',
                backgroundColor: '#f5f5f5', color: '#666', fontSize: '15px',
              }}>取消</button>
              <button onClick={handleSaveEdit} style={{
                flex: 2, padding: '12px', borderRadius: '10px',
                backgroundColor: '#5B8DEF', color: '#fff', fontSize: '15px', fontWeight: 'bold',
              }}>💾 保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}