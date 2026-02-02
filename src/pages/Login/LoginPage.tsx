import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

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
    <div className="min-h-screen bg-[#18191a]">
      <header className="sticky top-0 z-20 bg-[#242526] border-b border-[#3a3b3c]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-[#3a3b3c] rounded-full" />
          <div className="text-gray-100 font-semibold">SpanishConnect</div>
          <nav className="hidden md:flex items-center gap-6 ml-6">
            <div className="h-3 w-12 bg-[#3a3b3c] rounded" />
            <div className="h-3 w-12 bg-[#3a3b3c] rounded" />
            <div className="h-3 w-16 bg-[#3a3b3c] rounded" />
            <div className="h-3 w-20 bg-[#3a3b3c] rounded" />
          </nav>
          <div className="flex-1" />
          <div className="w-8 h-8 bg-[#3a3b3c] rounded-full" />
        </div>
      </header>

      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-16">
        <div className="max-w-md space-y-10">
        <div className="bg-[#242526] border border-[#3a3b3c] rounded-lg p-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">SC</div>
            <div>
              <div className="text-2xl font-bold text-gray-100">SpanishConnect</div>
              <div className="text-sm text-gray-400">Learn Spanish Together</div>
            </div>
          </div>
        </div>

        <form className="bg-[#242526] border border-[#3a3b3c] rounded-lg p-10 space-y-8">
          {error && (
            <div className="rounded-lg bg-red-900/20 border border-red-700/40 p-4">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-100 mb-3">
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
                className="appearance-none block w-full px-4 py-3 border border-[#3a3b3c] rounded-lg bg-[#3a3b3c] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-100 mb-3">
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
                className="appearance-none block w-full px-4 py-3 border border-[#3a3b3c] rounded-lg bg-[#3a3b3c] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                className="h-4 w-4 text-gray-700 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-100">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-blue-400 hover:text-blue-300"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-blue-400 hover:text-blue-300">
                Register
              </Link>
            </p>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}
