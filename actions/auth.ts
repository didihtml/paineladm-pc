'use server'

import { redirect } from 'next/navigation'
import type { ActionResult } from '@/lib/utils'
import { clearAdminSession, createAdminSession, getAdminCredentials, isAdminAuthenticated } from '@/lib/auth'

export async function loginAction(
  _previousState: ActionResult | null,
  formData: FormData
): Promise<ActionResult | null> {
  if (await isAdminAuthenticated()) {
    redirect('/admin/dashboard')
  }

  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '').trim()
  const admin = getAdminCredentials()

  if (email !== admin.email || password !== admin.password) {
    return {
      success: false,
      message: 'E-mail ou senha inválidos.',
    }
  }

  await createAdminSession()
  redirect('/admin/dashboard')
}

export async function logoutAction() {
  await clearAdminSession()
  redirect('/admin/login')
}
