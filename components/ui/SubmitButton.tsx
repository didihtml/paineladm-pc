'use client'

import { useFormStatus } from 'react-dom'

interface SubmitButtonProps {
  label: string
  pendingLabel?: string
}

export function SubmitButton({ label, pendingLabel = 'Enviando...' }: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button type="submit" className="btn" disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  )
}
