'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { clearStudentSession, createStudentSession, isStudentAuthenticated } from '@/lib/student-auth'
import { verifyStudentPassword } from '@/lib/student-access'
import { STUDENT_DEFAULT_ORIGIN } from '@/lib/constants'
import type { ActionResult } from '@/lib/utils'

export async function studentLoginAction(
  _previousState: ActionResult | null,
  formData: FormData
): Promise<ActionResult | null> {
  if (await isStudentAuthenticated()) {
    redirect('/aluno/carteirinha')
  }

  const origin = String(formData.get('origem') ?? '').trim()
  const username = String(formData.get('usuario') ?? '').trim()
  const password = String(formData.get('senha') ?? '').trim()
  const remember = String(formData.get('remember') ?? '') === 'on'

  if (!origin || origin !== STUDENT_DEFAULT_ORIGIN) {
    return {
      success: false,
      message: 'Selecione a origem correta para continuar.',
    }
  }

  if (!username || !password) {
    return {
      success: false,
      message: 'Informe usuário e senha.',
    }
  }

  const card = await prisma.card.findUnique({ where: { alunoUsuario: username } })
  if (!card || card.origem !== origin) {
    return {
      success: false,
      message: 'Usuário ou origem inválidos.',
    }
  }

  const passwordMatches = verifyStudentPassword(password, card.alunoSenhaHash)
  if (!passwordMatches) {
    return {
      success: false,
      message: 'Senha inválida.',
    }
  }

  await createStudentSession(card.id, remember)
  redirect('/aluno/carteirinha')
}

export async function studentLogoutAction() {
  await clearStudentSession()
  redirect('/aluno/login')
}
