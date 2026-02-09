import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { LoginPage } from './pages/Login'
import { RegisterPage } from './pages/Register'
import { HomePage } from './pages/Home'
import { FeedPage } from './pages/Feed/FeedPage'
import { initCSRF } from './services/api'
import './App.css'

// Lazy load heavy pages for better performance
const FilesPage = lazy(() => import('./pages/Files/FilesPage').then(m => ({ default: m.FilesPage })))
const MessagesPage = lazy(() => import('./pages/Messages/MessagesPage').then(m => ({ default: m.MessagesPage })))

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-fb-bg flex items-center justify-center">
    <div className="text-gray-400">Loading...</div>
  </div>
)

function App() {
  // Initialize CSRF token on app mount
  useEffect(() => {
    initCSRF();
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <FeedPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/feed"
                element={
                  <ProtectedRoute>
                    <FeedPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/files"
                element={
                  <ProtectedRoute>
                    <FilesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <MessagesPage />
                  </ProtectedRoute>
                }
              />

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App
