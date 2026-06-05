import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUsersStore } from '@/store/usersStore'
import { UserForm } from '@/components/users/UserForm'
import type { User, UserFormData } from '@/types/user'
import { Plus, Pencil, Trash2, CreditCard, Search } from 'lucide-react'

export function Users() {
  const navigate = useNavigate()
  const { users, addUser, updateUser, deleteUser } = useUsersStore()

  const [modal, setModal] = useState<{ open: boolean; editing: User | null }>({ open: false, editing: null })
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const filtered = users.filter((u) =>
    u.nome.toLowerCase().includes(search.toLowerCase()) ||
    u.codigo.includes(search) ||
    u.curso.toLowerCase().includes(search.toLowerCase())
  )

  function handleSubmit(data: UserFormData) {
    if (modal.editing) {
      updateUser(modal.editing.id, data)
    } else {
      addUser(data)
    }
    setModal({ open: false, editing: null })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Usuários</h2>
        <button
          onClick={() => setModal({ open: true, editing: null })}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a4080] text-white text-sm font-medium rounded-lg hover:bg-[#163060] transition-colors"
        >
          <Plus size={16} />
          Novo usuário
        </button>
      </div>

      {/* Busca */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, código ou curso..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">
            {search ? 'Nenhum resultado encontrado.' : 'Nenhum usuário cadastrado.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left bg-slate-50">
                <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase">Nome</th>
                <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase">Código</th>
                <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase">Curso</th>
                <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase">Atribuição</th>
                <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {user.foto ? (
                        <img src={user.foto} alt={user.nome} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                          {user.nome[0]}
                        </div>
                      )}
                      <span className="font-medium text-slate-800">{user.nome}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{user.codigo}</td>
                  <td className="px-5 py-3 text-slate-500">{user.curso}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      {user.atribuicao}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/carteirinha?id=${user.id}`)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver carteirinha"
                      >
                        <CreditCard size={15} />
                      </button>
                      <button
                        onClick={() => setModal({ open: true, editing: user })}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(user.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de cadastro/edição */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {modal.editing ? 'Editar usuário' : 'Novo usuário'}
              </h3>
            </div>
            <div className="p-6">
              <UserForm
                defaultValues={modal.editing ?? undefined}
                onSubmit={handleSubmit}
                onCancel={() => setModal({ open: false, editing: null })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Confirmação de exclusão */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Confirmar exclusão</h3>
            <p className="text-sm text-slate-500 mb-5">Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
                Cancelar
              </button>
              <button
                onClick={() => { deleteUser(confirmDelete); setConfirmDelete(null) }}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
