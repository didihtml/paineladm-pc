"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function optionalNumber(form: FormData, field: string): number | null {
  const value = String(form.get(field) ?? "").trim();
  if (!value) return null;
  const number = Number(value.replace(",", "."));
  if (!Number.isFinite(number) || number < 0) throw new Error("Informe valores numéricos válidos.");
  return number;
}
export async function saveDiscipline(form: FormData) {
  await requireAdminSession();
  const cardId = String(form.get("cardId") ?? "").trim();
  const id = String(form.get("id") ?? "").trim();
  const name = String(form.get("name") ?? "").trim();
  const code = String(form.get("code") ?? "").trim() || null;
  const grade = optionalNumber(form, "grade");
  const gradeMax = optionalNumber(form, "gradeMax");
  const absences = optionalNumber(form, "absences");
  const absenceLimit = optionalNumber(form, "absenceLimit");
  if (!cardId || !name || name.length > 200 || (code?.length ?? 0) > 60) throw new Error("Informe uma disciplina válida.");
  if ((grade === null) !== (gradeMax === null) || (grade !== null && (gradeMax === null || gradeMax <= 0 || grade > gradeMax))) throw new Error("Informe uma nota e uma nota máxima válidas.");
  if ((absences === null) !== (absenceLimit === null) || (absences !== null && (!Number.isInteger(absences) || absenceLimit === null || !Number.isInteger(absenceLimit) || absenceLimit <= 0))) throw new Error("Informe faltas e limite inteiros válidos.");
  if (id) {
    const changed = await prisma.$executeRaw`UPDATE student_disciplines SET name=${name}, code=${code}, grade=${grade}, grade_max=${gradeMax}, absences=${absences}, absence_limit=${absenceLimit} WHERE id=${id}::uuid AND card_id=${cardId}`;
    if (changed !== 1) throw new Error("Disciplina não encontrada.");
  } else {
    const newId = randomUUID();
    await prisma.$executeRaw`INSERT INTO student_disciplines (id, card_id, name, code, grade, grade_max, absences, absence_limit) VALUES (${newId}::uuid, ${cardId}, ${name}, ${code}, ${grade}, ${gradeMax}, ${absences}, ${absenceLimit})`;
  }
  revalidatePath(`/admin/cards/${cardId}`);
}
export async function deleteDiscipline(form: FormData) {
  await requireAdminSession();
  const cardId = String(form.get("cardId") ?? "").trim();
  const id = String(form.get("id") ?? "").trim();
  if (!cardId || !id) throw new Error("Disciplina inválida.");
  await prisma.$executeRaw`DELETE FROM student_disciplines WHERE id=${id}::uuid AND card_id=${cardId}`;
  revalidatePath(`/admin/cards/${cardId}`);
}
