'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteCardAction } from '@/actions/cards'

interface DeleteCardButtonProps {
  id: string
  redirectTo?: string
}

export function DeleteCardButton({ id, redirectTo }: DeleteCardButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    const confirmed = window.confirm('Tem certeza que deseja excluir esta carteirinha?')
    if (!confirmed) return

    startTransition(async () => {
      const result = await deleteCardAction(id)

      if (!result.success) {
        toast.error(result.message)
        return
      }

      toast.success(result.message)

      if (redirectTo) {
        router.push(redirectTo)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <button type="button" className="btn-danger" onClick={handleDelete} disabled={isPending}>
      <Trash2 size={16} />
      {isPending ? 'Excluindo...' : 'Excluir'}
    </button>
  )
}
