import { QRCodeSVG as QRCode } from "qrcode.react";
import { KeyRound, UserRound } from "lucide-react";
import { formatBirthDate, buildPublicCardUrl } from "@/lib/utils";
import type { CardRecord } from "@/lib/types";

interface PublicCardProps {
  card: CardRecord;
}

export function PublicCard({ card }: PublicCardProps) {
  const publicUrl = buildPublicCardUrl(card.id);

  return (
    <article className="public-card">
      <div className="public-card-topbar" />

      <div className="public-card-body">
        <div className="public-card-main">
          <div className="public-card-photo">
            <img src={card.fotoUrl} alt={card.nome} />
          </div>

          <div className="public-card-fields">
            <div className="public-card-field">
              <small>Nome</small>
              <strong className="public-card-name">{card.nome}</strong>
            </div>
            <div className="public-card-field">
              <small>Código</small>
              <strong>{card.codigo ?? "Não informado"}</strong>
            </div>
          </div>
        </div>

        <div className="public-card-grid-items">
          <Field
            label="Atribuição"
            value={card.atribuicao ?? "Não informado"}
          />
          <Field label="RG" value={card.rg ?? "Não informado"} />
          <Field label="CPF" value={card.cpf} />
          <Field
            label="Nascimento"
            value={
              card.nascimento
                ? formatBirthDate(card.nascimento)
                : "Não informado"
            }
          />
          <Field label="Campus" value={card.campus ?? "Não informado"} />
          <Field label="Curso" value={card.curso} />
        </div>

        <div className="public-card-access">
          <div className="public-card-access-title">
            <UserRound size={16} />
            <span>Credencial de acesso</span>
          </div>

          <div className="public-card-access-body">
            <div className="public-card-qr">
              <QRCode value={publicUrl} size={112} />
            </div>

            <div className="public-card-access-code">
              <small>Código</small>
              <strong>{card.codigoAcesso ?? "Não informado"}</strong>
              <div className="public-card-access-hint">
                <KeyRound size={14} />
                <span>Use este código para identificar a credencial</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="public-card-field">
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}
