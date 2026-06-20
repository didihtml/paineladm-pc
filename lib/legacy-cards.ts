import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { removeCardImage, saveCardImageDataUrl } from "@/lib/storage";
import { STUDENT_DEFAULT_ORIGIN } from "@/lib/constants";
import {
  generateStudentPassword,
  generateStudentUsername,
  hashStudentPassword,
} from "@/lib/student-access";
import type { CardRecord } from "@/lib/types";

export const legacyCardPayloadSchema = z.object({
  nome: z.string().min(3),
  codigo: z.string().min(1),
  atribuicao: z.enum(["Aluno", "Professor", "Funcionário"]),
  rg: z.string().min(1),
  cpf: z.string().min(11),
  dataNascimento: z.string().min(1),
  campus: z.string().min(1),
  curso: z.string().min(1),
  codigoAcesso: z.string().min(1),
  foto: z.string().nullable(),
});

export type LegacyCardPayload = z.infer<typeof legacyCardPayloadSchema>;

function normalizeDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function buildDefaultValidity() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

function toDateInputValue(date: Date | string | null) {
  if (!date) return "";

  const value = new Date(date);
  const year = value.getUTCFullYear();
  const month = `${value.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${value.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function resolvePhotoUrl(photoUrl: string | null | undefined, origin: string) {
  if (!photoUrl) return null;
  if (/^https?:\/\//i.test(photoUrl)) return photoUrl;
  return new URL(photoUrl, origin).toString();
}

export function mapCardToLegacyUser(card: CardRecord, origin: string) {
  return {
    id: card.id,
    nome: card.nome,
    codigo: card.codigo ?? "",
    atribuicao: (card.atribuicao ?? "Aluno") as
      | "Aluno"
      | "Professor"
      | "Funcionário",
    rg: card.rg ?? "",
    cpf: card.cpf,
    dataNascimento: toDateInputValue(card.nascimento),
    campus: card.campus ?? card.instituicao,
    curso: card.curso,
    codigoAcesso: card.codigoAcesso ?? "",
    foto: resolvePhotoUrl(card.fotoUrl, origin),
    criadoEm: new Date(card.createdAt).toISOString(),
  };
}

export async function createLegacyCard(data: LegacyCardPayload) {
  const id = crypto.randomUUID();
  const studentUsername = generateStudentUsername(data.nome, id);
  const studentPassword = generateStudentPassword();
  const studentPasswordHash = hashStudentPassword(studentPassword);

  if (!data.foto?.startsWith("data:image/")) {
    throw new Error("Envie uma foto válida para criar a carteirinha.");
  }

  const upload = await saveCardImageDataUrl(data.foto, id);

  try {
    const card = (await prisma.card.create({
      data: {
        id,
        nome: data.nome,
        codigo: data.codigo,
        cpf: data.cpf,
        atribuicao: data.atribuicao,
        rg: data.rg,
        campus: data.campus,
        nascimento: normalizeDate(data.dataNascimento),
        curso: data.curso,
        codigoAcesso: data.codigoAcesso,
        instituicao: data.campus,
        validade: buildDefaultValidity(),
        fotoUrl: upload.publicUrl,
        status: "ATIVA",
        origem: STUDENT_DEFAULT_ORIGIN,
        alunoUsuario: studentUsername,
        alunoSenhaHash: studentPasswordHash,
      },
    })) as CardRecord;

    return { card, studentUsername, studentPassword };
  } catch (error) {
    await removeCardImage(upload.publicUrl);
    throw error;
  }
}

export async function updateLegacyCard(id: string, data: LegacyCardPayload) {
  const existingCard = (await prisma.card.findUnique({
    where: { id },
  })) as CardRecord | null;

  if (!existingCard) {
    throw new Error("Carteirinha não encontrada.");
  }

  let fotoUrl = existingCard.fotoUrl;

  if (data.foto?.startsWith("data:image/")) {
    const upload = await saveCardImageDataUrl(data.foto, id);
    fotoUrl = upload.publicUrl;

    if (existingCard.fotoUrl !== fotoUrl) {
      await removeCardImage(existingCard.fotoUrl);
    }
  }

  const card = (await prisma.card.update({
    where: { id },
    data: {
      nome: data.nome,
      codigo: data.codigo,
      cpf: data.cpf,
      atribuicao: data.atribuicao,
      rg: data.rg,
      campus: data.campus,
      nascimento: normalizeDate(data.dataNascimento),
      curso: data.curso,
      codigoAcesso: data.codigoAcesso,
      instituicao: data.campus,
      fotoUrl,
    },
  })) as CardRecord;

  return card;
}
