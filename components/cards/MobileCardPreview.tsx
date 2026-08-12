import { PublicCard } from "@/components/cards/PublicCard";
import type { CardRecord } from "@/lib/types";

export function MobileCardPreview({ card }: { card: CardRecord }) {
  return (
    <section className="mobile-card-preview" aria-label="Prévia da carteirinha no celular">
      <div className="mobile-card-preview-screen">
        <PublicCard card={card} />
      </div>
    </section>
  );
}
