// 系统设置
// 提供班级管理、数据备份/恢复（换设备或误删时非常有用）。

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ClassRecord, StudentRecord } from '../types'
import {
  loadClasses,
  saveClasses,
  loadStudents,
  exportAllData,
  importAllData,
  hasPreUpgradeBackup,
  preUpgradeBackupTime,
  restorePreUpgradeBackup,
} from '../utils/storage'
import { Modal, PageHeader, EmptyState, styles } from '../components/UI'

export default function SettingsPage() {
  const navigate = useNavigate()
  const [classes, setClasses] = useState<ClassRecord[]>([])
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [deletingClass, setDeletingClass] = useState<ClassRecord | null>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [importResult, setImportResult] = useState<string | null>(null)
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false)
  const [hasBackup] = useState(() => hasPreUpgradeBackup())
  const [backupTime] = useState(() => preUpgradeBackupTime())
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setClasses(loadClasses())
    setStudents(loadStudents())
  }, [])

  const handleDeleteClass = (cls: ClassRecord) => {
    const updated = classes.filter((c) => c.id !== cls.id)
    setClasses(updated)
    saveClasses(updated)
    setDeletingClass(null)
  }

  const handleResetAllClasses = () => {
    saveClasses([])
    setClasses([])
    setShowResetConfirm(false)
  }

  /** 导出全部数据为 JSON 文件 */
  const handleExport = () => {
    const data = exportAllData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const stamp = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `口才大富翁备份_${stamp}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  /** 从 JSON 备份恢复 */
  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (!confirm('导入将合并/覆盖当前数据，确定继续吗？\n建议先导出一次当前数据作为备份。')) return
      const result = importAllData(data)
      setImportResult(result.message)
      if (result.ok) {
        setClasses(loadClasses())
        setStudents(loadStudents())
      }
    } catch {
      setImportResult('文件解析失败，请确认选择了正确的备份文件')
    }
  }

  return (
    <div style={styles.page}>
      <PageHeader title="⚙️ 系统设置" onBack={() => navigate('/')} />

      {/* 数据概览 */}
      <div style={styles.card}>
        <h3 style={{ marginBottom: '12px', fontSize: '17px' }}>📊 数据概览</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {[
            { value: students.length, label: '学生', color: '#5B8DEF' },
            { value: classes.length, label: '班级', color: '#4CAF50' },
            {
              value: students.reduce((sum, s) => sum + (s.stats.totalScore || 0), 0),
              label: '累计总积分',
              color: '#FF9800',
            },
          ].map((item) => (
            <div key={item.label} style={{ padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: item.color }}>{item.value}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 备份与恢复 */}
      <div style={styles.card}>
        <h3 style={{ marginBottom: '12px', fontSize: '17px' }}>💾 数据备份与恢复</h3>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '14px', lineHeight: 1.7 }}>
          所有数据保存在本设备的浏览器中。建议定期导出备份，换设备或误删时可快速恢复。
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={handleExport} style={{ ...styles.primaryBtn, backgroundColor: '#4CAF50' }}>
            📤 导出全部数据
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            style={{ ...styles.primaryBtn, backgroundColor: '#5B8DEF' }}
          >
            📥 导入备份恢复
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleImportFile(f)
              e.target.value = ''
            }}
          />
        </div>
        {importResult && (
          <div
            style={{
              marginTop: '12px',
              padding: '10px',
              borderRadius: '10px',
              backgroundColor: '#E8F5E9',
              color: '#4CAF50',
              fontSize: '13px',
              fontWeight: 'bold',
            }}
          >
            {importResult}
          </div>
        )}

        {hasBackup && (
          <div
            style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px dashed #E0E0E0',
            }}
          >
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '10px', lineHeight: 1.7 }}>
              🛡️ 检测到<strong>升级前自动快照</strong>
              {backupTime ? `（${new Date(backupTime).toLocaleString()}）` : ''}
              。如果升级后发现数据异常，可以一键恢复到升级前的状态。
            </div>
            <button
              onClick={() => setShowRestoreConfirm(true)}
              style={{ ...styles.primaryBtn, backgroundColor: '#FF9800' }}
            >
              ↩️ 恢复升级前数据
            </button>
          </div>
        )}
      </div>

      {/* 班级管理 */}
      <div style={styles.card}>
        <h3 style={{ marginBottom: '8px', fontSize: '17px' }}>📚 班级管理</h3>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '14px' }}>
          删除班级不会影响学生档案与累计总积分，学生信息保留在学生管理中心。
        </p>
        {classes.length === 0 ? (
          <EmptyState text="还没有班级" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {classes.map((cls) => (
              <div
                key={cls.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '12px',
                  gap: '10px',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '15px' }}>📚 {cls.name}</div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                    {cls.studentIds.length}名学生 | {cls.semester} | 已上{cls.totalSessions}节课
                  </div>
                </div>
                <button
                  onClick={() => setDeletingClass(cls)}
                  style={{ padding: '8px 14px', borderRadius: '8px', backgroundColor: '#FFEBEE', color: '#F44336', fontWeight: 'bold', fontSize: '13px', flexShrink: 0 }}
                >
                  🗑️ 删除
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 重置 */}
      <div style={styles.card}>
        <h3 style={{ marginBottom: '8px', fontSize: '17px' }}>⚠️ 重置所有班级</h3>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
          删除所有班级数据，学生档案和题库不受影响。
        </p>
        <button onClick={() => setShowResetConfirm(true)} style={styles.dangerBtn}>
          🗑️ 重置所有班级
        </button>
      </div>

      {/* 提示 */}
      <div style={styles.card}>
        <h3 style={{ marginBottom: '12px', fontSize: '17px' }}>💡 提示</h3>
        <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.9 }}>
          • 删除班级：只删除班级，学生数据保留
          <br />
          • 班级内移除学生：只移除关联，学生档案与累计总积分保留
          <br />
          • 学生管理中心删除学生：永久删除该学生数据
          <br />
          • 学生管理中心的积分是<strong>累计总积分</strong>；班级内的积分是<strong>本学期积分</strong>
          <br />• 建议定期使用上方「导出全部数据」备份
        </p>
      </div>

      {deletingClass && (
        <Modal title="🗑️ 删除班级" onClose={() => setDeletingClass(null)} maxWidth={420}>
          <p style={{ fontSize: '15px', lineHeight: 1.8, color: '#555' }}>
            确定要删除「{deletingClass.name}」吗？
            <br />
            <span style={{ color: '#4CAF50' }}>学生档案和累计总积分保留在学生管理中心。</span>
            <br />
            <span style={{ color: '#F44336', fontSize: '13px' }}>该班的本学期积分记录将一并删除。</span>
          </p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={() => setDeletingClass(null)} style={{ ...styles.ghostBtn, flex: 1 }}>
              取消
            </button>
            <button onClick={() => handleDeleteClass(deletingClass)} style={{ ...styles.dangerBtn, flex: 2 }}>
              确认删除
            </button>
          </div>
        </Modal>
      )}

      {showResetConfirm && (
        <Modal title="⚠️ 重置所有班级" onClose={() => setShowResetConfirm(false)} maxWidth={420}>
          <p style={{ fontSize: '15px', lineHeight: 1.8, color: '#555' }}>
            确定要删除所有班级吗？
            <br />
            学生档案和题库不受影响。
            <br />
            <span style={{ color: '#F44336', fontWeight: 'bold' }}>此操作不可恢复！</span>
          </p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={() => setShowResetConfirm(false)} style={{ ...styles.ghostBtn, flex: 1 }}>
              取消
            </button>
            <button onClick={handleResetAllClasses} style={{ ...styles.dangerBtn, flex: 2 }}>
              确认重置
            </button>
          </div>
        </Modal>
      )}

      {showRestoreConfirm && (
        <Modal title="↩️ 恢复升级前数据" onClose={() => setShowRestoreConfirm(false)} maxWidth={440}>
          <p style={{ fontSize: '15px', lineHeight: 1.8, color: '#555' }}>
            将把学生与班级数据还原到<strong>升级前的原始状态</strong>。
            <br />
            升级后新增的学生、积分记录会被覆盖。
            <br />
            <span style={{ color: '#F44336', fontSize: '13px' }}>
              建议先「导出全部数据」备份当前状态。
            </span>
          </p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={() => setShowRestoreConfirm(false)} style={{ ...styles.ghostBtn, flex: 1 }}>
              取消
            </button>
            <button
              onClick={() => {
                const r = restorePreUpgradeBackup()
                setImportResult(r.message)
                setShowRestoreConfirm(false)
                if (r.ok) {
                  setClasses(loadClasses())
                  setStudents(loadStudents())
                }
              }}
              style={{ ...styles.dangerBtn, flex: 2, backgroundColor: '#FF9800', color: '#fff' }}
            >
              确认恢复
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
