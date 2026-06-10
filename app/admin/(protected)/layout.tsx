import { AdminShell } from '@/components/admin/AdminShell'
import { requireAdminSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function ProtectedAdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  try {
    await requireAdminSession()
  } catch (err) {
    console.error('[ProtectedAdminLayout] Erro na autenticação:', err)
    throw err
  }
  return <AdminShell>{children}</AdminShell>
}
