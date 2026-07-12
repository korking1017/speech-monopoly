import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function CheckinPage() {
  const { classId } = useParams<{ classId: string }>()
  const navigate = useNavigate()
  const [classData, setClassData] = useState<any>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const stored = localStorage.getItem('speech_classes')
    if (stored) {
      const classes = JSON.parse(stored)
      const found = classes.find((c: any) => c.id === classId)
      if (found) setClassData(found)
    }
  }, [classId])

  const toggleStudent = (studentId: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(studentId)) {
      newSet.delete(studentId)
    } else {
      newSet.add(studentId)
    }
    setSelectedIds(newSet)
  }

  const selectAll = () => {
    if (classData) {
      setSelectedIds(new Set(classData.students.map((s: any) => s.id)))
    }
  }

  const deselectAll = () => {
    setSelectedIds(new Set())
  }

  const handleNext = () => {
    if (selectedIds.size < 2) {
      alert('请至少选择2名学生参与')
      return
    }
    const ids = Array.from(selectedIds)
    localStorage.setItem('speech_current_checkin', JSON.stringify({
      classId,
      studentIds: ids,
    }))
    navigate(`/grouping/${classId}`)
  }

  if (!classData) {
    return <div style={{ textAlign: 'center', padding: '100px 20px', color: '#999' }}>加载中...</div>
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={() => navigate('/')} style={{
          fontSize: '24px', background: 'none', minWidth: '44px', minHeight: '44px',
        }}>←</button>
        <h2 style={{ fontSize: '24px', marginLeft: '8px' }}>📋 今日签到 - {classData.name}</h2>
      </div>

      <p style={{ color: '#666', marginBottom: '20px' }}>
        请选择今天到课的学生（已选 {selectedIds.size} 人）：
      </p>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <button onClick={selectAll} style={{
          padding: '10px 20px', borderRadius: '10px', backgroundColor: '#E8EFF9',
          color: '#5B8DEF', fontSize: '14px', fontWeight: 'bold',
        }}>全选</button>
        <button onClick={deselectAll} style={{
          padding: '10px 20px', borderRadius: '10px', backgroundColor: '#f5f5f5',
          color: '#666', fontSize: '14px',
        }}>取消全选</button>
      </div>

      <div style={{ marginBottom: '30px' }}>
        {classData.students.map((student: any) => {
          const isSelected = selectedIds.has(student.id)
          return (
            <div key={student.id} onClick={() => toggleStudent(student.id)} style={{
              display: 'flex', alignItems: 'center', padding: '16px',
              marginBottom: '10px', backgroundColor: isSelected ? '#E8EFF9' : '#fff',
              borderRadius: '14px', cursor: 'pointer',
              border: isSelected ? '2px solid #5B8DEF' : '2px solid #E0E0E0',
              transition: 'all 0.2s',
            }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px',
                border: isSelected ? '2px solid #5B8DEF' : '2px solid #ccc',
                backgroundColor: isSelected ? '#5B8DEF' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginRight: '14px', fontSize: '16px', color: '#fff', fontWeight: 'bold',
                flexShrink: 0,
              }}>
                {isSelected ? '✓' : ''}
              </div>
              <span style={{ fontSize: '20px', marginRight: '10px' }}>{student.emoji}</span>
              <div>
                <div style={{ fontSize: '17px', fontWeight: 'bold' }}>{student.name}</div>
                <div style={{ fontSize: '13px', color: '#999' }}>
                  Lv.{student.stats.currentLevel} {student.stats.currentRank} | 总积分：{student.stats.totalScore}
                </div>
              </div>
              {student.inventory.length > 0 && (
                <div style={{ marginLeft: 'auto', fontSize: '14px', color: '#5B8DEF' }}>
                  🎒 道具×{student.inventory.length}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button onClick={handleNext} style={{
        width: '100%', padding: '16px', borderRadius: '16px', fontSize: '18px',
        backgroundColor: selectedIds.size >= 2 ? '#5B8DEF' : '#ccc',
        color: '#fff', fontWeight: 'bold',
      }}>
        下一步：分组设置 →
      </button>
    </div>
  )
}