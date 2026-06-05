import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <main className="page-shell">
      <section className="panel empty-state">
        <h1 className="empty-title">Página não encontrada</h1>
        <p className="helper-text">O recurso solicitado não foi localizado neste portal.</p>
        <div className="actions-row" style={{ justifyContent: 'center', marginTop: 18 }}>
          <Link href="/admin/dashboard" className="btn-secondary">
            Ir para o dashboard
          </Link>
        </div>
      </section>
    </main>
  )
}
