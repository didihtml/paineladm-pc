"use client";

import { useActionState, useEffect, useRef } from "react";
import { LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { loginAction } from "@/actions/auth";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { ActionResult } from "@/lib/utils";

const initialState: ActionResult = { success: false, message: "" };
const blobs = [
  { size: 330, left: 10, top: 12, delay: -4, duration: 24 },
  { size: 220, left: 70, top: 8, delay: -13, duration: 29 },
  { size: 380, left: 62, top: 56, delay: -8, duration: 32 },
  { size: 190, left: 24, top: 68, delay: -18, duration: 23 },
  { size: 260, left: 43, top: 34, delay: -11, duration: 27 },
  { size: 170, left: 84, top: 32, delay: -6, duration: 21 },
];

export function NeuralAccessLogin() {
  const [state, formAction] = useActionState(loginAction, initialState);
  const blobRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (state?.message && !state.success) toast.error(state.message);
  }, [state]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      blobRefs.current.forEach((blob, index) => {
        if (!blob) return;
        const distance = (index + 1) * 8;
        blob.style.marginLeft = `${x * distance}px`;
        blob.style.marginTop = `${y * distance}px`;
      });
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return (
    <div className="mercury-login">
      <svg className="mercury-filter" aria-hidden="true"><defs><filter id="mercury-goo"><feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" /><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" /><feComposite in="SourceGraphic" in2="goo" operator="atop" /></filter></defs></svg>
      <div className="mercury-stage" aria-hidden="true">
        {blobs.map((blob, index) => <div className="mercury-blob" key={index} ref={(element) => { blobRefs.current[index] = element; }} style={{ width: blob.size, height: blob.size, left: `${blob.left}%`, top: `${blob.top}%`, animationDelay: `${blob.delay}s`, animationDuration: `${blob.duration}s` }} />)}
      </div>
      <main className="mercury-auth-container">
        <header className="mercury-header">
          <span className="mercury-brand-id">Portal Admin · Acesso seguro</span>
          <h1>ACESSO<br />PORTAL</h1>
          <p>Entre com seu usuário e senha para acessar o painel.</p>
        </header>
        <form action={formAction} autoComplete="on" className="mercury-form">
          <label className="mercury-form-group" htmlFor="email"><span>Identidade do usuário</span><input id="email" name="email" type="text" autoComplete="username" placeholder="Digite seu usuário" required autoFocus /><i className="mercury-input-line" /></label>
          <label className="mercury-form-group" htmlFor="password"><span>Chave de acesso</span><input id="password" name="password" type="password" autoComplete="current-password" placeholder="••••••••" required /><i className="mercury-input-line" /></label>
          <div className="mercury-submit-wrap"><div className="mercury-drop" aria-hidden="true" /><SubmitButton label="Inicializar acesso" pendingLabel="Autenticando..." /></div>
        </form>
        <footer className="mercury-footer"><LockKeyhole size={12} /> Sessão administrativa protegida</footer>
      </main>
    </div>
  );
}
