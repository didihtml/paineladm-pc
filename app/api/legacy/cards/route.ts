import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/auth";
import type { CardRecord } from "@/lib/types";
import {
  createLegacyCard,
  legacyCardPayloadSchema,
  mapCardToLegacyUser,
} from "@/lib/legacy-cards";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { success: false, message: "Não autenticado." },
      { status: 401 },
    );
  }

  const origin = new URL(request.url).origin;
  const cards = (await prisma.card.findMany({
    orderBy: { createdAt: "desc" },
  })) as CardRecord[];

  return NextResponse.json(
    cards.map((card) => mapCardToLegacyUser(card, origin)),
  );
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { success: false, message: "Não autenticado." },
      { status: 401 },
    );
  }

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
    const { card } = await createLegacyCard(parsed.data);
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
            : "Não foi possível criar a carteirinha.",
      },
      { status: 400 },
    );
  }
}
