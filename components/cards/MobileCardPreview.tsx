import { Bell } from "lucide-react";
import { PublicCard } from "@/components/cards/PublicCard";
import type { CardRecord } from "@/lib/types";

export function MobileCardPreview({ card }: { card: CardRecord }) {
  return (
    <section className="mobile-card-preview" aria-label="Prévia da carteirinha no celular">
      <header className="mobile-card-preview-header">
        <span>Cartões de acesso</span>
        <Bell size={18} strokeWidth={1.8} />
      </header>
      <div className="mobile-card-preview-screen">
        <PublicCard card={card} />
        <div className="mobile-card-preview-dots" aria-hidden="true"><i /><i /></div>
      </div>
    </section>
  );
}
