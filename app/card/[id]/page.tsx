import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { PublicCard } from '@/components/cards/PublicCard'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PublicCardPage({ params }: PageProps) {
  const { id } = await params
  const card = await prisma.card.findUnique({ where: { id } })

  return (
    <main className="page-shell">
      {card ? (
        <section className="public-card-grid">
          <div className="panel">
            <span className="kicker">Carteirinha pública</span>
            <h1 className="page-title">Validação da credencial</h1>
            <p className="page-subtitle">
              Esta página pública exibe os dados oficiais da carteirinha encontrada no PostgreSQL.
            </p>

            <div className="meta-grid" style={{ marginTop: 18 }}>
              <div className="meta-card">
                <p className="meta-label">ID</p>
                <p className="meta-value">{card.id}</p>
              </div>
              <div className="meta-card">
                <p className="meta-label">Status da consulta</p>
                <p className="meta-value">Carteirinha encontrada</p>
              </div>
            </div>
          </div>

          <PublicCard card={card} />
        </section>
      ) : (
        <section className="panel empty-state">
          <h1 className="empty-title">Carteirinha não encontrada</h1>
          <p className="helper-text">
            O ID informado não existe no banco de dados ou a carteirinha foi removida.
          </p>
          <div className="actions-row" style={{ justifyContent: 'center', marginTop: 18 }}>
            <Link href="/admin/login" className="btn-secondary">
              Voltar ao admin
            </Link>
          </div>
        </section>
      )}
    </main>
  )
}
