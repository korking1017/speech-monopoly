import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CheckinPage from './pages/CheckinPage'
import GroupingPage from './pages/GroupingPage'
import GamePage from './pages/GamePage'
import SettingsPage from './pages/SettingsPage'
import QuestionBankPage from './pages/QuestionBankPage'
import ClassDetailPage from './pages/ClassDetailPage'
import ReportPage from './pages/ReportPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/checkin/:classId" element={<CheckinPage />} />
      <Route path="/grouping/:classId" element={<GroupingPage />} />
      <Route path="/game/:classId" element={<GamePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/question-bank" element={<QuestionBankPage />} />
      <Route path="/class/:classId" element={<ClassDetailPage />} />
      <Route path="/class/:classId/report" element={<ReportPage />} />
    </Routes>
  )
}