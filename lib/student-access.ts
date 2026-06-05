import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const PASSWORD_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
}

export function generateStudentUsername(nome: string, id: string) {
  const normalized = normalizeText(nome)
  const base = normalized || 'aluno'
  const shortId = id.replace(/-/g, '').slice(0, 6)

  return `${base}.${shortId}`
}

export function generateStudentPassword(length = 10) {
  let password = ''

  while (password.length < length) {
    const index = randomBytes(1)[0] % PASSWORD_ALPHABET.length
    password += PASSWORD_ALPHABET[index]
  }

  return password
}

export function hashStudentPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')

  return `${salt}:${hash}`
}

export function verifyStudentPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(':')

  if (!salt || !hash) {
    return false
  }

  const derived = scryptSync(password, salt, 64)
  const original = Buffer.from(hash, 'hex')

  if (derived.length !== original.length) {
    return false
  }

  return timingSafeEqual(derived, original)
}
