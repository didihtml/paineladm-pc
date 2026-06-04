import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useUsersStore } from '@/store/usersStore'
import { CarteirinhaCard } from '@/components/carteirinha/CarteirinhaCard'
import { exportCarteirinhaAsPDF, exportCarteirinhaAsImage } from '@/utils/exportCarteirinha'
import { ArrowLeft, Download, Image } from 'lucide-react'

export function Carteirinha() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const users = useUsersStore((s) => s.users)

  const [selectedId, setSelectedId] = useState(searchParams.get('id') ?? '')

  const selectedUser = users.find((u) => u.id === selectedId)

  return (
    <div>
      {/* Voltar */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-5 transition-colors"
      >
        <ArrowLeft size={16} />
        Voltar
      </button>

      <h2 className="text-xl font-bold text-slate-800 mb-4">Carteirinha</h2>

      {/* Seletor */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-5">
        <label className="block text-xs font-medium text-slate-500 mb-2">Selecionar aluno</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] bg-white"
        >
          <option value="">-- Escolha um usuário --</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.nome}</option>
          ))}
        </select>
      </div>

      {/* Preview */}
      {selectedUser ? (
        <>
          <div className="flex justify-center mb-5">
            <CarteirinhaCard user={selectedUser} id="carteirinha-export" />
          </div>

          {/* Botões export */}
          <div className="flex gap-3">
            <button
              onClick={() => exportCarteirinhaAsPDF('carteirinha-export', `carteirinha-${selectedUser.nome}`)}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1a3a6b] text-white text-sm font-semibold rounded-xl hover:bg-[#163060] transition-colors"
            >
              <Download size={15} />
              Exportar PDF
            </button>
            <button
              onClick={() => exportCarteirinhaAsImage('carteirinha-export', `carteirinha-${selectedUser.nome}`)}
              className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Image size={15} />
              Salvar Imagem
            </button>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-slate-400 text-sm">
          Selecione um usuário para visualizar a carteirinha
        </div>
      )}
    </div>
  )
}
