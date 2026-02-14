import { useAuth } from '../../contexts/AuthContext'

export function HomePage() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-gray-100">
      <header className="sticky top-0 z-20 bg-[#16213e] border-b border-[#0f3460]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-[#0f3460] rounded-full" />
          <div className="text-gray-100 font-semibold">Piccio Bloguero</div>
          <nav className="hidden md:flex items-center gap-6 ml-6">
            <div className="h-3 w-12 bg-[#0f3460] rounded" />
            <div className="h-3 w-12 bg-[#0f3460] rounded" />
            <div className="h-3 w-16 bg-[#0f3460] rounded" />
            <div className="h-3 w-20 bg-[#0f3460] rounded" />
          </nav>
          <div className="flex-1" />
          <div className="text-sm text-gray-300 hidden sm:block">
            {user?.displayName} ({user?.role})
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-[#c7304d] transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="hidden lg:block lg:col-span-2 space-y-6">
          <div className="bg-[#16213e] border border-[#0f3460] rounded-lg p-5">
            <div className="h-4 w-24 bg-[#0f3460] rounded mb-4" />
            <div className="space-y-3">
              <div className="h-3 w-32 bg-[#0f3460] rounded" />
              <div className="h-3 w-28 bg-[#0f3460] rounded" />
              <div className="h-3 w-36 bg-[#0f3460] rounded" />
              <div className="h-3 w-24 bg-[#0f3460] rounded" />
            </div>
          </div>
        </aside>

        <section className="lg:col-span-8 space-y-6">
          <div className="bg-[#16213e] border border-[#0f3460] rounded-lg p-6">
            <div className="h-5 w-40 bg-[#0f3460] rounded mb-4" />
            <div className="space-y-3">
              <div className="h-3 w-full bg-[#0f3460] rounded" />
              <div className="h-3 w-5/6 bg-[#0f3460] rounded" />
              <div className="h-3 w-2/3 bg-[#0f3460] rounded" />
            </div>
          </div>
          <div className="bg-[#16213e] border border-[#0f3460] rounded-lg p-6">
            <div className="h-4 w-28 bg-[#0f3460] rounded mb-4" />
            <div className="h-40 bg-[#0f3460] border border-[#0f3460] rounded" />
          </div>
        </section>

        <aside className="hidden lg:block lg:col-span-2 space-y-6">
          <div className="bg-[#16213e] border border-[#0f3460] rounded-lg p-5">
            <div className="h-4 w-24 bg-[#0f3460] rounded mb-4" />
            <div className="space-y-3">
              <div className="h-3 w-40 bg-[#0f3460] rounded" />
              <div className="h-3 w-32 bg-[#0f3460] rounded" />
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
