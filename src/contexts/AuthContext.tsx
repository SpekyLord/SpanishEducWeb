import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface User {
  _id: string
  email: string
  username: string
  displayName: string
  role: 'teacher' | 'student'
  avatar?: {
    url: string | null
    publicId: string | null
  }
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  register: (email: string, password: string, displayName: string, username?: string) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_URL = '/api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const navigate = useNavigate()

  // Initialize auth state
  useEffect(() => {
    const savedToken = localStorage.getItem('accessToken')
    if (savedToken) {
      setAccessToken(savedToken)
    }
    initializeAuth()
  }, [])

  // Set up token refresh interval
  useEffect(() => {
    if (accessToken) {
      // Refresh token every 14 minutes (before 15 min expiry)
      const interval = setInterval(() => {
        refreshToken()
      }, 14 * 60 * 1000)

      return () => clearInterval(interval)
    }
  }, [accessToken])

  const initializeAuth = async () => {
    try {
      const success = await refreshToken()
      if (!success) {
        setUser(null)
        setAccessToken(null)
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        return false
      }

      const data = await response.json()
      setAccessToken(data.accessToken)
      localStorage.setItem('accessToken', data.accessToken)

      // Get current user
      const userResponse = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${data.accessToken}`,
        },
        credentials: 'include',
      })

      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUser(userData.user)
        return true
      }

      return false
    } catch (error) {
      console.error('Token refresh error:', error)
      return false
    }
  }

  const register = async (
    email: string,
    password: string,
    displayName: string,
    username?: string
  ) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, displayName, username }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      localStorage.setItem('accessToken', data.accessToken)
      setAccessToken(data.accessToken)
      setUser(data.user)
      navigate('/')
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, rememberMe }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      localStorage.setItem('accessToken', data.accessToken)
      setAccessToken(data.accessToken)
      setUser(data.user)
      navigate('/')
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setAccessToken(null)
      navigate('/login')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Export for API calls
export function getAccessToken() {
  // This is a simple implementation. In production, consider using a more robust solution
  return sessionStorage.getItem('accessToken')
}
