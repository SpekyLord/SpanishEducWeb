import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Header } from '../../components'

export function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    username: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()

  const passwordRequirements = {
    minLength: formData.password.length >= 8,
    hasUppercase: /[A-Z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
  }

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!isPasswordValid) {
      setError('Password does not meet requirements')
      return
    }

    setIsLoading(true)

    try {
      await register(
        formData.email,
        formData.password,
        formData.displayName,
        formData.username || undefined
      )
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-fb-bg">
      <Header variant="auth" />

      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-16">
        <div className="max-w-md w-full">
          <div className="glass-card-elevated rounded-xl p-10 shadow-fb-xl">
            {/* Logo and title */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-accent rounded-full flex items-center justify-center text-white font-bold text-xl shadow-glow-accent-md">
                SC
              </div>
              <div>
                <div className="text-2xl font-bold font-heading text-gray-100">SpanishConnect</div>
                <div className="text-sm text-gray-400">Create your account</div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-fb-border/50 my-6" />

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-lg bg-red-900/30 border border-red-700/60 p-4 shadow-fb">
                  <p className="text-sm text-red-200 font-medium">{error}</p>
                </div>
              )}

          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-100 mb-3">
                Email address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none block w-full px-4 py-3 rounded-lg bg-[#0d1b3e] text-gray-100 placeholder-gray-500 input-glow sm:text-sm"
                placeholder="student@example.com"
              />
            </div>

            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-100 mb-3">
                Display Name *
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                required
                value={formData.displayName}
                onChange={handleChange}
                className="appearance-none block w-full px-4 py-3 rounded-lg bg-[#0d1b3e] text-gray-100 placeholder-gray-500 input-glow sm:text-sm"
                placeholder="John Doe"
                maxLength={50}
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-100 mb-3">
                Username (optional)
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className="appearance-none block w-full px-4 py-3 rounded-lg bg-[#0d1b3e] text-gray-100 placeholder-gray-500 input-glow sm:text-sm"
                placeholder="johndoe"
                pattern="^[a-z0-9_]{3,30}$"
              />
              <p className="mt-2 text-xs text-gray-400">
                3-30 characters, lowercase letters, numbers, and underscores only
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-100 mb-3">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none block w-full px-4 py-3 rounded-lg bg-[#0d1b3e] text-gray-100 placeholder-gray-500 input-glow sm:text-sm"
              />
              <div className="mt-3 space-y-2">
                <p
                  className={`text-xs ${passwordRequirements.minLength ? 'text-green-400' : 'text-gray-400'}`}
                >
                  {passwordRequirements.minLength ? '✓' : '○'} 8+ characters
                </p>
                <p
                  className={`text-xs ${passwordRequirements.hasUppercase ? 'text-green-400' : 'text-gray-400'}`}
                >
                  {passwordRequirements.hasUppercase ? '✓' : '○'} Uppercase letter
                </p>
                <p
                  className={`text-xs ${passwordRequirements.hasNumber ? 'text-green-400' : 'text-gray-400'}`}
                >
                  {passwordRequirements.hasNumber ? '✓' : '○'} Number
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-100 mb-3">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="appearance-none block w-full px-4 py-3 rounded-lg bg-[#0d1b3e] text-gray-100 placeholder-gray-500 input-glow sm:text-sm"
              />
            </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading || !isPasswordValid}
                  className="group relative w-full flex justify-center py-3 px-4 text-sm btn-accent-gradient disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-400">
                  Already have an account?{' '}
                  <Link to="/login" className="font-medium text-gold hover:text-[#d4b87e]">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
