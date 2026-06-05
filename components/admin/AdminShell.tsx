import Link from 'next/link'
import { LayoutDashboard, CreditCard, PlusCircle, LogOut } from 'lucide-react'
import { logoutAction } from '@/actions/auth'

export function AdminShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="page-shell">
      <div className="admin-shell">
        <aside className="sidebar">
          <div className="brand">
            <strong>Portal Admin</strong>
            <small>Gestão de carteirinhas digitais</small>
          </div>

          <nav className="sidebar-nav">
            <Link href="/admin/dashboard" className="sidebar-link">
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
            <Link href="/admin/cards" className="sidebar-link">
              <CreditCard size={18} />
              Carteirinhas
            </Link>
            <Link href="/admin/cards/new" className="sidebar-link">
              <PlusCircle size={18} />
              Nova carteirinha
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="sidebar-logout">
                <LogOut size={18} />
                Sair
              </button>
            </form>
          </nav>
        </aside>

        <section className="content-stack">{children}</section>
      </div>
    </main>
  )
}
