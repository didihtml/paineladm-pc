import { CardForm } from '@/components/cards/CardForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function NewCardPage() {
  return (
    <>
      <section className="panel page-header">
        <div>
          <Link href="/admin/cards" className="back-button"><ArrowLeft size={16} />Voltar</Link>
          <h1 className="page-title">Criar e publicar nova credencial</h1>
          <p className="page-subtitle">O sistema faz upload da foto, gera um UUID, salva no PostgreSQL e devolve o link público.</p>
        </div>
      </section>

      <CardForm mode="create" />
    </>
  )
}
