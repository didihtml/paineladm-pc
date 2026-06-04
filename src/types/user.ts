export type Atribuicao = 'Aluno' | 'Professor' | 'Funcionário'

export interface User {
  id: string
  nome: string
  codigo: string
  atribuicao: Atribuicao
  rg: string
  cpf: string
  dataNascimento: string
  campus: string
  curso: string
  codigoAcesso: string
  foto: string | null
  criadoEm: string
}

export type UserFormData = Omit<User, 'id' | 'criadoEm'>
