'use client'

import { useMemo, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, ExternalLink, Save } from 'lucide-react'
import { toast } from 'sonner'
import { createCardAction, updateCardAction } from '@/actions/cards'
import { CopyLinkButton } from '@/components/ui/CopyLinkButton'
import { buildPublicCardUrl, toDateInputValue } from '@/lib/utils'
import { cardFormSchema, type CardFormValues } from '@/lib/validations/card'

interface CardFormProps {
  mode: 'create' | 'edit'
  initialData?: {
    id: string
    nome: string
    cpf: string
    curso: string
    instituicao: string
    validade: Date | string
    fotoUrl: string
    status: 'ATIVA' | 'INATIVA'
  }
}

interface CreateResultData {
  id: string
  publicUrl: string
}

export function CardForm({ mode, initialData }: CardFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isPending, startTransition] = useTransition()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.fotoUrl ?? null)
  const [fileError, setFileError] = useState<string>('')
  const [resultData, setResultData] = useState<CreateResultData | null>(
    initialData
      ? {
          id: initialData.id,
          publicUrl: buildPublicCardUrl(initialData.id),
        }
      : null
  )

  const defaultValues = useMemo<CardFormValues>(
    () => ({
      nome: initialData?.nome ?? '',
      cpf: initialData?.cpf ?? '',
      curso: initialData?.curso ?? '',
      instituicao: initialData?.instituicao ?? '',
      validade: initialData?.validade ? toDateInputValue(initialData.validade) : '',
      status: initialData?.status ?? 'ATIVA',
    }),
    [initialData]
  )

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CardFormValues>({
    resolver: zodResolver(cardFormSchema),
    defaultValues,
  })

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setSelectedFile(file)
    setFileError('')

    if (!file) {
      setPreviewUrl(initialData?.fotoUrl ?? null)
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
  }

  function handleRemovePhoto() {
    setSelectedFile(null)
    setPreviewUrl(initialData?.fotoUrl ?? null)
    setFileError('')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const publicUrl = resultData?.publicUrl ?? ''

  const onSubmit = handleSubmit((values) => {
    setFileError('')

    if (mode === 'create' && !selectedFile) {
      setFileError('Envie uma foto para criar a carteirinha.')
      toast.error('Envie uma foto para criar a carteirinha.')
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.set('nome', values.nome)
      formData.set('cpf', values.cpf)
      formData.set('curso', values.curso)
      formData.set('instituicao', values.instituicao)
      formData.set('validade', values.validade)
      formData.set('status', values.status)

      if (selectedFile) {
        formData.set('foto', selectedFile)
      }

      const result =
        mode === 'create'
          ? await createCardAction(formData)
          : await updateCardAction(initialData!.id, formData)

      if (!result.success) {
        toast.error(result.message)

        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            const message = messages?.[0]
            if (!message) return

            if (field === 'foto') {
              setFileError(message)
              return
            }

            setError(field as keyof CardFormValues, { message })
          })
        }

        return
      }

      toast.success(result.message)
      setResultData(result.data ?? null)
      setSelectedFile(null)
      if (mode === 'edit') {
        router.refresh()
      }
    })
  })

  return (
    <div className="surface-card">
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ margin: 0, fontSize: '1.35rem' }}>
          {mode === 'create' ? 'Nova carteirinha' : 'Editar carteirinha'}
        </h2>
        <p className="helper-text" style={{ marginTop: 8 }}>
          Faça o upload da foto, valide os dados e gere o link público da carteirinha.
        </p>
      </div>

      <form onSubmit={onSubmit} className="form-grid-single">
        <div className="photo-picker">
          <div className="photo-preview">
            {previewUrl ? <img src={previewUrl} alt="Pré-visualização" /> : <Camera size={34} color="#94a3b8" />}
          </div>

          <div>
            <strong style={{ color: '#0f172a' }}>Foto da carteirinha</strong>
            <p className="helper-text" style={{ marginTop: 8 }}>
              Envie uma imagem JPG, PNG ou WebP com até 5MB. A imagem ficará pública no portal da carteirinha.
            </p>

            <div className="photo-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                Escolher foto
              </button>

              {(selectedFile || previewUrl) && (
                <button type="button" className="btn-ghost" onClick={handleRemovePhoto}>
                  Remover
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {fileError ? <span className="field-error">{fileError}</span> : null}
          </div>
        </div>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="nome">Nome</label>
            <input id="nome" {...register('nome')} placeholder="Ex: João da Silva" />
            {errors.nome ? <span className="field-error">{errors.nome.message}</span> : null}
          </div>

          <div className="field">
            <label htmlFor="cpf">CPF</label>
            <input id="cpf" {...register('cpf')} placeholder="Ex: 123.456.789-00" />
            {errors.cpf ? <span className="field-error">{errors.cpf.message}</span> : null}
          </div>

          <div className="field">
            <label htmlFor="curso">Curso</label>
            <input id="curso" {...register('curso')} placeholder="Ex: Engenharia de Software" />
            {errors.curso ? <span className="field-error">{errors.curso.message}</span> : null}
          </div>

          <div className="field">
            <label htmlFor="instituicao">Instituição</label>
            <input id="instituicao" {...register('instituicao')} placeholder="Ex: PUC Minas" />
            {errors.instituicao ? <span className="field-error">{errors.instituicao.message}</span> : null}
          </div>

          <div className="field">
            <label htmlFor="validade">Validade</label>
            <input id="validade" type="date" {...register('validade')} />
            {errors.validade ? <span className="field-error">{errors.validade.message}</span> : null}
          </div>

          <div className="field">
            <label htmlFor="status">Status</label>
            <select id="status" {...register('status')}>
              <option value="ATIVA">Ativa</option>
              <option value="INATIVA">Inativa</option>
            </select>
            {errors.status ? <span className="field-error">{errors.status.message}</span> : null}
          </div>
        </div>

        <div className="actions-row">
          <button type="submit" className="btn" disabled={isPending}>
            <Save size={16} />
            {isPending
              ? mode === 'create'
                ? 'Criando carteirinha...'
                : 'Salvando alterações...'
              : mode === 'create'
                ? 'Criar carteirinha'
                : 'Salvar alterações'}
          </button>

          {publicUrl ? (
            <>
              <Link href={publicUrl} className="btn-secondary" target="_blank">
                <ExternalLink size={16} />
                Abrir link público
              </Link>
              <CopyLinkButton value={publicUrl} />
            </>
          ) : null}
        </div>
      </form>

      {resultData ? (
        <div className="result-box" style={{ marginTop: 22 }}>
          <span className="kicker">Resultado</span>
          <div>
            <strong>ID gerado</strong>
            <div className="result-value">{resultData.id}</div>
          </div>
          <div>
            <strong>Link público</strong>
            <div className="result-value">{resultData.publicUrl}</div>
          </div>
          <div className="actions-row">
            <CopyLinkButton value={resultData.publicUrl} />
            <Link href={resultData.publicUrl} target="_blank" className="btn-secondary">
              <ExternalLink size={16} />
              Visualizar página pública
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}
