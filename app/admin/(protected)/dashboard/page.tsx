import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buildPublicCardUrl, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DatabaseSetupNotice } from "@/components/admin/DatabaseSetupNotice";
import { isDatabaseConfigured } from "@/lib/env";
import type { CardRecord } from "@/lib/types";
import { ArrowRight, CheckCircle2, Clock3, Plus, UserRound, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  if (!isDatabaseConfigured()) {
    return <DatabaseSetupNotice />;
  }

  let total = 0;
  let active = 0;
  let inactive = 0;
  let latestCards: CardRecord[] = [];
  let dbError: string | null = null;

  try {
    const [t, a, i, lc] = await Promise.all([
      prisma.card.count(),
      prisma.card.count({ where: { status: "ATIVA" } }),
      prisma.card.count({ where: { status: "INATIVA" } }),
      prisma.card.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);
    total = t;
    active = a;
    inactive = i;
    latestCards = lc as CardRecord[];
  } catch (err: any) {
    console.error("[AdminDashboardPage] Erro no Prisma:", err?.message || err);
    dbError = err?.message || "Erro desconhecido ao acessar o banco de dados.";
  }

  const typedLatestCards = latestCards as CardRecord[];

  if (dbError) {
    return (
      <section className="panel empty-state">
        <h1 className="empty-title">Erro ao carregar dados</h1>
        <p className="helper-text" style={{ maxWidth: 680, margin: "0 auto" }}>
          Não foi possível conectar ao banco de dados. Verifique se a variável{" "}
          <strong>DATABASE_URL</strong> está configurada corretamente na Vercel.
        </p>
        <p
          className="helper-text"
          style={{
            maxWidth: 680,
            margin: "12px auto 0",
            fontFamily: "monospace",
            fontSize: 12,
            color: "#94a3b8",
          }}
        >
          {dbError}
        </p>
        <div
          className="actions-row"
          style={{ justifyContent: "center", marginTop: 18 }}
        >
          <Link href="/admin/dashboard" className="btn-secondary">
            Tentar novamente
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="panel page-header">
        <div>
          <span className="kicker">Dashboard</span>
          <h1 className="page-title">Visão geral das carteirinhas</h1>
          <p className="page-subtitle">
            Acompanhe o total de registros, status de ativação e as últimas
            carteirinhas criadas.
          </p>
        </div>
        <Link href="/admin/cards/new" className="btn">
          <Plus size={18} /> Criar carteirinha
        </Link>
      </section>

      <section className="grid-stats">
        <article className="stat-card"><span className="stat-icon total"><UserRound /></span><div>
          <span className="kicker">Total</span><p className="stat-value">{total}</p><small>Carteirinhas registradas</small></div>
        </article>
        <article className="stat-card"><span className="stat-icon active"><CheckCircle2 /></span><div>
          <span className="kicker">Ativas</span><p className="stat-value">{active}</p><small>Carteirinhas ativas</small></div>
        </article>
        <article className="stat-card"><span className="stat-icon inactive"><XCircle /></span><div>
          <span className="kicker">Inativas</span><p className="stat-value">{inactive}</p><small>Carteirinhas inativas</small></div>
        </article>
        <article className="stat-card"><span className="stat-icon recent"><Clock3 /></span><div>
          <span className="kicker">Últimas criadas</span><p className="stat-value">{latestCards.length}</p><small>Registros recentes</small></div>
        </article>
      </section>

      <section className="panel">
        <div className="page-header" style={{ marginBottom: 18 }}>
          <div>
            <h2 style={{ margin: 0, color: "#fff" }}>
              Últimas carteirinhas criadas
            </h2>
            <p className="page-subtitle" style={{ marginTop: 6 }}>
              Os registros mais recentes ficam disponíveis aqui para
              acompanhamento rápido.
            </p>
          </div>
          <Link href="/admin/cards" className="btn-secondary">
            Ver todas <ArrowRight size={17} />
          </Link>
        </div>

        {typedLatestCards.length === 0 ? (
          <div className="empty-state">
            <h3 className="empty-title">Nenhuma carteirinha cadastrada</h3>
            <p className="helper-text">
              Crie a primeira carteirinha para começar a gerenciar o portal
              público.
            </p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Curso</th>
                  <th>Status</th>
                  <th>Validade</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {typedLatestCards.map((card) => (
                  <tr key={card.id}>
                    <td>
                      <div className="row-inline">
                        <div className="avatar">
                          <img src={card.fotoUrl} alt={card.nome} />
                        </div>
                        <div>
                          <strong>{card.nome}</strong>
                          <div className="helper-text">
                            Código {card.codigo ?? "não informado"} •{" "}
                            {card.campus ?? "Sem campus"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{card.curso}</td>
                    <td>
                      <StatusBadge status={card.status} />
                    </td>
                    <td>{formatDate(card.validade)}</td>
                    <td>
                      <div className="actions-row">
                        <Link
                          href={`/admin/cards/${card.id}`}
                          className="btn-link"
                        >
                          Editar
                        </Link>
                        <Link
                          href={buildPublicCardUrl(card.id)}
                          className="btn-link"
                          target="_blank"
                        >
                          Visualizar
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
