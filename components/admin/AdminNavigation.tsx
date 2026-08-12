"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, LayoutGrid, LogOut, PlusCircle } from "lucide-react";
import { logoutAction } from "@/actions/auth";
const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/admin/cards", label: "Carteirinhas", icon: CreditCard, exact: true },
  { href: "/admin/cards/new", label: "Nova carteirinha", icon: PlusCircle },
];
export function AdminNavigation() {
  const pathname = usePathname();
  return <nav className="sidebar-nav">{links.map(({ href, label, icon: Icon, exact }) => {
    const active = exact ? pathname === href : pathname.startsWith(href);
    return <Link key={href} href={href} className={`sidebar-link${active ? " active" : ""}`}><Icon size={20} />{label}</Link>;
  })}<form action={logoutAction}><button type="submit" className="sidebar-logout"><LogOut size={20} />Sair</button></form></nav>;
}
