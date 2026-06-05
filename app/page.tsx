import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  if (await isAdminAuthenticated()) {
    redirect('/admin/dashboard')
  }

  redirect('/admin/login')
}
