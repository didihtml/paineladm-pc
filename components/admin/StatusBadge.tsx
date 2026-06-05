interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toUpperCase() === 'ATIVA' ? 'ATIVA' : 'INATIVA'

  return (
    <span className={`status-badge ${normalized === 'ATIVA' ? 'ativa' : 'inativa'}`}>
      {normalized === 'ATIVA' ? 'Ativa' : 'Inativa'}
    </span>
  )
}
