import { Link, Outlet } from 'react-router-dom';
import { Music, Plus, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <nav className="bg-ivory border-b border-border border-b-2 border-b-saffron/20">
        <div className="mx-auto max-w-6xl px-4 py-3 flex flex-wrap items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-ink hover:text-saffron transition-colors">
            <Music className="h-6 w-6 text-saffron" />
            <span className="font-display">BhajanTabs</span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  to="/songs/new"
                  className="flex items-center gap-1.5 rounded-md bg-saffron text-white px-3 py-1.5 text-sm font-medium hover:bg-saffron-light transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  New Song
                </Link>
                <span className="text-sm text-ink-light">{user.username}</span>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-ink-muted hover:text-ink hover:bg-cream transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-saffron hover:text-saffron-deep transition-colors"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-8 flex-1 w-full">
        <Outlet />
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-ink-muted">
        🙏 BhajanTabs
      </footer>
    </div>
  );
}
