import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import LoadingScreen from './components/common/LoadingScreen'

// Lazy pages
const Landing        = lazy(() => import('./pages/Landing'))
const Login          = lazy(() => import('./pages/Login'))
const Register       = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword  = lazy(() => import('./pages/ResetPassword'))
const AppLayout      = lazy(() => import('./components/layout/AppLayout'))
const Dashboard      = lazy(() => import('./pages/Dashboard'))
const GenerateAudio  = lazy(() => import('./pages/GenerateAudio'))
const History        = lazy(() => import('./pages/History'))
const Templates      = lazy(() => import('./pages/Templates'))
const Profile        = lazy(() => import('./pages/Profile'))
const Settings       = lazy(() => import('./pages/Settings'))
const Pricing        = lazy(() => import('./pages/Pricing'))

// Route guards
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return !user ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login"           element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register"        element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/reset-password"  element={<ResetPassword />} />

            {/* Protected with sidebar layout */}
            <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
              <Route path="dashboard"     element={<Dashboard />} />
              <Route path="generate"      element={<GenerateAudio />} />
              <Route path="history"       element={<History />} />
              <Route path="templates"     element={<Templates />} />
              <Route path="profile"       element={<Profile />} />
              <Route path="settings"      element={<Settings />} />
              <Route path="pricing"       element={<Pricing />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  )
}
