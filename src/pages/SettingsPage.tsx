import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SettingsPage() {
  const navigate = useNavigate()
  const [classes, setClasses] = useState<any[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('speech_classes')
    if (stored) setClasses(JSON.parse(stored))
  }, [])

  const handleDeleteClass = (classId: string, className: string) => {
    if (!confirm(`确定要删除「${className}」吗？\n该班级的所有学生数据、积分和道具将被永久删除！`)) return
    const updated = classes.filter(c => c.id !== classId)
    setClasses(updated)
    localStorage.setItem('speech_classes', JSON.stringify(updated))
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={() => navigate('/')} style={{ fontSize: '24px', background: 'none', minWidth: '44px', minHeight: '44px' }}>←</button>
        <h2 style={{ marginLeft: '8px' }}>⚙️ 系统设置</h2>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
        <h3 style={{ marginBottom: '12px' }}>📚 班级管理</h3>
        {classes.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999', padding: '30px' }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>📭</div>
            <p>还没有班级</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {classes.map(cls => (
              <div key={cls.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px', backgroundColor: '#f9f9f9', borderRadius: '12px',
              }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>📚 {cls.name}</div>
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    {cls.students.length}名学生 | {cls.semester} | 已上{cls.totalSessions}节课
                  </div>
                </div>
                <button onClick={() => handleDeleteClass(cls.id, cls.name)} style={{
                  padding: '8px 16px', borderRadius: '8px', backgroundColor: '#FFEBEE',
                  color: '#F44336', fontWeight: 'bold', fontSize: '14px',
                }}>🗑️ 删除</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h3 style={{ marginBottom: '12px' }}>⚠️ 危险操作</h3>
        <button onClick={() => {
          if (confirm('确定清除所有数据吗？\n所有班级、学生、积分和道具将被永久删除！此操作不可恢复！')) {
            localStorage.clear()
            alert('所有数据已清除')
            window.location.href = '/'
          }
        }} style={{ padding: '12px 24px', borderRadius: '10px', backgroundColor: '#F44336', color: '#fff', fontWeight: 'bold' }}>
          🗑️ 清除所有数据
        </button>
      </div>
    </div>
  )
}