import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const RANK_COLORS: Record<string, string> = {
  '口语新星': '#B0BEC5',
  '表达达人': '#4CAF50',
  '演讲精英': '#2196F3',
  '口才大师': '#9C27B0',
  '语言传奇': '#FFD700',
}

export default function ReportPage() {
  const { classId } = useParams<{ classId: string }>()
  const navigate = useNavigate()
  const [classData, setClassData] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem('speech_classes')
    if (stored) {
      const classes = JSON.parse(stored)
      const found = classes.find((c: any) => c.id === classId)
      if (found) setClassData(found)
    }
  }, [classId])

  if (!classData) {
    return <div style={{ textAlign: 'center', padding: '100px 20px', color: '#999' }}>加载中...</div>
  }

  // 按积分排序
  const sortedStudents = [...classData.students].sort(
    (a, b) => b.stats.totalScore - a.stats.totalScore
  )

  // 统计数据
  const totalScore = classData.students.reduce((sum: number, s: any) => sum + s.stats.totalScore, 0)
  const totalAttendance = classData.students.reduce((sum: number, s: any) => sum + s.stats.sessionsAttended, 0)
  const avgScore = classData.students.length > 0 ? Math.round(totalScore / classData.students.length) : 0

  // 找出最高分学生
  const topStudent = sortedStudents.length > 0 ? sortedStudents[0] : null

  // 找出全勤学生
  const fullAttendanceStudents = classData.students.filter(
    (s: any) => s.stats.sessionsAttended === classData.totalSessions && classData.totalSessions > 0
  )

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      {/* 顶部 */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={() => navigate(`/class/${classId}`)} style={{
          fontSize: '24px', background: 'none', minWidth: '44px', minHeight: '44px',
        }}>←</button>
        <h2 style={{ fontSize: '22px', marginLeft: '8px' }}>📊 学期报告 - {classData.name}</h2>
      </div>

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
          <div style={{ fontSize: '13px', color: '#666' }}>全班总积分</div>
        </div>
        <div style={{
          backgroundColor: '#fff', borderRadius: '16px', padding: '20px',
          textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#FF9800' }}>{avgScore}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>人均积分</div>
        </div>
      </div>

      {/* 冠军展示 */}
      {topStudent && topStudent.stats.totalScore > 0 && (
        <div style={{
          backgroundColor: '#FFF8E1', borderRadius: '16px', padding: '20px',
          marginBottom: '20px', textAlign: 'center',
          border: '2px solid #FFD700', boxShadow: '0 2px 12px rgba(255,215,0,0.2)',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🏆</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#FF9800' }}>
            积分冠军：{topStudent.emoji} {topStudent.name}
          </div>
          <div style={{ fontSize: '16px', color: '#666', marginTop: '4px' }}>
            总积分：{topStudent.stats.totalScore} | Lv.{topStudent.stats.currentLevel} {topStudent.stats.currentRank}
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
                padding: '6px 14px', backgroundColor: '#fff',
                borderRadius: '20px', fontSize: '14px',
              }}>{s.emoji} {s.name}</span>
            ))}
          </div>
        </div>
      )}

      {/* 积分排行榜 */}
      <div style={{
        backgroundColor: '#fff', borderRadius: '16px', padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '20px',
      }}>
        <h3 style={{ marginBottom: '16px' }}>🏅 积分排行榜</h3>
        {sortedStudents.length === 0 ? (
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
                <span style={{ fontSize: '24px' }}>{student.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{student.name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    出勤 {student.stats.sessionsAttended} 次
                    {student.stats.winCount > 0 && ` | 获胜 ${student.stats.winCount} 次`}
                    {student.stats.mvpCount > 0 && ` | MVP ${student.stats.mvpCount} 次`}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#5B8DEF' }}>
                    {student.stats.totalScore}
                  </div>
                  <div style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
                    backgroundColor: RANK_COLORS[student.stats.currentRank] + '33',
                    color: RANK_COLORS[student.stats.currentRank],
                    fontWeight: 'bold',
                  }}>
                    Lv.{student.stats.currentLevel} {student.stats.currentRank}
                  </div>
                </div>
                {student.inventory && student.inventory.length > 0 && (
                  <span style={{ fontSize: '13px', color: '#5B8DEF' }}>
                    🎒×{student.inventory.length}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 学生详细统计 */}
      {sortedStudents.length > 0 && (
        <div style={{
          backgroundColor: '#fff', borderRadius: '16px', padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <h3 style={{ marginBottom: '16px' }}>📈 个人数据详情</h3>
          {sortedStudents.map((student: any) => {
            const cs = student.stats.categoryStats
            return (
              <div key={student.id} style={{
                padding: '14px', marginBottom: '10px', backgroundColor: '#f9f9f9',
                borderRadius: '12px',
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '8px' }}>
                  {student.emoji} {student.name}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '12px' }}>
                  <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#fff', borderRadius: '8px' }}>
                    <div style={{ color: '#FF9800', fontWeight: 'bold' }}>🔤 绕口令</div>
                    <div>{cs.tongueTwister.completed}次 | 均分{cs.tongueTwister.avgScore}</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#fff', borderRadius: '8px' }}>
                    <div style={{ color: '#2196F3', fontWeight: 'bold' }}>📖 朗诵</div>
                    <div>{cs.recitation.completed}次 | 均分{cs.recitation.avgScore}</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#fff', borderRadius: '8px' }}>
                    <div style={{ color: '#9C27B0', fontWeight: 'bold' }}>💡 即兴</div>
                    <div>{cs.impromptu.completed}次 | 均分{cs.impromptu.avgScore}</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#fff', borderRadius: '8px' }}>
                    <div style={{ color: '#E91E63', fontWeight: 'bold' }}>🎭 模仿</div>
                    <div>{cs.imitation.completed}次 | 均分{cs.imitation.avgScore}</div>
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