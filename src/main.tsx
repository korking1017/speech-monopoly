import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { initStorage } from './utils/storage'

const style = document.createElement('style')
style.textContent = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
    background-color: #FFF8E1;
    background-image: radial-gradient(circle at 20% 10%, #FFFDF5 0%, #FFF3D6 55%, #FFE9BC 100%);
    background-attachment: fixed;
    color: #333;
    overscroll-behavior: none;
    padding: env(safe-area-inset-top) 0 env(safe-area-inset-bottom) 0;
    -webkit-tap-highlight-color: transparent;
  }
  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    outline: none;
    min-height: 44px;
    min-width: 44px;
  }
  input, textarea {
    font-family: inherit;
    -webkit-appearance: none;
    border-radius: 8px;
  }
  * { touch-action: manipulation; }

  /* 选中光圈呼吸 */
  @keyframes pulseRing {
    0%, 100% { opacity: 1; box-shadow: 0 0 10px rgba(255,215,0,0.75); }
    50%      { opacity: 0.65; box-shadow: 0 0 18px rgba(255,215,0,1); }
  }
  /* 弹窗淡入 */
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(12px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  /* 骰子滚动 */
  @keyframes diceRoll {
    0%   { transform: rotate(0deg) scale(1); }
    50%  { transform: rotate(180deg) scale(1.12); }
    100% { transform: rotate(360deg) scale(1); }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
    }
  }
`
document.head.appendChild(style)

// 启动时统一做一次「无损」数据升级：只补字段，不删除 iPad 上的既有数据
initStorage()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)
