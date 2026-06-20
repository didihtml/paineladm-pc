"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  buildPublicCardUrl,
  buildStudentLoginUrl,
  type ActionResult,
} from "@/lib/utils";
import { requireAdminSession } from "@/lib/auth";
import { removeCardImage, saveCardImage } from "@/lib/storage";
import { cardFormSchema } from "@/lib/validations/card";
import { STUDENT_DEFAULT_ORIGIN } from "@/lib/constants";
import {
  generateStudentPassword,
  generateStudentUsername,
  hashStudentPassword,
} from "@/lib/student-access";

interface CardActionData {
  id: string;
  publicUrl: string;
  studentLoginUrl: string;
  studentUsername: string;
  studentPassword?: string;
  studentOrigin: string;
}

function extractPayload(formData: FormData) {
  return {
    nome: String(formData.get("nome") ?? "").trim(),
    codigo: String(formData.get("codigo") ?? "").trim(),
    cpf: String(formData.get("cpf") ?? "").trim(),
    atribuicao: String(formData.get("atribuicao") ?? "").trim(),
    rg: String(formData.get("rg") ?? "").trim(),
    campus: String(formData.get("campus") ?? "").trim(),
    nascimento: String(formData.get("nascimento") ?? "").trim(),
    curso: String(formData.get("curso") ?? "").trim(),
    codigoAcesso: String(formData.get("codigoAcesso") ?? "").trim(),
  };
}

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

function revalidateCardPaths(id?: string) {
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/cards");
  revalidatePath("/admin/cards/new");
  revalidatePath("/aluno/login");
  revalidatePath("/aluno/carteirinha");

  if (id) {
    revalidatePath(`/admin/cards/${id}`);
    revalidatePath(`/card/${id}`);
    revalidatePath(`/aluno/carteirinha`);
  }
}

export async function createCardAction(
  formData: FormData,
): Promise<ActionResult<CardActionData>> {
  await requireAdminSession();

  const parsed = cardFormSchema.safeParse(extractPayload(formData));
  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos informados.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const photo = formData.get("foto");
  if (!(photo instanceof File) || photo.size === 0) {
    return {
      success: false,
      message: "Envie uma foto para criar a carteirinha.",
      fieldErrors: { foto: ["Envie uma foto."] },
    };
  }

  if (!photo.type.startsWith("image/")) {
    return {
      success: false,
      message: "A foto precisa ser uma imagem válida.",
      fieldErrors: { foto: ["Selecione uma imagem válida."] },
    };
  }

  if (photo.size > 5 * 1024 * 1024) {
    return {
      success: false,
      message: "A foto deve ter no máximo 5MB.",
      fieldErrors: { foto: ["A imagem deve ter no máximo 5MB."] },
    };
  }

  const id = crypto.randomUUID();
  const studentUsername = parsed.data.cpf;
  const studentPassword = generateStudentPassword();
  const studentPasswordHash = hashStudentPassword(studentPassword);
  const upload = await saveCardImage(photo, id);

  try {
    await prisma.card.create({
      data: {
        id,
        ...parsed.data,
        nascimento: normalizeDate(parsed.data.nascimento),
        instituicao: parsed.data.campus,
        validade: buildDefaultValidity(),
        status: "ATIVA",
        fotoUrl: upload.publicUrl,
        origem: STUDENT_DEFAULT_ORIGIN,
        alunoUsuario: studentUsername,
        alunoSenhaHash: studentPasswordHash,
      },
    });
  } catch (error) {
    await removeCardImage(upload.publicUrl);
    console.error(error);

    return {
      success: false,
      message: "Não foi possível salvar a carteirinha no banco de dados.",
    };
  }

  revalidateCardPaths(id);

  return {
    success: true,
    message: "Carteirinha criada com sucesso.",
    data: {
      id,
      publicUrl: buildPublicCardUrl(id),
      studentLoginUrl: buildStudentLoginUrl(),
      studentUsername: studentUsername,
      studentPassword,
      studentOrigin: STUDENT_DEFAULT_ORIGIN,
    },
  };
}

export async function updateCardAction(
  id: string,
  formData: FormData,
): Promise<ActionResult<CardActionData>> {
  await requireAdminSession();

  const parsed = cardFormSchema.safeParse(extractPayload(formData));
  if (!parsed.success) {
    return {
      success: false,
      message: "Verifique os campos informados.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const existingCard = await prisma.card.findUnique({ where: { id } });
  if (!existingCard) {
    return {
      success: false,
      message: "Carteirinha não encontrada.",
    };
  }

  let fotoUrl = existingCard.fotoUrl;
  const photo = formData.get("foto");

  if (photo instanceof File && photo.size > 0) {
    if (!photo.type.startsWith("image/")) {
      return {
        success: false,
        message: "A foto precisa ser uma imagem válida.",
        fieldErrors: { foto: ["Selecione uma imagem válida."] },
      };
    }

    if (photo.size > 5 * 1024 * 1024) {
      return {
        success: false,
        message: "A foto deve ter no máximo 5MB.",
        fieldErrors: { foto: ["A imagem deve ter no máximo 5MB."] },
      };
    }

    const upload = await saveCardImage(photo, id);
    fotoUrl = upload.publicUrl;

    if (existingCard.fotoUrl !== fotoUrl) {
      await removeCardImage(existingCard.fotoUrl);
    }
  }

  try {
    await prisma.card.update({
      where: { id },
      data: {
        ...parsed.data,
        nascimento: normalizeDate(parsed.data.nascimento),
        instituicao: parsed.data.campus,
        validade: existingCard.validade,
        status: existingCard.status,
        fotoUrl,
      },
    });
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Não foi possível atualizar a carteirinha.",
    };
  }

  revalidateCardPaths(id);

  return {
    success: true,
    message: "Carteirinha atualizada com sucesso.",
    data: {
      id,
      publicUrl: buildPublicCardUrl(id),
      studentLoginUrl: buildStudentLoginUrl(),
      studentUsername: existingCard.alunoUsuario,
      studentOrigin: existingCard.origem,
    },
  };
}

export async function resetStudentPasswordAction(
  id: string,
): Promise<ActionResult<Omit<CardActionData, "publicUrl" | "id">>> {
  await requireAdminSession();

  const existingCard = await prisma.card.findUnique({ where: { id } });
  if (!existingCard) {
    return {
      success: false,
      message: "Carteirinha não encontrada.",
    };
  }

  const studentPassword = generateStudentPassword();
  const studentPasswordHash = hashStudentPassword(studentPassword);

  try {
    await prisma.card.update({
      where: { id },
      data: { alunoSenhaHash: studentPasswordHash },
    });
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Não foi possível redefinir a senha do aluno.",
    };
  }

  revalidateCardPaths(id);

  return {
    success: true,
    message: "Nova senha gerada com sucesso.",
    data: {
      studentLoginUrl: buildStudentLoginUrl(),
      studentUsername: existingCard.alunoUsuario,
      studentPassword,
      studentOrigin: existingCard.origem,
    },
  };
}

export async function deleteCardAction(id: string): Promise<ActionResult> {
  await requireAdminSession();

  const existingCard = await prisma.card.findUnique({ where: { id } });
  if (!existingCard) {
    return {
      success: false,
      message: "Carteirinha não encontrada.",
    };
  }

  try {
    await prisma.card.delete({ where: { id } });
    await removeCardImage(existingCard.fotoUrl);
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Não foi possível excluir a carteirinha.",
    };
  }

  revalidateCardPaths(id);

  return {
    success: true,
    message: "Carteirinha excluída com sucesso.",
  };
}
