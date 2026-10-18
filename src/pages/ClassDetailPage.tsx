// 班级详情页
// 积分说明（重要）：
//   本页显示的积分是「本学期积分」= 该班级创建后，该生在这个班里获得的积分。
//   学生管理中心显示的是「累计总积分」，两者是独立的两套数据。
// 学生形象可在此设置，保存后会同步到学生管理中心。

import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { AvatarConfig, ClassRecord, StudentRecord } from '../types'
import { rankColor } from '../types'
import {
  loadClasses,
  saveClasses,
  loadStudents,
  saveStudents,
  getClassScore,
  getClassAttendance,
  getClassTotalScore,
} from '../utils/storage'
import { normalizeAvatar } from '../data/avatar'
import Avatar from '../components/Avatar'
import AvatarBuilder from '../components/AvatarBuilder'
import { Modal, PageHeader, EmptyState, styles } from '../components/UI'

export default function ClassDetailPage() {
  const { classId } = useParams<{ classId: string }>()
  const navigate = useNavigate()

  const [classData, setClassData] = useState<ClassRecord | null>(null)
  const [allStudents, setAllStudents] = useState<StudentRecord[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null)
  const [editName, setEditName] = useState('')
  const [editAvatar, setEditAvatar] = useState<AvatarConfig | null>(null)
  const [removingStudent, setRemovingStudent] = useState<StudentRecord | null>(null)

  useEffect(() => {
    const classes = loadClasses()
    const students = loadStudents()
    setAllStudents(students)
    setClassData(classes.find((c) => c.id === classId) || null)
  }, [classId])

  const persistClass = (updated: ClassRecord) => {
    const classes = loadClasses().map((c) => (c.id === updated.id ? updated : c))
    saveClasses(classes)
    setClassData(updated)
  }

  /** 本班学生列表（按 id 顺序，缺失的自动跳过） */
  const classStudents = useMemo(() => {
    if (!classData) return []
    // 按本学期积分从高到低展示，便于课堂激励
    return classData.studentIds
      .map((sid) => allStudents.find((s) => s.id === sid))
      .filter((s): s is StudentRecord => Boolean(s))
      .sort(
        (a, b) =>
          getClassScore(classData, b.id, b) - getClassScore(classData, a.id, a),
      )
  }, [classData, allStudents])

  const availableStudents = useMemo(() => {
    if (!classData) return []
    return allStudents.filter((s) => !classData.studentIds.includes(s.id))
  }, [allStudents, classData])

  const classTotalScore = useMemo(
    () => getClassTotalScore(classData, classStudents),
    [classData, classStudents],
  )

  /* --------------------------- 学生进出班级 --------------------------- */

  const handleAddStudent = (studentId: string) => {
    if (!classData) return
    if (classData.studentIds.includes(studentId)) {
      alert('该学生已在班级中')
      return
    }
    persistClass({
      ...classData,
      studentIds: [...classData.studentIds, studentId],
      // 新加入的学生本学期积分从 0 开始，不影响其历史总积分
      scores: { ...(classData.scores || {}), [studentId]: classData.scores?.[studentId] ?? 0 },
      attendance: { ...(classData.attendance || {}), [studentId]: classData.attendance?.[studentId] ?? 0 },
    })
    setShowAddModal(false)
  }

  const handleRemoveStudent = (student: StudentRecord) => {
    if (!classData) return
    const nextScores = { ...(classData.scores || {}) }
    const nextAttendance = { ...(classData.attendance || {}) }
    delete nextScores[student.id]
    delete nextAttendance[student.id]
    persistClass({
      ...classData,
      studentIds: classData.studentIds.filter((id) => id !== student.id),
      scores: nextScores,
      attendance: nextAttendance,
    })
    setRemovingStudent(null)
  }

  /* ----------------------------- 编辑形象 ----------------------------- */

  const openEdit = (student: StudentRecord) => {
    setEditingStudent(student)
    setEditName(student.name)
    setEditAvatar(normalizeAvatar(student.avatar, student.id))
  }

  const handleSaveEdit = () => {
    if (!editingStudent) return
    if (!editName.trim()) {
      alert('姓名不能为空')
      return
    }
    const updated = allStudents.map((s) =>
      s.id === editingStudent.id
        ? { ...s, name: editName.trim(), avatar: editAvatar || s.avatar }
        : s,
    )
    setAllStudents(updated)
    saveStudents(updated)
    setEditingStudent(null)
  }

  if (!classData) {
    return <div style={{ textAlign: 'center', padding: '100px 20px', color: '#999' }}>加载中...</div>
  }

  return (
    <div style={styles.page}>
      <PageHeader
        title={`📚 ${classData.name}`}
        onBack={() => navigate('/')}
        right={
          <button
            onClick={() => setShowAddModal(true)}
            style={{ ...styles.primaryBtn, padding: '10px 16px', fontSize: '14px', backgroundColor: '#4CAF50' }}
          >
            + 添加学生
          </button>
        }
      />

      {/* 课程概览 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
        {[
          { value: classStudents.length, label: '班级人数', color: '#5B8DEF' },
          { value: classTotalScore, label: '本学期总积分', color: '#4CAF50' },
          { value: classData.totalSessions, label: '已上课时', color: '#FF9800' },
        ].map((item) => (
          <div key={item.label} style={{ ...styles.card, padding: '14px', textAlign: 'center', marginBottom: 0 }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: item.color }}>{item.value}</div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{item.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <button
          onClick={() => navigate(`/checkin/${classId}`)}
          style={{ ...styles.primaryBtn, flex: 1 }}
        >
          📋 开始上课
        </button>
        <button
          onClick={() => navigate(`/class/${classId}/report`)}
          style={{
            ...styles.primaryBtn,
            flex: 1,
            backgroundColor: '#fff',
            color: '#5B8DEF',
            border: '2px solid #5B8DEF',
          }}
        >
          📊 学期报告
        </button>
      </div>

      <div style={styles.card}>
        <h3 style={{ marginBottom: '8px', fontSize: '17px' }}>👥 班级学生</h3>
        <p style={{ fontSize: '12px', color: '#999', marginBottom: '14px', lineHeight: 1.6 }}>
          这里的<strong>积分是本学期积分</strong>（本班创建后累计），与学生管理中心的累计总积分分开统计。
          <br />
          移除学生只会移出本班，学生档案与累计总积分仍然保留在学生管理中心。
        </p>

        {classStudents.length === 0 ? (
          <EmptyState text="还没有学生，点击右上角从学生库中添加" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {classStudents.map((student) => {
              const semesterScore = getClassScore(classData, student.id, student)
              const attendance = getClassAttendance(classData, student.id, student)
              return (
                <div
                  key={student.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '12px',
                    gap: '12px',
                  }}
                >
                  <Avatar avatar={student.avatar} seed={student.id} size={44} rounded />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{student.name}</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                      Lv.{student.stats.currentLevel} {student.stats.currentRank} | 累计总积分{' '}
                      {student.stats.totalScore} | 本班出勤 {attendance}次
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#4CAF50' }}>
                      {semesterScore}
                    </div>
                    <div style={{ fontSize: '10px', color: '#999' }}>本学期积分</div>
                  </div>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '10px',
                      backgroundColor: rankColor(student.stats.currentRank) + '33',
                      color: rankColor(student.stats.currentRank),
                      fontSize: '11px',
                      fontWeight: 'bold',
                      flexShrink: 0,
                    }}
                  >
                    {student.stats.currentRank}
                  </span>
                  <button
                    onClick={() => openEdit(student)}
                    aria-label="编辑"
                    style={{ padding: '6px 10px', borderRadius: '8px', backgroundColor: '#E8EFF9', color: '#5B8DEF', fontSize: '13px', flexShrink: 0 }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => setRemovingStudent(student)}
                    style={{ padding: '6px 10px', borderRadius: '8px', backgroundColor: '#FFF3E0', color: '#FF9800', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}
                  >
                    移除
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 添加学生弹窗 */}
      {showAddModal && (
        <Modal title="➕ 从学生库添加" onClose={() => setShowAddModal(false)}>
          {availableStudents.length === 0 ? (
            <EmptyState text="学生库中没有可添加的学生，请先在「学生管理」中创建" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '52vh', overflow: 'auto' }}>
              {availableStudents.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleAddStudent(s.id)}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    backgroundColor: '#f5f5f5',
                    border: '2px solid #E0E0E0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <Avatar avatar={s.avatar} seed={s.id} size={38} rounded />
                  <span style={{ fontWeight: 'bold' }}>{s.name}</span>
                  <span style={{ marginLeft: 'auto', color: '#666', fontSize: '12px' }}>
                    累计 {s.stats.totalScore} 分
                  </span>
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => setShowAddModal(false)}
            style={{ ...styles.ghostBtn, width: '100%', marginTop: '12px' }}
          >
            取消
          </button>
        </Modal>
      )}

      {/* 编辑学生弹窗（含形象设置） */}
      {editingStudent && editAvatar && (
        <Modal
          title="✏️ 编辑学生形象"
          onClose={() => setEditingStudent(null)}
          maxWidth={560}
          footer={
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setEditingStudent(null)} style={{ ...styles.ghostBtn, flex: 1 }}>
                取消
              </button>
              <button onClick={handleSaveEdit} style={{ ...styles.primaryBtn, flex: 2 }}>
                💾 保存
              </button>
            </div>
          }
        >
          <div style={{ marginBottom: '16px' }}>
            <label style={styles.label}>姓名：</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit()
              }}
              style={styles.input}
            />
          </div>
          <label style={styles.label}>人物形象：</label>
          <AvatarBuilder
            value={editAvatar}
            seed={editingStudent.id}
            onChange={setEditAvatar}
            size={120}
          />
        </Modal>
      )}

      {/* 移除确认 */}
      {removingStudent && (
        <Modal title="移出班级" onClose={() => setRemovingStudent(null)} maxWidth={420}>
          <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#555' }}>
            确定将「{removingStudent.name}」从本班移除吗？
            <br />
            <span style={{ color: '#4CAF50' }}>
              学生档案与累计总积分会保留在学生管理中心，不会丢失。
            </span>
            <br />
            <span style={{ color: '#F44336', fontSize: '13px' }}>
              注意：该生在本班的「本学期积分」记录将一并移除。
            </span>
          </p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={() => setRemovingStudent(null)} style={{ ...styles.ghostBtn, flex: 1 }}>
              取消
            </button>
            <button
              onClick={() => handleRemoveStudent(removingStudent)}
              style={{ ...styles.dangerBtn, flex: 2 }}
            >
              确认移除
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
