import { z } from 'zod'

export const cardStatusSchema = z.enum(['ATIVA', 'INATIVA'])

export const cardFormSchema = z.object({
  nome: z.string().min(3, 'Informe o nome completo'),
  cpf: z.string().min(11, 'Informe um CPF válido'),
  curso: z.string().min(2, 'Informe o curso'),
  instituicao: z.string().min(2, 'Informe a instituição'),
  validade: z.string().min(1, 'Informe a validade').refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Informe uma data válida',
  }),
  status: cardStatusSchema,
})

export type CardFormValues = z.infer<typeof cardFormSchema>
