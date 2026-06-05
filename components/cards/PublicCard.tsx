import {
  Building2,
  CalendarDays,
  GraduationCap,
  IdCard,
  ShieldCheck,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { CardRecord } from "@/lib/types";

interface PublicCardProps {
  card: CardRecord;
}

export function PublicCard({ card }: PublicCardProps) {
  return (
    <article className="public-card">
      <div className="public-card-header">
        <div>
          <small
            style={{
              opacity: 0.72,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
            }}
          >
            Carteirinha digital
          </small>
          <h2 style={{ margin: "8px 0 0", fontSize: "1.2rem" }}>
            Portal de validação
          </h2>
        </div>
        <StatusBadge status={card.status} />
      </div>

      <div className="public-card-body">
        <div className="public-card-main">
          <div className="public-card-photo">
            <img src={card.fotoUrl} alt={card.nome} />
          </div>

          <div className="public-card-fields">
            <div className="public-card-field">
              <small>Nome</small>
              <strong style={{ fontSize: "1.5rem" }}>{card.nome}</strong>
            </div>
            <div className="public-card-field">
              <small>ID</small>
              <strong>{card.id}</strong>
            </div>
            <div className="public-card-field">
              <small>CPF</small>
              <strong>{card.cpf}</strong>
            </div>
          </div>
        </div>

        <div className="public-card-grid-items">
          <Field
            icon={<GraduationCap size={16} />}
            label="Curso"
            value={card.curso}
          />
          <Field
            icon={<Building2 size={16} />}
            label="Instituição"
            value={card.instituicao}
          />
          <Field
            icon={<CalendarDays size={16} />}
            label="Validade"
            value={formatDate(card.validade)}
          />
          <Field
            icon={<ShieldCheck size={16} />}
            label="Status"
            value={card.status === "ATIVA" ? "Ativa" : "Inativa"}
          />
          <Field
            icon={<IdCard size={16} />}
            label="Criada em"
            value={formatDate(card.createdAt)}
          />
        </div>
      </div>
    </article>
  );
}

function Field({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="public-card-field">
      <small style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {icon}
        {label}
      </small>
      <strong>{value}</strong>
    </div>
  );
}
