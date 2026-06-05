'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { buildPublicCardUrl, type ActionResult } from '@/lib/utils'
import { requireAdminSession } from '@/lib/auth'
import { removeCardImage, saveCardImage } from '@/lib/storage'
import { cardFormSchema } from '@/lib/validations/card'

interface CardActionData {
  id: string
  publicUrl: string
}

function extractPayload(formData: FormData) {
  return {
    nome: String(formData.get('nome') ?? '').trim(),
    cpf: String(formData.get('cpf') ?? '').trim(),
    curso: String(formData.get('curso') ?? '').trim(),
    instituicao: String(formData.get('instituicao') ?? '').trim(),
    validade: String(formData.get('validade') ?? '').trim(),
    status: String(formData.get('status') ?? '').trim(),
  }
}

function normalizeValidity(validade: string) {
  return new Date(`${validade}T00:00:00`)
}

function revalidateCardPaths(id?: string) {
  revalidatePath('/admin/dashboard')
  revalidatePath('/admin/cards')
  revalidatePath('/admin/cards/new')

  if (id) {
    revalidatePath(`/admin/cards/${id}`)
    revalidatePath(`/card/${id}`)
  }
}

export async function createCardAction(formData: FormData): Promise<ActionResult<CardActionData>> {
  await requireAdminSession()

  const parsed = cardFormSchema.safeParse(extractPayload(formData))
  if (!parsed.success) {
    return {
      success: false,
      message: 'Verifique os campos informados.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const photo = formData.get('foto')
  if (!(photo instanceof File) || photo.size === 0) {
    return {
      success: false,
      message: 'Envie uma foto para criar a carteirinha.',
      fieldErrors: { foto: ['Envie uma foto.'] },
    }
  }

  if (!photo.type.startsWith('image/')) {
    return {
      success: false,
      message: 'A foto precisa ser uma imagem válida.',
      fieldErrors: { foto: ['Selecione uma imagem válida.'] },
    }
  }

  if (photo.size > 5 * 1024 * 1024) {
    return {
      success: false,
      message: 'A foto deve ter no máximo 5MB.',
      fieldErrors: { foto: ['A imagem deve ter no máximo 5MB.'] },
    }
  }

  const id = crypto.randomUUID()
  const upload = await saveCardImage(photo, id)

  try {
    await prisma.card.create({
      data: {
        id,
        ...parsed.data,
        validade: normalizeValidity(parsed.data.validade),
        fotoUrl: upload.publicUrl,
      },
    })
  } catch (error) {
    await removeCardImage(upload.publicUrl)
    console.error(error)

    return {
      success: false,
      message: 'Não foi possível salvar a carteirinha no banco de dados.',
    }
  }

  revalidateCardPaths(id)

  return {
    success: true,
    message: 'Carteirinha criada com sucesso.',
    data: {
      id,
      publicUrl: buildPublicCardUrl(id),
    },
  }
}

export async function updateCardAction(
  id: string,
  formData: FormData
): Promise<ActionResult<CardActionData>> {
  await requireAdminSession()

  const parsed = cardFormSchema.safeParse(extractPayload(formData))
  if (!parsed.success) {
    return {
      success: false,
      message: 'Verifique os campos informados.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const existingCard = await prisma.card.findUnique({ where: { id } })
  if (!existingCard) {
    return {
      success: false,
      message: 'Carteirinha não encontrada.',
    }
  }

  let fotoUrl = existingCard.fotoUrl
  const photo = formData.get('foto')

  if (photo instanceof File && photo.size > 0) {
    if (!photo.type.startsWith('image/')) {
      return {
        success: false,
        message: 'A foto precisa ser uma imagem válida.',
        fieldErrors: { foto: ['Selecione uma imagem válida.'] },
      }
    }

    if (photo.size > 5 * 1024 * 1024) {
      return {
        success: false,
        message: 'A foto deve ter no máximo 5MB.',
        fieldErrors: { foto: ['A imagem deve ter no máximo 5MB.'] },
      }
    }

    const upload = await saveCardImage(photo, id)
    fotoUrl = upload.publicUrl

    if (existingCard.fotoUrl !== fotoUrl) {
      await removeCardImage(existingCard.fotoUrl)
    }
  }

  try {
    await prisma.card.update({
      where: { id },
      data: {
        ...parsed.data,
        validade: normalizeValidity(parsed.data.validade),
        fotoUrl,
      },
    })
  } catch (error) {
    console.error(error)

    return {
      success: false,
      message: 'Não foi possível atualizar a carteirinha.',
    }
  }

  revalidateCardPaths(id)

  return {
    success: true,
    message: 'Carteirinha atualizada com sucesso.',
    data: {
      id,
      publicUrl: buildPublicCardUrl(id),
    },
  }
}

export async function deleteCardAction(id: string): Promise<ActionResult> {
  await requireAdminSession()

  const existingCard = await prisma.card.findUnique({ where: { id } })
  if (!existingCard) {
    return {
      success: false,
      message: 'Carteirinha não encontrada.',
    }
  }

  try {
    await prisma.card.delete({ where: { id } })
    await removeCardImage(existingCard.fotoUrl)
  } catch (error) {
    console.error(error)

    return {
      success: false,
      message: 'Não foi possível excluir a carteirinha.',
    }
  }

  revalidateCardPaths(id)

  return {
    success: true,
    message: 'Carteirinha excluída com sucesso.',
  }
}
