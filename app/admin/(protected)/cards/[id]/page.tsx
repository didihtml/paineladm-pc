import Link from "next/link";
import { notFound } from "next/navigation";
import { CardForm } from "@/components/cards/CardForm";
import { PublicCard } from "@/components/cards/PublicCard";
import { DeleteCardButton } from "@/components/ui/DeleteCardButton";
import { CopyLinkButton } from "@/components/ui/CopyLinkButton";
import { DatabaseSetupNotice } from "@/components/admin/DatabaseSetupNotice";
import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/env";
import { buildPublicCardUrl, formatDate, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCardDetailsPage({ params }: PageProps) {
  if (!isDatabaseConfigured()) {
    return <DatabaseSetupNotice />;
  }

  const { id } = await params;
  const card = await prisma.card.findUnique({ where: { id } });

  if (!card) {
    notFound();
  }

  const publicUrl = buildPublicCardUrl(card.id);

  return (
    <>
      <section className="panel page-header">
        <div>
          <span className="kicker">Detalhes da carteirinha</span>
          <h1 className="page-title">{card.nome}</h1>
          <p className="page-subtitle">
            Edite os dados, copie o link público e acompanhe as informações da
            credencial.
          </p>
        </div>
        <div className="actions-row">
          <Link href={publicUrl} target="_blank" className="btn-secondary">
            Visualizar página pública
          </Link>
          <DeleteCardButton id={card.id} redirectTo="/admin/cards" />
        </div>
      </section>

      <section className="detail-grid">
        <div style={{ display: "grid", gap: 16 }}>
          <CardForm
            mode="edit"
            initialData={{
              id: card.id,
              nome: card.nome,
              cpf: card.cpf,
              curso: card.curso,
              instituicao: card.instituicao,
              validade: card.validade,
              fotoUrl: card.fotoUrl,
              status: card.status === "ATIVA" ? "ATIVA" : "INATIVA",
            }}
          />
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <div className="panel">
            <div className="meta-grid">
              <div className="meta-card">
                <p className="meta-label">ID</p>
                <p className="meta-value">{card.id}</p>
              </div>
              <div className="meta-card">
                <p className="meta-label">Validade</p>
                <p className="meta-value">{formatDate(card.validade)}</p>
              </div>
              <div className="meta-card">
                <p className="meta-label">Criada em</p>
                <p className="meta-value">{formatDateTime(card.createdAt)}</p>
              </div>
              <div className="meta-card">
                <p className="meta-label">Link público</p>
                <p className="meta-value">{publicUrl}</p>
              </div>
            </div>

            <div className="actions-row" style={{ marginTop: 16 }}>
              <CopyLinkButton value={publicUrl} />
              <Link href={publicUrl} target="_blank" className="btn-secondary">
                Abrir link público
              </Link>
            </div>
          </div>

          <PublicCard card={card} />
        </div>
      </section>
    </>
  );
}
