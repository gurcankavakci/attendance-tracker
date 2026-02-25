import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dersler from './pages/Dersler'
import Program from './pages/Program'
import Yoklama from './pages/Yoklama'
import Rapor from './pages/Rapor'
import Login from './pages/Login'
import { isAuthenticated } from './lib/auth'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/yoklama" replace />} />
          <Route path="dersler" element={<Dersler />} />
          <Route path="program" element={<Program />} />
          <Route path="yoklama" element={<Yoklama />} />
          <Route path="rapor" element={<Rapor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
