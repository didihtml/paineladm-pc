import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { STUDENT_AUTH_COOKIE_NAME } from '@/lib/constants'

const SESSION_VALUE_PREFIX = 'card:'

export async function getStudentSessionCardId() {
  const cookieStore = await cookies()
  const raw = cookieStore.get(STUDENT_AUTH_COOKIE_NAME)?.value

  if (!raw?.startsWith(SESSION_VALUE_PREFIX)) {
    return null
  }

  return raw.slice(SESSION_VALUE_PREFIX.length)
}

export async function isStudentAuthenticated() {
  return Boolean(await getStudentSessionCardId())
}

export async function requireStudentSession() {
  const cardId = await getStudentSessionCardId()

  if (!cardId) {
    redirect('/aluno/login')
  }

  return cardId
}

export async function createStudentSession(cardId: string, remember: boolean) {
  const cookieStore = await cookies()

  cookieStore.set(STUDENT_AUTH_COOKIE_NAME, `${SESSION_VALUE_PREFIX}${cardId}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: remember ? 60 * 60 * 24 * 30 : 60 * 60 * 12,
  })
}

export async function clearStudentSession() {
  const cookieStore = await cookies()
  cookieStore.delete(STUDENT_AUTH_COOKIE_NAME)
}
