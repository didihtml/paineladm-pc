import Link from "next/link";
import { notFound } from "next/navigation";
import { CardForm } from "@/components/cards/CardForm";
import { DisciplinesEditor } from "@/components/cards/DisciplinesEditor";
import { StudentDataEditor } from "@/components/cards/StudentDataEditor";
import { MobileCardPreview } from "@/components/cards/MobileCardPreview";
import { DeleteCardButton } from "@/components/ui/DeleteCardButton";
import { DatabaseSetupNotice } from "@/components/admin/DatabaseSetupNotice";
import { prisma } from "@/lib/prisma";
import { isDatabaseConfigured } from "@/lib/env";
import {
  buildPublicCardUrl,
  toDateInputValue,
} from "@/lib/utils";
import type { CardRecord } from "@/lib/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCardDetailsPage({ params }: PageProps) {
  if (!isDatabaseConfigured()) {
    return <DatabaseSetupNotice />;
  }

  const { id } = await params;
  let card: CardRecord | null = null;
  let dbError: string | null = null;

  try {
    card = (await prisma.card.findUnique({
      where: { id },
    })) as CardRecord | null;
  } catch (err: any) {
    console.error(
      "[AdminCardDetailsPage] Erro no Prisma:",
      err?.message || err,
    );
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
            Voltar para carteirinhas
          </Link>
        </div>
      </section>
    );
  }

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

      <section className="detail-grid admin-card-details">
        <div className="admin-card-editor">
          <CardForm
            mode="edit"
            initialData={{
              id: card.id,
              nome: card.nome,
              codigo: card.codigo,
              cpf: card.cpf,
              atribuicao: card.atribuicao,
              rg: card.rg,
              campus: card.campus,
              nascimento: card.nascimento
                ? toDateInputValue(card.nascimento)
                : null,
              curso: card.curso,
              codigoAcesso: card.codigoAcesso,
              fotoUrl: card.fotoUrl,
            }}
          />
        </div>

        <div className="admin-card-summary">
          <MobileCardPreview card={card} />
        </div>
      </section>
      <DisciplinesEditor cardId={card.id} />
      <StudentDataEditor cardId={card.id} />
    </>
  );
}
