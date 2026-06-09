import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { CardRecord } from "@/lib/types";
import { mapCardToLegacyUser } from "@/lib/legacy-cards";

interface RouteContext {
  params: Promise<{ codigoAcesso: string }>;
}

export async function GET(request: Request, { params }: RouteContext) {
  const { codigoAcesso } = await params;
  const card = (await prisma.card.findFirst({
    where: { codigoAcesso },
  })) as CardRecord | null;

  if (!card) {
    return NextResponse.json(
      { success: false, message: "Carteirinha não encontrada." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    user: mapCardToLegacyUser(card, new URL(request.url).origin),
  });
}
