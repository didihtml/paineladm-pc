import { ChevronDown, ShieldCheck } from "lucide-react";
import { AdminNavigation } from "@/components/admin/AdminNavigation";
export function AdminShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return <main className="page-shell"><div className="admin-solid-background" aria-hidden="true" /><div className="admin-shell"><aside className="sidebar">
    <div><div className="brand"><span className="brand-mark"><ShieldCheck size={22} /></span><div><strong>Portal Admin</strong><small>Gestão de carteirinhas digitais</small></div></div><AdminNavigation /></div>
    <div className="admin-profile"><span className="admin-avatar"><img src="/admin-avatar.png" alt="" /></span><div><strong>Administrador</strong><small>admin@portal.com</small></div><ChevronDown size={16} /></div>
  </aside><section className="content-stack">{children}</section></div></main>;
}
