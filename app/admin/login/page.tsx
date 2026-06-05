import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/admin/LoginForm'
import { isAdminAuthenticated } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect('/admin/dashboard')
  }

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <LoginForm />
      </div>
    </main>
  )
}
