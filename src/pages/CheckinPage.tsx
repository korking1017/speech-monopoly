import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { ClassRecord, StudentRecord } from '../types'
import { loadClasses, loadStudents, saveCheckin } from '../utils/storage'
import Avatar from '../components/Avatar'
import { PageHeader, EmptyState, styles } from '../components/UI'

export default function CheckinPage() {
  const { classId } = useParams<{ classId: string }>()
  const navigate = useNavigate()
  const [classData, setClassData] = useState<ClassRecord | null>(null)
  const [allStudents, setAllStudents] = useState<StudentRecord[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const classes = loadClasses()
    const found = classes.find((c) => c.id === classId) || null
    setClassData(found)

    if (!found) return

    const studentLib = loadStudents()
    let studentList = found.studentIds
      .map((sid) => studentLib.find((s) => s.id === sid))
      .filter((s): s is StudentRecord => Boolean(s))

    // 兼容极旧格式：学生直接存在班级里
    if (studentList.length === 0 && found.students?.length) {
      studentList = found.students
    }

    setAllStudents(studentList)
    // 默认不勾选，避免误把缺勤学生计入（保持原有交互）
    setSelectedIds(new Set())
  }, [classId])

  const toggleStudent = (studentId: string) => {
    const next = new Set(selectedIds)
    if (next.has(studentId)) next.delete(studentId)
    else next.add(studentId)
    setSelectedIds(next)
  }

  const handleNext = () => {
    if (selectedIds.size < 1) {
      alert('请至少选择1名学生参与')
      return
    }
    saveCheckin({ classId: classId!, studentIds: Array.from(selectedIds) })
    navigate(`/grouping/${classId}`)
  }

  if (!classData) {
    return <div style={{ textAlign: 'center', padding: '100px 20px', color: '#999' }}>加载中...</div>
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '16px' }}>
      <PageHeader title={`📋 今日签到 · ${classData.name}`} onBack={() => navigate('/')} />

      <p style={{ color: '#666', marginBottom: '14px', fontSize: '14px' }}>
        请选择今天到课的学生（已选 {selectedIds.size} / {allStudents.length} 人）：
      </p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <button
          onClick={() => setSelectedIds(new Set(allStudents.map((s) => s.id)))}
          style={{ padding: '10px 18px', borderRadius: '10px', backgroundColor: '#E8EFF9', color: '#5B8DEF', fontSize: '14px', fontWeight: 'bold' }}
        >
          全选
        </button>
        <button
          onClick={() => setSelectedIds(new Set())}
          style={{ padding: '10px 18px', borderRadius: '10px', backgroundColor: '#f5f5f5', color: '#666', fontSize: '14px' }}
        >
          取消全选
        </button>
      </div>

      <div style={{ marginBottom: '24px' }}>
        {allStudents.length === 0 ? (
          <div style={{ ...styles.card, padding: 0 }}>
            <EmptyState text="该班级还没有学生，请先到「班级管理」中添加" />
          </div>
        ) : (
          allStudents.map((student) => {
            const isSelected = selectedIds.has(student.id)
            return (
              <div
                key={student.id}
                onClick={() => toggleStudent(student.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px',
                  marginBottom: '10px',
                  backgroundColor: isSelected ? '#E8EFF9' : '#fff',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  border: isSelected ? '2px solid #5B8DEF' : '2px solid #E0E0E0',
                  transition: 'all 0.15s',
                }}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid #5B8DEF' : '2px solid #ccc',
                    backgroundColor: isSelected ? '#5B8DEF' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                    fontSize: '15px',
                    color: '#fff',
                    fontWeight: 'bold',
                    flexShrink: 0,
                  }}
                >
                  {isSelected ? '✓' : ''}
                </div>
                <Avatar avatar={student.avatar} seed={student.id} size={40} rounded />
                <div style={{ marginLeft: '10px', minWidth: 0 }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{student.name}</div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    Lv.{student.stats.currentLevel} {student.stats.currentRank} | 累计总积分 {student.stats.totalScore}
                  </div>
                </div>
                {student.inventory.length > 0 && (
                  <div style={{ marginLeft: 'auto', fontSize: '13px', color: '#5B8DEF', flexShrink: 0 }}>
                    🎒×{student.inventory.length}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <button
        onClick={handleNext}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: '16px',
          fontSize: '18px',
          backgroundColor: selectedIds.size >= 1 ? '#5B8DEF' : '#ccc',
          color: '#fff',
          fontWeight: 'bold',
        }}
      >
        下一步：分组设置 →
      </button>
    </div>
  )
}