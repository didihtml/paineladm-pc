import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buildPublicCardUrl, formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DatabaseSetupNotice } from "@/components/admin/DatabaseSetupNotice";
import { DeleteCardButton } from "@/components/ui/DeleteCardButton";
import { isDatabaseConfigured } from "@/lib/env";
import type { CardRecord } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminCardsPage() {
  if (!isDatabaseConfigured()) {
    return <DatabaseSetupNotice />;
  }

  let cards: CardRecord[] = [];
  let dbError: string | null = null;

  try {
    cards = (await prisma.card.findMany({
      orderBy: { createdAt: "desc" },
    })) as CardRecord[];
  } catch (err: any) {
    console.error("[AdminCardsPage] Erro no Prisma:", err?.message || err);
    dbError = err?.message || "Erro desconhecido ao acessar o banco de dados.";
  }

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
          <Link href="/admin/cards" className="btn-secondary">
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
          <span className="kicker">Carteirinhas</span>
          <h1 className="page-title">Gerenciar carteirinhas</h1>
          <p className="page-subtitle">
            Edite, exclua e visualize as carteirinhas públicas geradas para os
            alunos.
          </p>
        </div>
        <Link href="/admin/cards/new" className="btn">
          Nova carteirinha
        </Link>
      </section>

      <section className="panel">
        {cards.length === 0 ? (
          <div className="empty-state">
            <h2 className="empty-title">Ainda não existem carteirinhas</h2>
            <p className="helper-text">
              Clique em “Nova carteirinha” para cadastrar a primeira credencial.
            </p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Foto</th>
                  <th>Nome</th>
                  <th>Curso</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {cards.map((card) => (
                  <tr key={card.id}>
                    <td>
                      <div className="avatar">
                        <img src={card.fotoUrl} alt={card.nome} />
                      </div>
                    </td>
                    <td>
                      <strong>{card.nome}</strong>
                      <div className="helper-text">
                        Código {card.codigo ?? "não informado"} •{" "}
                        {card.campus ?? "Sem campus"}
                      </div>
                    </td>
                    <td>{card.curso}</td>
                    <td>
                      <StatusBadge status={card.status} />
                    </td>
                    <td>{formatDateTime(card.createdAt)}</td>
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
                        <DeleteCardButton id={card.id} />
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
