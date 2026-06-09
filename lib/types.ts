export interface CardRecord {
  id: string;
  nome: string;
  codigo: string | null;
  cpf: string;
  atribuicao: string | null;
  rg: string | null;
  campus: string | null;
  nascimento: Date | null;
  curso: string;
  codigoAcesso: string | null;
  instituicao: string;
  validade: Date;
  fotoUrl: string;
  status: string;
  createdAt: Date;
  origem: string;
  alunoUsuario: string;
  alunoSenhaHash: string;
}
