import { z } from "zod";

export const cardFormSchema = z.object({
  nome: z.string().min(3, "Informe o nome completo"),
  codigo: z.string().min(1, "Informe o código").max(10, "O código deve ter no máximo 10 caracteres"),
  cpf: z.string().min(11, "Informe um CPF válido"),
  atribuicao: z.string().min(2, "Informe a atribuição"),
  rg: z.string().min(2, "Informe o RG"),
  nascimento: z
    .string()
    .min(1, "Informe a data de nascimento")
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: "Informe uma data válida",
    }),
  campus: z.string().min(2, "Informe o campus"),
  curso: z.string().min(2, "Informe o curso"),
  codigoAcesso: z.string().min(1, "Informe o código de acesso").max(8, "O código de acesso deve ter no máximo 8 caracteres"),
});

export type CardFormValues = z.infer<typeof cardFormSchema>;
