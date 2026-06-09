import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";
import { removeCardImage } from "@/lib/storage";
import type { CardRecord } from "@/lib/types";
import {
  legacyCardPayloadSchema,
  mapCardToLegacyUser,
  updateLegacyCard,
} from "@/lib/legacy-cards";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { success: false, message: "Não autenticado." },
      { status: 401 },
    );
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = legacyCardPayloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Verifique os campos informados." },
      { status: 400 },
    );
  }

  try {
    const origin = new URL(request.url).origin;
    const card = await updateLegacyCard(id, parsed.data);
    return NextResponse.json({
      success: true,
      user: mapCardToLegacyUser(card, origin),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível atualizar a carteirinha.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { success: false, message: "Não autenticado." },
      { status: 401 },
    );
  }

  const { id } = await params;
  const existingCard = (await prisma.card.findUnique({
    where: { id },
  })) as CardRecord | null;

  if (!existingCard) {
    return NextResponse.json(
      { success: false, message: "Carteirinha não encontrada." },
      { status: 404 },
    );
  }

  await prisma.card.delete({ where: { id } });
  await removeCardImage(existingCard.fotoUrl);

  return NextResponse.json({ success: true });
}
