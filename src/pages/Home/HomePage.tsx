import { useAuth } from '../../contexts/AuthContext'

export function HomePage() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-[#18191a] text-gray-100">
      <header className="sticky top-0 z-20 bg-[#242526] border-b border-[#3a3b3c]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-[#3a3b3c] rounded-full" />
          <div className="text-gray-100 font-semibold">SpanishConnect</div>
          <nav className="hidden md:flex items-center gap-6 ml-6">
            <div className="h-3 w-12 bg-[#3a3b3c] rounded" />
            <div className="h-3 w-12 bg-[#3a3b3c] rounded" />
            <div className="h-3 w-16 bg-[#3a3b3c] rounded" />
            <div className="h-3 w-20 bg-[#3a3b3c] rounded" />
          </nav>
          <div className="flex-1" />
          <div className="text-sm text-gray-300 hidden sm:block">
            {user?.displayName} ({user?.role})
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="hidden lg:block lg:col-span-2 space-y-6">
          <div className="bg-[#242526] border border-[#3a3b3c] rounded-lg p-5">
            <div className="h-4 w-24 bg-[#3a3b3c] rounded mb-4" />
            <div className="space-y-3">
              <div className="h-3 w-32 bg-[#3a3b3c] rounded" />
              <div className="h-3 w-28 bg-[#3a3b3c] rounded" />
              <div className="h-3 w-36 bg-[#3a3b3c] rounded" />
              <div className="h-3 w-24 bg-[#3a3b3c] rounded" />
            </div>
          </div>
        </aside>

        <section className="lg:col-span-8 space-y-6">
          <div className="bg-[#242526] border border-[#3a3b3c] rounded-lg p-6">
            <div className="h-5 w-40 bg-[#3a3b3c] rounded mb-4" />
            <div className="space-y-3">
              <div className="h-3 w-full bg-[#3a3b3c] rounded" />
              <div className="h-3 w-5/6 bg-[#3a3b3c] rounded" />
              <div className="h-3 w-2/3 bg-[#3a3b3c] rounded" />
            </div>
          </div>
          <div className="bg-[#242526] border border-[#3a3b3c] rounded-lg p-6">
            <div className="h-4 w-28 bg-[#3a3b3c] rounded mb-4" />
            <div className="h-40 bg-[#3a3b3c] border border-[#3a3b3c] rounded" />
          </div>
        </section>

        <aside className="hidden lg:block lg:col-span-2 space-y-6">
          <div className="bg-[#242526] border border-[#3a3b3c] rounded-lg p-5">
            <div className="h-4 w-24 bg-[#3a3b3c] rounded mb-4" />
            <div className="space-y-3">
              <div className="h-3 w-40 bg-[#3a3b3c] rounded" />
              <div className="h-3 w-32 bg-[#3a3b3c] rounded" />
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
