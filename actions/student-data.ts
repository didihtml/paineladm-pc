"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function saveStudentEmail(form: FormData) {
  await requireAdminSession();
  const cardId = String(form.get("cardId") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  if (!cardId || email.length > 254 || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) throw new Error("Informe um e-mail válido.");
  if (email) await prisma.$executeRaw`INSERT INTO student_contacts (card_id, email) VALUES (${cardId}, ${email}) ON CONFLICT (card_id) DO UPDATE SET email=EXCLUDED.email, updated_at=now()`;
  else await prisma.$executeRaw`DELETE FROM student_contacts WHERE card_id=${cardId}`;
  revalidatePath(`/admin/cards/${cardId}`);
}
export async function saveStudentBill(form: FormData) {
  await requireAdminSession();
  const cardId = String(form.get("cardId") ?? "").trim();
  const id = String(form.get("id") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const dueDate = String(form.get("dueDate") ?? "").trim();
  const amountText = String(form.get("amount") ?? "").trim().replace(",", ".");
  const status = String(form.get("status") ?? "");
  const urlText = String(form.get("paymentUrl") ?? "").trim();
  if (!cardId || !description || description.length > 200 || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || !/^\d{1,7}(?:\.\d{1,2})?$/.test(amountText) || !["PENDENTE", "PAGO", "CANCELADO"].includes(status)) throw new Error("Informe os dados válidos do boleto.");
  const [whole, decimal = ""] = amountText.split(".");
  const cents = Number(whole) * 100 + Number(decimal.padEnd(2, "0"));
  let paymentUrl: string | null = null;
  if (urlText) { const url = new URL(urlText); if (url.protocol !== "https:") throw new Error("O link deve usar HTTPS."); paymentUrl = url.toString(); }
  if (id) {
    const changed = await prisma.$executeRaw`UPDATE student_bills SET description=${description}, due_date=${dueDate}::date, amount_cents=${cents}, status=${status}, payment_url=${paymentUrl} WHERE id=${id}::uuid AND card_id=${cardId}`;
    if (changed !== 1) throw new Error("Boleto não encontrado.");
  } else {
    const newId = randomUUID();
    await prisma.$executeRaw`INSERT INTO student_bills (id, card_id, description, due_date, amount_cents, status, payment_url) VALUES (${newId}::uuid, ${cardId}, ${description}, ${dueDate}::date, ${cents}, ${status}, ${paymentUrl})`;
  }
  revalidatePath(`/admin/cards/${cardId}`);
}
export async function deleteStudentBill(form: FormData) {
  await requireAdminSession();
  const cardId = String(form.get("cardId") ?? "").trim();
  const id = String(form.get("id") ?? "").trim();
  if (!cardId || !id) throw new Error("Boleto inválido.");
  await prisma.$executeRaw`DELETE FROM student_bills WHERE id=${id}::uuid AND card_id=${cardId}`;
  revalidatePath(`/admin/cards/${cardId}`);
}
