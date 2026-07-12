import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const TEAM_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
const TEAM_ICONS = ['🦁', '🦅', '🐉', '🐺', '🦈']
const TEAM_NAMES = ['狮子队', '飞鹰队', '神龙队', '战狼队', '鲨鱼队']

export default function GroupingPage() {
  const { classId } = useParams<{ classId: string }>()
  const navigate = useNavigate()
  const [classData, setClassData] = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  const [gameMode, setGameMode] = useState<'individual' | 'team'>('individual')
  const [teamCount, setTeamCount] = useState(2)
  const [teams, setTeams] = useState<any[]>([])
  const [unassigned, setUnassigned] = useState<any[]>([])
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(1)

  useEffect(() => {
    const stored = localStorage.getItem('speech_classes')
    const checkinData = localStorage.getItem('speech_current_checkin')
    if (stored && checkinData) {
      const classes = JSON.parse(stored)
      const found = classes.find((c: any) => c.id === classId)
      if (found) {
        setClassData(found)
        const { studentIds } = JSON.parse(checkinData)
        const checkedIn = found.students.filter((s: any) => studentIds.includes(s.id))
        setStudents(checkedIn)
        setUnassigned([...checkedIn])
        randomGroup(checkedIn, 2)
      }
    }
  }, [classId])

  const randomGroup = (studentList: any[], count: number) => {
    const shuffled = [...studentList].sort(() => Math.random() - 0.5)
    const newTeams = []
    const baseSize = Math.floor(shuffled.length / count)
    const remainder = shuffled.length % count
    let idx = 0
    for (let i = 0; i < count; i++) {
      const size = baseSize + (i < remainder ? 1 : 0)
      newTeams.push({
        id: `team_${i}`,
        name: TEAM_NAMES[i],
        color: TEAM_COLORS[i],
        icon: TEAM_ICONS[i],
        members: shuffled.slice(idx, idx + size),
      })
      idx += size
    }
    setTeams(newTeams)
    setUnassigned([])
    setTeamCount(count)
  }

  const handleStartGame = () => {
    if (gameMode === 'individual') {
      localStorage.setItem('speech_current_game_config', JSON.stringify({
        classId,
        gameMode: 'individual',
        participants: students.map(s => s.id),
        teams: null,
        difficulty,
      }))
    } else {
      if (unassigned.length > 0) {
        alert('还有学生未分配队伍')
        return
      }
      localStorage.setItem('speech_current_game_config', JSON.stringify({
        classId,
        gameMode: 'team',
        participants: students.map(s => s.id),
        teams: teams.map(t => ({
          ...t,
          memberIds: t.members.map((m: any) => m.id),
        })),
        difficulty,
      }))
    }
    navigate(`/game/${classId}`)
  }

  const moveToTeam = (student: any, teamId: string) => {
    const newTeams = teams.map(t => {
      if (t.id === teamId) {
        return { ...t, members: [...t.members, student] }
      }
      return { ...t, members: t.members.filter((m: any) => m.id !== student.id) }
    })
    setTeams(newTeams)
    setUnassigned(unassigned.filter(s => s.id !== student.id))
  }

  const moveToUnassigned = (student: any, teamId: string) => {
    const newTeams = teams.map(t => {
      if (t.id === teamId) {
        return { ...t, members: t.members.filter((m: any) => m.id !== student.id) }
      }
      return t
    })
    setTeams(newTeams)
    setUnassigned([...unassigned, student])
  }

  if (!classData) {
    return <div style={{ textAlign: 'center', padding: '100px 20px', color: '#999' }}>加载中...</div>
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button onClick={() => navigate(`/checkin/${classId}`)} style={{
          fontSize: '24px', background: 'none', minWidth: '44px', minHeight: '44px',
        }}>←</button>
        <h2 style={{ fontSize: '24px', marginLeft: '8px' }}>👥 分组设置</h2>
      </div>

      {/* 游戏模式选择 */}
      <div style={{
        backgroundColor: '#fff', borderRadius: '16px', padding: '20px',
        marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        <h3 style={{ marginBottom: '16px' }}>游戏模式</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setGameMode('individual')} style={{
            flex: 1, padding: '16px', borderRadius: '12px', fontSize: '16px',
            backgroundColor: gameMode === 'individual' ? '#5B8DEF' : '#f5f5f5',
            color: gameMode === 'individual' ? '#fff' : '#333',
            fontWeight: 'bold', border: gameMode === 'individual' ? 'none' : '2px solid #E0E0E0',
          }}>🏃 个人战</button>
          <button onClick={() => { setGameMode('team'); randomGroup(students, teamCount) }} style={{
            flex: 1, padding: '16px', borderRadius: '12px', fontSize: '16px',
            backgroundColor: gameMode === 'team' ? '#5B8DEF' : '#f5f5f5',
            color: gameMode === 'team' ? '#fff' : '#333',
            fontWeight: 'bold', border: gameMode === 'team' ? 'none' : '2px solid #E0E0E0',
          }}>🤝 团队战</button>
        </div>
      </div>

      {/* 难度选择 */}
      <div style={{
        backgroundColor: '#fff', borderRadius: '16px', padding: '20px',
        marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        <h3 style={{ marginBottom: '12px' }}>⭐ 难度选择</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
          选择难度会影响题库抽取范围，初级只抽初级题，中级抽初级+中级，高级抽全部
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          {[
            { level: 1, label: '⭐ 初级', desc: '适合新手', color: '#4CAF50' },
            { level: 2, label: '⭐⭐ 中级', desc: '适合进阶', color: '#FF9800' },
            { level: 3, label: '⭐⭐⭐ 高级', desc: '适合高手', color: '#F44336' },
          ].map(item => (
            <button key={item.level} onClick={() => setDifficulty(item.level as 1 | 2 | 3)} style={{
              flex: 1, padding: '14px', borderRadius: '12px', fontSize: '15px',
              backgroundColor: difficulty === item.level ? item.color : '#f5f5f5',
              color: difficulty === item.level ? '#fff' : '#333',
              fontWeight: 'bold',
              border: difficulty === item.level ? 'none' : '2px solid #E0E0E0',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            }}>
              <span>{item.label}</span>
              <span style={{ fontSize: '11px', fontWeight: 'normal', opacity: 0.8 }}>{item.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 团队模式设置 */}
      {gameMode === 'team' && (
        <>
          <div style={{
            backgroundColor: '#fff', borderRadius: '16px', padding: '20px',
            marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold' }}>队伍数量：</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[2, 3, 4].map(n => (
                  <button key={n} onClick={() => randomGroup(students, n)} style={{
                    padding: '8px 16px', borderRadius: '10px', fontSize: '16px',
                    backgroundColor: teamCount === n ? '#5B8DEF' : '#f5f5f5',
                    color: teamCount === n ? '#fff' : '#333', fontWeight: 'bold',
                  }}>{n}队</button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${teamCount}, 1fr)`, gap: '12px', marginBottom: '20px' }}>
            {teams.map(team => (
              <div key={team.id} style={{
                backgroundColor: '#fff', borderRadius: '16px', padding: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                borderTop: `4px solid ${team.color}`,
              }}>
                <div style={{ textAlign: 'center', marginBottom: '12px', fontSize: '18px', fontWeight: 'bold' }}>
                  {team.icon} {team.name}
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px', textAlign: 'center' }}>
                  {team.members.length}人
                </div>
                {team.members.map((member: any) => (
                  <div key={member.id} onClick={() => moveToUnassigned(member, team.id)} style={{
                    padding: '8px 12px', marginBottom: '6px', backgroundColor: '#f9f9f9',
                    borderRadius: '8px', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', fontSize: '15px',
                  }}>
                    <span style={{ marginRight: '6px' }}>{member.emoji}</span>
                    {member.name}
                  </div>
                ))}
                {team.members.length === 0 && (
                  <div style={{ textAlign: 'center', color: '#ccc', padding: '20px', fontSize: '14px' }}>
                    拖拽学生到这里
                  </div>
                )}
              </div>
            ))}
          </div>

          {unassigned.length > 0 && (
            <div style={{
              backgroundColor: '#fff', borderRadius: '16px', padding: '20px',
              marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '2px dashed #FF9800',
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#FF9800' }}>
                ⚠️ 未分配学生（点击可分配到队伍）：
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {unassigned.map(student => (
                  <div key={student.id} style={{
                    padding: '8px 14px', backgroundColor: '#FFF3E0',
                    borderRadius: '20px', display: 'flex', alignItems: 'center',
                    gap: '4px', fontSize: '15px',
                  }}>
                    <span>{student.emoji}</span>
                    {student.name}
                    <select onChange={(e) => { if (e.target.value) moveToTeam(student, e.target.value) }}
                      style={{ marginLeft: '4px', fontSize: '12px', borderRadius: '4px', border: '1px solid #ccc' }}>
                      <option value="">分配→</option>
                      {teams.map(t => (
                        <option key={t.id} value={t.id}>{t.icon} {t.name}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* 开始游戏按钮 */}
      <button onClick={handleStartGame} style={{
        width: '100%', padding: '18px', borderRadius: '16px', fontSize: '20px',
        backgroundColor: '#4CAF50', color: '#fff', fontWeight: 'bold',
        boxShadow: '0 4px 12px rgba(76,175,80,0.3)',
      }}>
        🎮 开始游戏！
      </button>
    </div>
  )
}