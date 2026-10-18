// 学生管理中心
// 积分说明：这里展示的是学生的「累计总积分」（跨学期、跨班级）。
// 学生形象可在此设置：脸型 / 肤色 / 发型 / 发色 / 眼睛 / 衣饰 / 配饰。

import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AvatarConfig, StudentRecord } from '../types'
import { rankColor } from '../types'
import {
  loadStudents,
  saveStudents,
  createStudent,
  loadClasses,
} from '../utils/storage'
import { randomAvatar, normalizeAvatar } from '../data/avatar'
import Avatar from '../components/Avatar'
import AvatarBuilder from '../components/AvatarBuilder'
import { Modal, PageHeader, EmptyState, styles } from '../components/UI'

export default function StudentManager() {
  const navigate = useNavigate()
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [detailStudent, setDetailStudent] = useState<StudentRecord | null>(null)

  // 新增学生
  const [newName, setNewName] = useState('')
  const [newAvatar, setNewAvatar] = useState<AvatarConfig>(() => randomAvatar('new'))

  // 编辑学生
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null)
  const [editName, setEditName] = useState('')
  const [editAvatar, setEditAvatar] = useState<AvatarConfig>({ ...newAvatar })

  // 删除确认
  const [deletingStudent, setDeletingStudent] = useState<StudentRecord | null>(null)

  const [search, setSearch] = useState('')

  useEffect(() => {
    setStudents(loadStudents())
  }, [])

  const persist = (list: StudentRecord[]) => {
    setStudents(list)
    saveStudents(list)
  }

  const sorted = useMemo(
    () => [...students].sort((a, b) => b.stats.totalScore - a.stats.totalScore),
    [students],
  )

  const filtered = useMemo(() => {
    const q = search.trim()
    if (!q) return sorted
    return sorted.filter((s) => s.name.includes(q))
  }, [sorted, search])

  const totalScore = useMemo(
    () => students.reduce((sum, s) => sum + (s.stats.totalScore || 0), 0),
    [students],
  )

  /* ------------------------------ 新增 ------------------------------ */

  const openAdd = () => {
    setNewName('')
    setNewAvatar(randomAvatar(`new_${Date.now()}`))
    setShowAddModal(true)
  }

  const handleAddStudent = () => {
    if (!newName.trim()) {
      alert('请输入学生姓名')
      return
    }
    if (students.some((s) => s.name === newName.trim())) {
      if (!confirm(`已存在同名学生「${newName.trim()}」，仍要添加吗？`)) return
    }
    const student = createStudent(newName, newAvatar)
    persist([...students, student])
    setShowAddModal(false)
  }

  /* ------------------------------ 编辑 ------------------------------ */

  const openEdit = (student: StudentRecord) => {
    setEditingStudent(student)
    setEditName(student.name)
    setEditAvatar(normalizeAvatar(student.avatar, student.id))
  }

  const handleSaveEdit = () => {
    if (!editName.trim()) {
      alert('姓名不能为空')
      return
    }
    if (!editingStudent) return
    const updated = students.map((s) =>
      s.id === editingStudent.id
        ? { ...s, name: editName.trim(), avatar: editAvatar }
        : s,
    )
    persist(updated)
    if (detailStudent?.id === editingStudent.id) {
      setDetailStudent({ ...editingStudent, name: editName.trim(), avatar: editAvatar })
    }
    setEditingStudent(null)
  }

  /* ------------------------------ 删除 ------------------------------ */

  const handleDeleteStudent = (student: StudentRecord) => {
    persist(students.filter((s) => s.id !== student.id))
    setDeletingStudent(null)
    if (detailStudent?.id === student.id) setDetailStudent(null)
  }

  return (
    <div style={styles.page}>
      <PageHeader
        title="👥 学生管理中心"
        onBack={() => navigate('/')}
        right={
          <button onClick={openAdd} style={{ ...styles.primaryBtn, padding: '10px 16px', fontSize: '14px' }}>
            + 添加学生
          </button>
        }
      />

      {/* 统计概览 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
        {[
          { value: students.length, label: '总学生数', color: '#5B8DEF' },
          { value: totalScore, label: '累计总积分', color: '#4CAF50' },
          { value: students.filter((s) => s.inventory.length > 0).length, label: '持有道具人数', color: '#FF9800' },
        ].map((item) => (
          <div key={item.label} style={{ ...styles.card, padding: '14px', textAlign: 'center', marginBottom: 0 }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: item.color }}>{item.value}</div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{item.label}</div>
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <h3 style={{ fontSize: '17px' }}>📋 学生名单</h3>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索姓名"
            style={{ ...styles.input, width: '160px', padding: '8px 12px', fontSize: '14px' }}
          />
        </div>

        <p style={{ fontSize: '12px', color: '#999', marginBottom: '12px' }}>
          此处显示学生在所有班级的<strong>累计总积分</strong>；班级内的「本学期积分」请见班级详情页。
        </p>

        {students.length === 0 ? (
          <EmptyState text="还没有学生，点击右上角添加吧！" />
        ) : filtered.length === 0 ? (
          <EmptyState icon="🔍" text={`没有找到「${search}」`} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.map((student, index) => (
              <div
                key={student.id}
                onClick={() => setDetailStudent(student)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '12px',
                  gap: '12px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <Avatar avatar={student.avatar} seed={student.id} size={44} rounded />
                  {index < 3 && (
                    <span
                      style={{
                        position: 'absolute',
                        left: -4,
                        top: -4,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32',
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #fff',
                      }}
                    >
                      {index + 1}
                    </span>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {student.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                    总积分 {student.stats.totalScore} | 出勤 {student.stats.sessionsAttended}次
                    {student.inventory.length > 0 && ` | 🎒×${student.inventory.length}`}
                  </div>
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
                    whiteSpace: 'nowrap',
                  }}
                >
                  Lv.{student.stats.currentLevel} {student.stats.currentRank}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    openEdit(student)
                  }}
                  aria-label="编辑"
                  style={{ padding: '6px 10px', borderRadius: '8px', backgroundColor: '#E8EFF9', color: '#5B8DEF', fontSize: '13px', flexShrink: 0 }}
                >
                  ✏️
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeletingStudent(student)
                  }}
                  aria-label="删除"
                  style={{ padding: '6px 10px', borderRadius: '8px', backgroundColor: '#FFEBEE', color: '#F44336', fontSize: '13px', flexShrink: 0 }}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 添加学生弹窗（含形象设置） */}
      {showAddModal && (
        <Modal
          title="➕ 添加学生"
          onClose={() => setShowAddModal(false)}
          maxWidth={560}
          footer={
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowAddModal(false)} style={{ ...styles.ghostBtn, flex: 1 }}>
                取消
              </button>
              <button onClick={handleAddStudent} style={{ ...styles.primaryBtn, flex: 2, backgroundColor: '#4CAF50' }}>
                ✅ 确认添加
              </button>
            </div>
          }
        >
          <div style={{ marginBottom: '16px' }}>
            <label style={styles.label}>学生姓名：</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="输入姓名"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddStudent()
              }}
              style={styles.input}
            />
          </div>
          <label style={styles.label}>人物形象：</label>
          <AvatarBuilder value={newAvatar} seed={newName || 'new'} onChange={setNewAvatar} size={120} />
        </Modal>
      )}

      {/* 编辑学生弹窗（含形象设置） */}
      {editingStudent && (
        <Modal
          title="✏️ 编辑学生"
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

      {/* 学生详情弹窗 */}
      {detailStudent && (
        <StudentDetail
          student={detailStudent}
          onClose={() => setDetailStudent(null)}
          onEdit={() => {
            const s = detailStudent
            setDetailStudent(null)
            openEdit(s)
          }}
        />
      )}

      {/* 删除确认 */}
      {deletingStudent && (
        <Modal
          title="🗑️ 删除学生"
          onClose={() => setDeletingStudent(null)}
          maxWidth={420}
        >
          <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#555' }}>
            确定要删除「{deletingStudent.name}」吗？
            <br />
            <span style={{ color: '#F44336', fontWeight: 'bold' }}>
              该学生的所有数据（积分、道具、形象）将被永久删除！
            </span>
          </p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={() => setDeletingStudent(null)} style={{ ...styles.ghostBtn, flex: 1 }}>
              取消
            </button>
            <button
              onClick={() => handleDeleteStudent(deletingStudent)}
              style={{ ...styles.dangerBtn, flex: 2 }}
            >
              确认删除
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ---------------------------- 学生详情 ---------------------------- */

function StudentDetail({
  student,
  onClose,
  onEdit,
}: {
  student: StudentRecord
  onClose: () => void
  onEdit: () => void
}) {
  // 该生在各班级的本学期积分（与总积分为两套数据）
  const classBreakdown = useMemo(() => {
    const classes = loadClasses()
    return classes
      .filter((c) => c.studentIds.includes(student.id))
      .map((c) => {
        const fromMap = c.scores && Object.prototype.hasOwnProperty.call(c.scores, student.id)
          ? c.scores[student.id]
          : null
        const fromHistory = (student.semesterHistory || [])
          .filter((h) => !c.semester || h.semester === c.semester)
          .reduce((sum, h) => sum + (h.score || 0), 0)
        return {
          id: c.id,
          name: c.name,
          semester: c.semester,
          score: fromMap !== null ? fromMap : fromHistory,
          sessions: c.attendance?.[student.id] ?? (fromMap !== null ? 0 : undefined),
        }
      })
  }, [student])

  const categories = [
    { label: '🔤 绕口令', key: 'tongueTwister' as const },
    { label: '📖 朗诵', key: 'recitation' as const },
    { label: '💡 即兴', key: 'impromptu' as const },
    { label: '🎭 模仿', key: 'imitation' as const },
  ]

  return (
    <Modal title="学生档案" onClose={onClose} maxWidth={560}>
      <div style={{ textAlign: 'center', marginBottom: '18px' }}>
        <div style={{ display: 'inline-block' }}>
          <Avatar avatar={student.avatar} seed={student.id} size={96} rounded />
        </div>
        <h2 style={{ fontSize: '21px', marginTop: '8px' }}>{student.name}</h2>
        <span
          style={{
            display: 'inline-block',
            padding: '4px 14px',
            borderRadius: '12px',
            backgroundColor: rankColor(student.stats.currentRank) + '33',
            color: rankColor(student.stats.currentRank),
            fontWeight: 'bold',
            fontSize: '13px',
            marginTop: '4px',
          }}
        >
          Lv.{student.stats.currentLevel} {student.stats.currentRank}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px' }}>
        <div style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#5B8DEF' }}>{student.stats.totalScore}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>累计总积分</div>
        </div>
        <div style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4CAF50' }}>{student.stats.sessionsAttended}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>累计出勤</div>
        </div>
      </div>

      {classBreakdown.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ marginBottom: '8px', fontSize: '14px' }}>🏫 各班本学期积分</h4>
          {classBreakdown.map((c) => (
            <div
              key={c.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 12px',
                backgroundColor: '#EAF1FF',
                borderRadius: '8px',
                marginBottom: '4px',
                fontSize: '13px',
              }}
            >
              <span>
                {c.name}
                <span style={{ color: '#999', marginLeft: '6px', fontSize: '12px' }}>{c.semester}</span>
              </span>
              <span style={{ fontWeight: 'bold', color: '#5B8DEF' }}>
                {c.score}分{c.sessions !== undefined ? ` · 出勤${c.sessions}次` : ''}
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ marginBottom: '8px', fontSize: '14px' }}>📊 题型统计</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', fontSize: '11px' }}>
          {categories.map((item) => {
            const cs = student.stats.categoryStats[item.key]
            return (
              <div key={item.key} style={{ padding: '8px', backgroundColor: '#f9f9f9', borderRadius: '8px', textAlign: 'center' }}>
                <div>{item.label}</div>
                <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{cs.completed}次</div>
                <div style={{ color: '#666' }}>均分{cs.avgScore}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ marginBottom: '8px', fontSize: '14px' }}>
          🎒 道具背包 ({student.inventory.length}件)
        </h4>
        {student.inventory.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999', padding: '12px', fontSize: '13px' }}>暂无道具</div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {student.inventory.map((item: any, i: number) => (
              <div
                key={i}
                style={{
                  padding: '6px 10px',
                  backgroundColor: '#FFF8E1',
                  borderRadius: '8px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>{item.icon}</span>
                <span style={{ fontWeight: 'bold' }}>{item.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {student.semesterHistory.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ marginBottom: '8px', fontSize: '14px' }}>📅 学期记录</h4>
          {student.semesterHistory.map((h, i) => (
            <div
              key={i}
              style={{
                padding: '8px 12px',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px',
                marginBottom: '4px',
                fontSize: '13px',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>{h.semester}</span>
              <span>
                {h.sessions}节课 | 积分+{h.score}
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={onClose} style={{ ...styles.ghostBtn, flex: 1 }}>
          关闭
        </button>
        <button onClick={onEdit} style={{ ...styles.primaryBtn, flex: 1 }}>
          ✏️ 编辑形象
        </button>
      </div>
    </Modal>
  )
}
