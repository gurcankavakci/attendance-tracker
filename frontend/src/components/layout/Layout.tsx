import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BookOpen, Calendar, ClipboardList, BarChart3, LogOut } from 'lucide-react'
import { clearToken } from '../../lib/auth'

const navItems = [
  { to: '/dersler', label: 'Dersler', icon: BookOpen },
  { to: '/program', label: 'Program', icon: Calendar },
  { to: '/yoklama', label: 'Yoklama', icon: ClipboardList },
  { to: '/rapor', label: 'Rapor', icon: BarChart3 },
]

export default function Layout() {
  const navigate = useNavigate()

  function handleLogout() {
    clearToken()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex flex-col min-h-screen lg:flex-row">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-gray-200 fixed top-0 left-0 h-full z-10">
        <div className="px-6 py-5 border-b border-gray-100">
          <h1 className="text-lg font-bold text-blue-600">Devam Takip</h1>
          <p className="text-xs text-gray-400 mt-0.5">Üniversite Devam Sistemi</p>
        </div>
        <nav className="flex flex-col p-3 gap-1 flex-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-56 pb-20 lg:pb-0">
        <Outlet />
      </main>

      {/* Bottom nav — mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10 flex">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium text-gray-500 hover:text-red-600 transition-colors"
        >
          <LogOut size={20} />
          Çıkış
        </button>
      </nav>
    </div>
  )
}
