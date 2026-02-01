import { useAuth } from '../../contexts/AuthContext'

export function HomePage() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">🇪🇸 SpanishConnect</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                {user?.displayName} ({user?.role})
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to SpanishConnect!
          </h2>
          <p className="text-gray-600 mb-4">
            You are successfully logged in as {user?.displayName}.
          </p>
          <p className="text-gray-600">
            This is a placeholder home page. The feed and other features will be implemented in
            upcoming phases.
          </p>
        </div>
      </main>
    </div>
  )
}
