import { CardForm } from '@/components/cards/CardForm'

export const dynamic = 'force-dynamic'

export default function NewCardPage() {
  return (
    <>
      <section className="panel page-header">
        <div>
          <span className="kicker">Nova carteirinha</span>
          <h1 className="page-title">Criar e publicar nova credencial</h1>
          <p className="page-subtitle">O sistema faz upload da foto, gera um UUID, salva no PostgreSQL e devolve o link público.</p>
        </div>
      </section>

      <CardForm mode="create" />
    </>
  )
}
