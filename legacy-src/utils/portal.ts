export function buildPortalPath(codigoAcesso: string) {
  return `/portal/${encodeURIComponent(codigoAcesso)}`
}

export function buildPortalUrl(codigoAcesso: string) {
  const path = buildPortalPath(codigoAcesso)

  if (typeof window === 'undefined') {
    return path
  }

  return new URL(path, window.location.origin).toString()
}
