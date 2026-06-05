import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { UserFormData } from '@/types/user'
import { useRef } from 'react'
import { UserCircle } from 'lucide-react'

const schema = z.object({
  nome: z.string().min(3, 'Nome obrigatório'),
  codigo: z.string().min(1, 'Código obrigatório'),
  atribuicao: z.enum(['Aluno', 'Professor', 'Funcionário']),
  rg: z.string().min(1, 'RG obrigatório'),
  cpf: z.string().min(11, 'CPF inválido'),
  dataNascimento: z.string().min(1, 'Data obrigatória'),
  campus: z.string().min(1, 'Campus obrigatório'),
  curso: z.string().min(1, 'Curso obrigatório'),
  codigoAcesso: z.string().min(1, 'Código de acesso obrigatório'),
  foto: z.string().nullable(),
})

interface UserFormProps {
  defaultValues?: Partial<UserFormData>
  onSubmit: (data: UserFormData) => void
  onCancel: () => void
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  padding: '10px 14px', fontSize: 13,
  border: '1px solid #e2e8f0', borderRadius: 10,
  outline: 'none', color: '#1e293b',
  background: '#f8fafc', fontFamily: 'inherit',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12,
  fontWeight: 600, color: '#64748b',
  marginBottom: 5, letterSpacing: 0.3,
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
      {error && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{error}</p>}
    </div>
  )
}

export function UserForm({ defaultValues, onSubmit, onCancel }: UserFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(schema),
    defaultValues: { atribuicao: 'Aluno', foto: null, ...defaultValues },
  })
  const foto = watch('foto')

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setValue('foto', ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Foto */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: '16px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: 80, height: 88, borderRadius: 12, flexShrink: 0,
            border: '2px dashed #cbd5e1', background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', overflow: 'hidden',
          }}
        >
          {foto
            ? <img src={foto} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <UserCircle size={32} color="#cbd5e1" />
          }
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFotoChange} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>Foto do usuário</p>
          <p style={{ fontSize: 12, color: '#94a3b8' }}>JPG, PNG — máx. 5MB</p>
          {foto && (
            <button type="button" onClick={() => setValue('foto', null)}
              style={{ fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 6 }}>
              Remover
            </button>
          )}
        </div>
      </div>

      {/* Nome */}
      <div style={{ marginBottom: 14 }}>
        <Field label="Nome completo" error={errors.nome?.message}>
          <input {...register('nome')} style={inputStyle} placeholder="Ex: João da Silva" />
        </Field>
      </div>

      {/* Grid 2 colunas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <Field label="Código (matrícula)" error={errors.codigo?.message}>
          <input {...register('codigo')} style={inputStyle} placeholder="Ex: 7362946285" />
        </Field>
        <Field label="Atribuição" error={errors.atribuicao?.message}>
          <select {...register('atribuicao')} style={inputStyle}>
            <option>Aluno</option>
            <option>Professor</option>
            <option>Funcionário</option>
          </select>
        </Field>
        <Field label="RG" error={errors.rg?.message}>
          <input {...register('rg')} style={inputStyle} placeholder="Ex: MG-22.814.943" />
        </Field>
        <Field label="CPF" error={errors.cpf?.message}>
          <input {...register('cpf')} style={inputStyle} placeholder="Ex: 128.146.736-70" />
        </Field>
        <Field label="Data de Nascimento" error={errors.dataNascimento?.message}>
          <input {...register('dataNascimento')} type="date" style={inputStyle} />
        </Field>
        <Field label="Campus" error={errors.campus?.message}>
          <input {...register('campus')} style={inputStyle} placeholder="Ex: Campus Poços de Caldas" />
        </Field>
        <Field label="Curso" error={errors.curso?.message}>
          <input {...register('curso')} style={inputStyle} placeholder="Ex: Administração" />
        </Field>
        <Field label="Código de Acesso (QR)" error={errors.codigoAcesso?.message}>
          <input {...register('codigoAcesso')} style={inputStyle} placeholder="Ex: 00807683" />
        </Field>
      </div>

      {/* Botões */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
        <button type="button" onClick={onCancel}
          style={{ padding: '10px 20px', fontSize: 13, borderRadius: 10, cursor: 'pointer', background: '#fff', border: '1px solid #e2e8f0', color: '#64748b', fontFamily: 'inherit' }}>
          Cancelar
        </button>
        <button type="submit"
          style={{ padding: '10px 24px', fontSize: 13, fontWeight: 600, borderRadius: 10, cursor: 'pointer', background: '#1a3a6b', border: 'none', color: '#fff', fontFamily: 'inherit' }}>
          Salvar
        </button>
      </div>
    </form>
  )
}
