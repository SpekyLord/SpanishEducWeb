import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Header } from '../../components'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password, rememberMe)
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-fb-bg">
      <Header variant="auth" />

      <div
        className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-16"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 24px' }}
      >
        <div
          className="max-w-md w-full"
          style={{ maxWidth: '448px', width: '100%' }}
        >
          <div
            className="glass-card-elevated rounded-xl p-10 shadow-fb-xl"
            style={{
              borderRadius: '12px',
              padding: '40px',
            }}
          >
            {/* Logo and title */}
            <div className="flex items-center gap-4 mb-6">
              <img
                src="/Logo.svg"
                alt="Piccio Bloguero"
                style={{ width: '56px', height: '56px' }}
              />
              <div>
                <div className="text-2xl font-bold font-heading text-[#1a3a2a]">Piccio Bloguero</div>
                <div className="text-sm text-[#6b8a7a]">Learn Spanish Together</div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-fb-border/50 my-6" />

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4 shadow-fb">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#1a3a2a] mb-3">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 rounded-lg bg-[#f0f4f0] text-[#1a3a2a] placeholder-[#9cb0a3] input-glow"
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[#1a3a2a] mb-3">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 rounded-lg bg-[#f0f4f0] text-[#1a3a2a] placeholder-[#9cb0a3] input-glow"
                    placeholder="Password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded bg-[#f0f4f0] border-fb-border accent-accent"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-[#1a3a2a]">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-medium text-gold hover:text-gold-light"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-3 px-4 text-sm btn-accent-gradient disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>

              <div className="text-center">
                <p className="text-sm text-[#6b8a7a]">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-medium text-gold hover:text-gold-light">
                    Register
                  </Link>
                </p>
              </div>

              <div className="text-center" style={{ marginTop: '8px' }}>
                <Link
                  to="/feed"
                  style={{ fontSize: '0.875rem', color: '#6b8a7a', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#1a3a2a'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#6b8a7a'; }}
                >
                  ← Back to Feed
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
