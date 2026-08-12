"use client";

import { useActionState, useEffect } from "react";
import { LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { loginAction } from "@/actions/auth";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { ActionResult } from "@/lib/utils";

const initialState: ActionResult = { success: false, message: "" };

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  useEffect(() => {
    if (state?.message && !state.success) toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="modern-login-form">
      <div className="login-identity">
        <div className="login-logo"><ShieldCheck size={25} strokeWidth={1.8} /></div>
        <h1>Entrar no painel</h1>
        <p>Acesse sua conta administrativa.</p>
      </div>

      <div className="login-fields">
        <label className="login-field" htmlFor="email">
          <span>Usuário</span>
          <div className="login-input-wrap">
            <UserRound size={17} />
            <input id="email" name="email" type="text" autoComplete="username" placeholder="Digite seu usuário" required autoFocus />
          </div>
        </label>

        <label className="login-field" htmlFor="password">
          <span>Senha</span>
          <div className="login-input-wrap">
            <LockKeyhole size={17} />
            <input id="password" name="password" type="password" autoComplete="current-password" placeholder="Digite sua senha" required />
          </div>
        </label>
      </div>

      <div className="login-submit"><SubmitButton label="Entrar" pendingLabel="Entrando..." /></div>
      <p className="login-security"><LockKeyhole size={12} /> Acesso restrito a administradores</p>
    </form>
  );
}
