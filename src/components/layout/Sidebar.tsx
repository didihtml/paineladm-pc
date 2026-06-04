import { NavLink, useNavigate } from 'react-router-dom'
import { Users, CreditCard, LayoutDashboard, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/usuarios', label: 'Usuários', icon: Users },
  { to: '/carteirinha', label: 'Carteirinha', icon: CreditCard },
]

export function Sidebar() {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-60 min-h-screen bg-[#1a3a6b] text-white flex flex-col">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-bold tracking-wide">PUC Admin</h1>
        <p className="text-xs text-white/50 mt-1">Painel de Gestão</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg text-sm transition-colors"
        >
          <LogOut size={16} />
          Sair
        </button>
        <p className="text-xs text-white/30 pl-1">© 2025 PUC Minas</p>
      </div>
    </aside>
  )
}
