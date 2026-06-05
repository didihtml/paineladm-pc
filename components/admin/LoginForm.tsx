'use client'

import { useActionState, useEffect } from 'react'
import { LockKeyhole, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { loginAction } from '@/actions/auth'
import { SubmitButton } from '@/components/ui/SubmitButton'
import type { ActionResult } from '@/lib/utils'

const initialState: ActionResult = {
  success: false,
  message: '',
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState)

  useEffect(() => {
    if (state?.message && !state.success) {
      toast.error(state.message)
    }
  }, [state])

  return (
    <form action={formAction} className="form-grid-single">
      <div>
        <span className="kicker">Acesso administrativo</span>
        <h1 className="page-title" style={{ marginTop: 10 }}>
          Entrar no painel
        </h1>
        <p className="page-subtitle">Use suas credenciais para cadastrar, editar e publicar carteirinhas.</p>
      </div>

      <div className="surface-card">
        <div className="field" style={{ marginBottom: 14 }}>
          <label htmlFor="email">E-mail</label>
          <div className="row-inline">
            <Mail size={16} color="#64748b" />
            <input id="email" name="email" type="email" placeholder="admin@pucminas.br" required />
          </div>
        </div>

        <div className="field">
          <label htmlFor="password">Senha</label>
          <div className="row-inline">
            <LockKeyhole size={16} color="#64748b" />
            <input id="password" name="password" type="password" placeholder="••••••••" required />
          </div>
        </div>
      </div>

      <SubmitButton label="Entrar" pendingLabel="Entrando..." />
    </form>
  )
}
