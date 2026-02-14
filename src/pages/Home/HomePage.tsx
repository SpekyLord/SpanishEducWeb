import { useAuth } from '../../contexts/AuthContext'

export function HomePage() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-[#f5f7f5] text-[#1a3a2a]">
      <header className="sticky top-0 z-20 bg-white border-b border-[#d4ddd8]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <img
            src="/Logo.svg"
            alt="Piccio Bloguero"
            style={{ width: '40px', height: '40px' }}
          />
          <div className="text-[#1a3a2a] font-semibold">Piccio Bloguero</div>
          <nav className="hidden md:flex items-center gap-6 ml-6">
            <div className="h-3 w-12 bg-[#e8ede8] rounded" />
            <div className="h-3 w-12 bg-[#e8ede8] rounded" />
            <div className="h-3 w-16 bg-[#e8ede8] rounded" />
            <div className="h-3 w-20 bg-[#e8ede8] rounded" />
          </nav>
          <div className="flex-1" />
          <div className="text-sm text-[#4a6a58] hidden sm:block">
            {user?.displayName} ({user?.role})
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-[#1e4d35] transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="hidden lg:block lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#d4ddd8] rounded-lg p-5">
            <div className="h-4 w-24 bg-[#e8ede8] rounded mb-4" />
            <div className="space-y-3">
              <div className="h-3 w-32 bg-[#e8ede8] rounded" />
              <div className="h-3 w-28 bg-[#e8ede8] rounded" />
              <div className="h-3 w-36 bg-[#e8ede8] rounded" />
              <div className="h-3 w-24 bg-[#e8ede8] rounded" />
            </div>
          </div>
        </aside>

        <section className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-[#d4ddd8] rounded-lg p-6">
            <div className="h-5 w-40 bg-[#e8ede8] rounded mb-4" />
            <div className="space-y-3">
              <div className="h-3 w-full bg-[#e8ede8] rounded" />
              <div className="h-3 w-5/6 bg-[#e8ede8] rounded" />
              <div className="h-3 w-2/3 bg-[#e8ede8] rounded" />
            </div>
          </div>
          <div className="bg-white border border-[#d4ddd8] rounded-lg p-6">
            <div className="h-4 w-28 bg-[#e8ede8] rounded mb-4" />
            <div className="h-40 bg-[#e8ede8] border border-[#d4ddd8] rounded" />
          </div>
        </section>

        <aside className="hidden lg:block lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#d4ddd8] rounded-lg p-5">
            <div className="h-4 w-24 bg-[#e8ede8] rounded mb-4" />
            <div className="space-y-3">
              <div className="h-3 w-40 bg-[#e8ede8] rounded" />
              <div className="h-3 w-32 bg-[#e8ede8] rounded" />
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
