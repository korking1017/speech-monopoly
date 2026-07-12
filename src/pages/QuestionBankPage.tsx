import { useState } from 'react'
import { questionBank } from '../data/questions'
import type { Question } from '../data/questions'

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState(questionBank)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newQuestion, setNewQuestion] = useState({
    type: 'tongue_twister', title: '', content: '', difficulty: 1, timeLimit: 30, tags: '',
  })

  const allTypes = [
    { key: 'tongue_twister', label: '🔤 绕口令' },
    { key: 'recitation', label: '📖 朗诵' },
    { key: 'impromptu', label: '💡 即兴演讲' },
    { key: 'imitation', label: '🎭 模仿秀' },
    { key: 'teamwork', label: '🤝 团队协作' },
  ]

  let totalCount = 0
  Object.values(questions).forEach(arr => { totalCount += arr.length })

  const handleAddQuestion = () => {
    if (!newQuestion.title.trim() || !newQuestion.content.trim()) {
      alert('请填写题目名称和内容！')
      return
    }

    const q: Question = {
      id: 'custom_' + Date.now(),
      type: newQuestion.type as any,
      title: newQuestion.title,
      content: newQuestion.content,
      difficulty: newQuestion.difficulty as 1 | 2 | 3,
      timeLimit: newQuestion.timeLimit,
      tags: newQuestion.tags.split(',').map(t => t.trim()).filter(t => t),
    }

    const key = newQuestion.type
    const updated = { ...questions, [key]: [...(questions[key] || []), q] }
    setQuestions(updated)
    ;(questionBank as any)[key] = updated[key]

    setNewQuestion({ type: 'tongue_twister', title: '', content: '', difficulty: 1, timeLimit: 30, tags: '' })
    setShowAddModal(false)
  }

  const handleDeleteQuestion = (type: string, id: string) => {
    if (!confirm('确定删除这道题目吗？')) return
    const updated = { ...questions, [type]: questions[type].filter(q => q.id !== id) }
    setQuestions(updated)
    ;(questionBank as any)[type] = updated[type]
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button onClick={() => window.history.back()} style={{ fontSize: '24px', background: 'none', minWidth: '44px', minHeight: '44px' }}>←</button>
          <h2 style={{ marginLeft: '8px' }}>📚 题库管理</h2>
        </div>
        <button onClick={() => setShowAddModal(true)} style={{
          padding: '10px 20px', borderRadius: '12px', backgroundColor: '#4CAF50', color: '#fff',
          fontWeight: 'bold', fontSize: '15px',
        }}>+ 新增题目</button>
      </div>

      <div style={{
        backgroundColor: '#fff', borderRadius: '16px', padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '16px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>📚</div>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#5B8DEF' }}>共 {totalCount} 题</div>
      </div>

      {allTypes.map(type => {
        const qs = questions[type.key] || []
        return (
          <div key={type.key} style={{
            backgroundColor: '#fff', borderRadius: '16px', padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '12px',
          }}>
            <h3 style={{ marginBottom: '12px' }}>{type.label}（{qs.length}题）</h3>
            <div style={{ maxHeight: '250px', overflow: 'auto' }}>
              {qs.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#ccc', padding: '20px' }}>暂无题目</div>
              ) : (
                qs.map(q => (
                  <div key={q.id} style={{
                    padding: '10px', marginBottom: '6px', backgroundColor: '#f9f9f9',
                    borderRadius: '8px', fontSize: '14px', display: 'flex',
                    alignItems: 'flex-start', gap: '10px',
                  }}>
                    <div style={{ flex: 1 }}>
                      <span style={{
                        display: 'inline-block', padding: '2px 8px', borderRadius: '10px',
                        backgroundColor: q.difficulty === 1 ? '#E8F5E9' : q.difficulty === 2 ? '#FFF3E0' : '#FFEBEE',
                        color: q.difficulty === 1 ? '#4CAF50' : q.difficulty === 2 ? '#FF9800' : '#F44336',
                        fontSize: '12px', fontWeight: 'bold', marginRight: '8px',
                      }}>
                        {q.difficulty === 1 ? '初级' : q.difficulty === 2 ? '中级' : '高级'}
                      </span>
                      <strong>{q.title}</strong>
                      <div style={{ color: '#666', marginTop: '4px', fontSize: '13px' }}>{q.content}</div>
                      <div style={{ color: '#999', fontSize: '11px', marginTop: '2px' }}>
                        ⏱️ {q.timeLimit}秒 | 标签：{q.tags?.join(', ') || '无'}
                      </div>
                    </div>
                    <button onClick={() => handleDeleteQuestion(type.key, q.id)} style={{
                      padding: '4px 10px', borderRadius: '6px', backgroundColor: '#FFEBEE',
                      color: '#F44336', fontSize: '12px', flexShrink: 0,
                    }}>删除</button>
                  </div>
                ))
              )}
            </div>
          </div>
        )
      })}

      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }} onClick={() => setShowAddModal(false)}>
          <div style={{
            backgroundColor: '#fff', borderRadius: '20px', padding: '24px',
            width: '90%', maxWidth: '550px', maxHeight: '85vh', overflow: 'auto',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '16px' }}>✏️ 新增题目</h3>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' }}>题目类型</label>
              <select value={newQuestion.type} onChange={e => setNewQuestion({ ...newQuestion, type: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #E0E0E0', fontSize: '15px' }}>
                {allTypes.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' }}>难度</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3].map(d => (
                  <button key={d} onClick={() => setNewQuestion({ ...newQuestion, difficulty: d })} style={{
                    flex: 1, padding: '10px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold',
                    backgroundColor: newQuestion.difficulty === d ? '#5B8DEF' : '#f5f5f5',
                    color: newQuestion.difficulty === d ? '#fff' : '#333',
                    border: newQuestion.difficulty === d ? 'none' : '2px solid #E0E0E0',
                  }}>{d === 1 ? '⭐ 初级' : d === 2 ? '⭐⭐ 中级' : '⭐⭐⭐ 高级'}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' }}>题目名称</label>
              <input type="text" value={newQuestion.title}
                onChange={e => setNewQuestion({ ...newQuestion, title: e.target.value })}
                placeholder="例如：四是四，十是十"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #E0E0E0', fontSize: '15px' }} />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' }}>题目内容</label>
              <textarea value={newQuestion.content}
                onChange={e => setNewQuestion({ ...newQuestion, content: e.target.value })}
                placeholder="输入完整题目内容..." rows={4}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #E0E0E0', fontSize: '15px', resize: 'vertical' }} />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' }}>时间限制（秒）</label>
              <input type="number" value={newQuestion.timeLimit}
                onChange={e => setNewQuestion({ ...newQuestion, timeLimit: parseInt(e.target.value) || 30 })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #E0E0E0', fontSize: '15px' }} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' }}>标签（用逗号分隔）</label>
              <input type="text" value={newQuestion.tags}
                onChange={e => setNewQuestion({ ...newQuestion, tags: e.target.value })}
                placeholder="例如：发音, 数字"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #E0E0E0', fontSize: '15px' }} />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowAddModal(false)} style={{
                flex: 1, padding: '12px', borderRadius: '10px',
                backgroundColor: '#f5f5f5', color: '#666', fontSize: '15px',
              }}>取消</button>
              <button onClick={handleAddQuestion} style={{
                flex: 2, padding: '12px', borderRadius: '10px',
                backgroundColor: '#4CAF50', color: '#fff', fontSize: '15px', fontWeight: 'bold',
              }}>✅ 保存题目</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}