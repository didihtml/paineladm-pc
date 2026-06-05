import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { CardRecord } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [total, active, inactive, latestCards]: [
    number,
    number,
    number,
    CardRecord[],
  ] = await Promise.all([
    prisma.card.count(),
    prisma.card.count({ where: { status: "ATIVA" } }),
    prisma.card.count({ where: { status: "INATIVA" } }),
    prisma.card.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

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
          Criar carteirinha
        </Link>
      </section>

      <section className="grid-stats">
        <article className="stat-card">
          <span className="kicker">Total</span>
          <p className="stat-value">{total}</p>
        </article>
        <article className="stat-card">
          <span className="kicker">Ativas</span>
          <p className="stat-value">{active}</p>
        </article>
        <article className="stat-card">
          <span className="kicker">Inativas</span>
          <p className="stat-value">{inactive}</p>
        </article>
        <article className="stat-card">
          <span className="kicker">Últimas criadas</span>
          <p className="stat-value">{latestCards.length}</p>
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
            Ver todas
          </Link>
        </div>

        {latestCards.length === 0 ? (
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
                {latestCards.map((card) => (
                  <tr key={card.id}>
                    <td>
                      <div className="row-inline">
                        <div className="avatar">
                          <img src={card.fotoUrl} alt={card.nome} />
                        </div>
                        <div>
                          <strong>{card.nome}</strong>
                          <div className="helper-text">{card.instituicao}</div>
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
                          href={`/card/${card.id}`}
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
