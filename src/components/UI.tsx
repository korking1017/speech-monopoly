// 通用 UI 组件
// 把原先散落在各页面的弹窗 / 按钮样式集中管理，减少重复代码。

import type { CSSProperties, ReactNode } from 'react'

/* ------------------------------- 样式常量 ------------------------------- */

export const styles = {
  page: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '16px',
    paddingBottom: '40px',
  } as CSSProperties,
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    marginBottom: '16px',
  } as CSSProperties,
  primaryBtn: {
    padding: '12px 20px',
    borderRadius: '12px',
    fontSize: '16px',
    backgroundColor: '#5B8DEF',
    color: '#fff',
    fontWeight: 'bold',
    border: 'none',
  } as CSSProperties,
  ghostBtn: {
    padding: '12px 20px',
    borderRadius: '12px',
    fontSize: '16px',
    backgroundColor: '#f5f5f5',
    color: '#666',
    border: 'none',
  } as CSSProperties,
  dangerBtn: {
    padding: '12px 20px',
    borderRadius: '12px',
    fontSize: '16px',
    backgroundColor: '#FFEBEE',
    color: '#F44336',
    fontWeight: 'bold',
    border: 'none',
  } as CSSProperties,
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '2px solid #E0E0E0',
    borderRadius: '10px',
    boxSizing: 'border-box',
  } as CSSProperties,
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    fontSize: '14px',
  } as CSSProperties,
}

/* -------------------------------- 弹窗 -------------------------------- */

export function Modal({
  title,
  onClose,
  children,
  footer,
  maxWidth = 520,
  closeOnOverlay = true,
}: {
  title?: ReactNode
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  maxWidth?: number
  closeOnOverlay?: boolean
}) {
  return (
    <div
      onClick={closeOnOverlay ? onClose : undefined}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '16px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#fff',
          borderRadius: '20px',
          padding: '20px',
          width: '100%',
          maxWidth: `${maxWidth}px`,
          maxHeight: '88vh',
          overflow: 'auto',
          boxSizing: 'border-box',
          animation: 'fadeInUp 0.18s ease-out',
        }}
      >
        {title && (
          <h3 style={{ marginBottom: '16px', fontSize: '19px', fontWeight: 'bold' }}>{title}</h3>
        )}
        {children}
        {footer && <div style={{ marginTop: '18px' }}>{footer}</div>}
      </div>
    </div>
  )
}

/* ------------------------------- 顶部导航 ------------------------------- */

export function PageHeader({
  title,
  onBack,
  right,
}: {
  title: ReactNode
  onBack: () => void
  right?: ReactNode
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '18px',
        gap: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
        <button
          onClick={onBack}
          aria-label="返回"
          style={{
            fontSize: '22px',
            background: 'none',
            border: 'none',
            minWidth: '44px',
            minHeight: '44px',
            borderRadius: '10px',
          }}
        >
          ←
        </button>
        <div style={{ fontSize: '19px', fontWeight: 'bold', minWidth: 0 }}>{title}</div>
      </div>
      {right}
    </div>
  )
}

/* -------------------------------- 空状态 -------------------------------- */

export function EmptyState({ icon = '📭', text }: { icon?: string; text: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
      <div style={{ fontSize: '42px', marginBottom: '10px' }}>{icon}</div>
      <p style={{ fontSize: '14px' }}>{text}</p>
    </div>
  )
}

/* ------------------------------- 确认弹窗 ------------------------------- */

export function ConfirmDialog({
  title,
  message,
  confirmText = '确定',
  cancelText = '取消',
  danger = false,
  onConfirm,
  onCancel,
}: {
  title: string
  message: ReactNode
  confirmText?: string
  cancelText?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Modal title={title} onClose={onCancel} maxWidth={420}>
      <div style={{ fontSize: '15px', lineHeight: 1.7, color: '#555', whiteSpace: 'pre-wrap' }}>
        {message}
      </div>
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button onClick={onCancel} style={{ ...styles.ghostBtn, flex: 1 }}>
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          style={{
            ...(danger ? styles.dangerBtn : styles.primaryBtn),
            flex: 2,
          }}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  )
}
