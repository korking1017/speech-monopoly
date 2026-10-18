import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { ClassRecord, StudentRecord } from '../types'
import { rankColor } from '../types'
import { loadClasses, loadStudents, getClassScore, getClassAttendance, getClassTotalScore } from '../utils/storage'
import Avatar from '../components/Avatar'
import { PageHeader } from '../components/UI'

export default function ReportPage() {
  const { classId } = useParams<{ classId: string }>()
  const navigate = useNavigate()
  const [classData, setClassData] = useState<ClassRecord | null>(null)
  const [students, setStudents] = useState<any[]>([])

  useEffect(() => {
    const classes = loadClasses()
    const found = classes.find((c) => c.id === classId) || null
    setClassData(found)
    if (!found) return

    const lib = loadStudents()
    const list = found.studentIds
      .map((sid) => lib.find((s) => s.id === sid))
      .filter((s): s is StudentRecord => Boolean(s))
    setStudents(list.length > 0 ? list : found.students || [])
  }, [classId])

  if (!classData) {
    return <div style={{ textAlign: 'center', padding: '100px 20px', color: '#999' }}>加载中...</div>
  }

  // 以「本学期积分」排序（这是本班报告的主指标）
  const sortedStudents = [...students].sort(
    (a, b) => getClassScore(classData, b.id, b) - getClassScore(classData, a.id, a),
  )

  const totalScore = getClassTotalScore(classData, students)
  const avgScore = students.length > 0 ? Math.round(totalScore / students.length) : 0

  const topStudent = sortedStudents.length > 0 ? sortedStudents[0] : null
  // 全勤：本班出勤次数达到本班总课时
  const fullAttendanceStudents = students.filter(
    (s: any) =>
      getClassAttendance(classData, s.id, s) >= (classData?.totalSessions || 0) &&
      (classData?.totalSessions || 0) > 0,
  )

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <PageHeader title={`📊 学期报告 · ${classData.name}`} onBack={() => navigate(`/class/${classId}`)} />

      <p style={{ fontSize: '12px', color: '#999', marginBottom: '14px', lineHeight: 1.6 }}>
        本报告的积分均为<strong>本学期积分</strong>（本班创建后累计），与学生管理中心的累计总积分分开统计。
      </p>

      {/* 概览卡片 */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px',
        marginBottom: '20px',
      }}>
        <div style={{
          backgroundColor: '#fff', borderRadius: '16px', padding: '20px',
          textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#5B8DEF' }}>{classData.totalSessions}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>总课时</div>
        </div>
        <div style={{
          backgroundColor: '#fff', borderRadius: '16px', padding: '20px',
          textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4CAF50' }}>{totalScore}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>本学期总积分</div>
        </div>
        <div style={{
          backgroundColor: '#fff', borderRadius: '16px', padding: '20px',
          textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#FF9800' }}>{avgScore}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>人均本学期积分</div>
        </div>
      </div>

      {/* 冠军展示 */}
      {topStudent && getClassScore(classData, topStudent.id, topStudent) > 0 && (
        <div style={{
          backgroundColor: '#FFF8E1', borderRadius: '16px', padding: '20px',
          marginBottom: '20px', textAlign: 'center',
          border: '2px solid #FFD700', boxShadow: '0 2px 12px rgba(255,215,0,0.2)',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🏆</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#FF9800' }}>
            本学期积分冠军：{topStudent.name}
          </div>
          <div style={{ fontSize: '16px', color: '#666', marginTop: '4px' }}>
            本学期积分：{getClassScore(classData, topStudent.id, topStudent)} | Lv.{topStudent.stats?.currentLevel || 1} {topStudent.stats?.currentRank || '口语新星'}
          </div>
        </div>
      )}

      {/* 全勤表彰 */}
      {fullAttendanceStudents.length > 0 && (
        <div style={{
          backgroundColor: '#E8F5E9', borderRadius: '16px', padding: '20px',
          marginBottom: '20px', border: '2px solid #4CAF50',
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#4CAF50' }}>
            🌟 全勤之星（{fullAttendanceStudents.length}人）
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {fullAttendanceStudents.map((s: any) => (
              <span key={s.id} style={{
                padding: '4px 12px 4px 4px', backgroundColor: '#fff',
                borderRadius: '20px', fontSize: '14px',
                display: 'inline-flex', alignItems: 'center', gap: '6px',
              }}>
                <Avatar avatar={s.avatar} seed={s.id} size={26} rounded />
                {s.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 积分排行榜 */}
      <div style={{
        backgroundColor: '#fff', borderRadius: '16px', padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '20px',
      }}>
        <h3 style={{ marginBottom: '16px' }}>🏅 本学期积分排行榜</h3>
        {students.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999', padding: '30px' }}>暂无数据</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sortedStudents.map((student: any, index: number) => (
              <div key={student.id} style={{
                display: 'flex', alignItems: 'center', padding: '12px 16px',
                backgroundColor: index === 0 ? '#FFF8E1' : '#f9f9f9',
                borderRadius: '12px', gap: '12px',
                border: index === 0 ? '2px solid #FFD700' : 'none',
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#f5f5f5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'bold', fontSize: '14px', color: index < 3 ? '#fff' : '#666',
                  flexShrink: 0,
                }}>
                  {index + 1}
                </div>
                <Avatar avatar={student.avatar} seed={student.id} size={38} rounded />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{student.name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    本班出勤 {getClassAttendance(classData, student.id, student)} 次 | 累计总积分 {student.stats?.totalScore || 0}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#5B8DEF' }}>
                    {getClassScore(classData, student.id, student)}
                  </div>
                  <div style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
                    backgroundColor: rankColor(student.stats?.currentRank) + '33',
                    color: rankColor(student.stats?.currentRank),
                    fontWeight: 'bold',
                  }}>
                    Lv.{student.stats?.currentLevel || 1} {student.stats?.currentRank || '口语新星'}
                  </div>
                </div>
                {(student.inventory && student.inventory.length > 0) && (
                  <span style={{ fontSize: '13px', color: '#5B8DEF' }}>
                    🎒×{student.inventory.length}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 个人数据详情 */}
      {students.length > 0 && (
        <div style={{
          backgroundColor: '#fff', borderRadius: '16px', padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <h3 style={{ marginBottom: '16px' }}>📈 个人数据详情</h3>
          {sortedStudents.map((student: any) => {
            const cs = student.stats?.categoryStats || {}
            return (
              <div key={student.id} style={{
                padding: '14px', marginBottom: '10px', backgroundColor: '#f9f9f9',
                borderRadius: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '15px', marginBottom: '8px' }}>
                  <Avatar avatar={student.avatar} seed={student.id} size={28} rounded />
                  {student.name}
                  <span style={{ marginLeft: 'auto', color: '#4CAF50', fontSize: '14px' }}>
                    本学期 {getClassScore(classData, student.id, student)} 分
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '12px' }}>
                  <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#fff', borderRadius: '8px' }}>
                    <div style={{ color: '#FF9800', fontWeight: 'bold' }}>🔤 绕口令</div>
                    <div>{cs.tongueTwister?.completed || 0}次 | 均分{cs.tongueTwister?.avgScore || 0}</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#fff', borderRadius: '8px' }}>
                    <div style={{ color: '#2196F3', fontWeight: 'bold' }}>📖 朗诵</div>
                    <div>{cs.recitation?.completed || 0}次 | 均分{cs.recitation?.avgScore || 0}</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#fff', borderRadius: '8px' }}>
                    <div style={{ color: '#9C27B0', fontWeight: 'bold' }}>💡 即兴</div>
                    <div>{cs.impromptu?.completed || 0}次 | 均分{cs.impromptu?.avgScore || 0}</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#fff', borderRadius: '8px' }}>
                    <div style={{ color: '#E91E63', fontWeight: 'bold' }}>🎭 模仿</div>
                    <div>{cs.imitation?.completed || 0}次 | 均分{cs.imitation?.avgScore || 0}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}