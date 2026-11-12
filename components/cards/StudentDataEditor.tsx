import { prisma } from "@/lib/prisma";
import { saveStudentEmail, saveStudentBill, deleteStudentBill } from "@/actions/student-data";

type Bill = { id: string; description: string; due_date: string; amount_cents: number; status: string; payment_url: string | null };
const input = { width: "100%", padding: "9px", borderRadius: "8px", border: "1px solid #576274", background: "#121a29", color: "white" };
function BillFields({ bill }: { bill?: Bill }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
    <label>Descrição<input style={input} name="description" required maxLength={200} defaultValue={bill?.description ?? ""} /></label>
    <label>Vencimento<input style={input} name="dueDate" type="date" required defaultValue={bill?.due_date ?? ""} /></label>
    <label>Valor em reais<input style={input} name="amount" type="number" min="0" step="0.01" required defaultValue={bill ? (bill.amount_cents / 100).toFixed(2) : ""} /></label>
    <label>Situação<select style={input} name="status" defaultValue={bill?.status ?? "PENDENTE"}><option value="PENDENTE">Pendente</option><option value="PAGO">Pago</option><option value="CANCELADO">Cancelado</option></select></label>
    <label>Link HTTPS do boleto (opcional)<input style={input} name="paymentUrl" type="url" defaultValue={bill?.payment_url ?? ""} /></label>
  </div>;
}
export async function StudentDataEditor({ cardId }: { cardId: string }) {
  let contact: { email: string }[]; let bills: Bill[];
  try {
    [contact, bills] = await Promise.all([
      prisma.$queryRaw<{ email: string }[]>`SELECT email FROM student_contacts WHERE card_id=${cardId}`,
      prisma.$queryRaw<Bill[]>`SELECT id::text, description, due_date::text, amount_cents, status, payment_url FROM student_bills WHERE card_id=${cardId} ORDER BY due_date DESC, id`,
    ]);
  } catch { return <section className="panel" style={{ marginTop: 20, padding: 20 }}><h2>E-mail e boletos</h2><p>O cadastro ainda não está configurado no banco de dados.</p></section>; }
  return <section className="panel" style={{ marginTop: 20, padding: 20 }}><h2>E-mail do aluno</h2><form action={saveStudentEmail} style={{ display: "grid", gap: 10, marginTop: 12 }}><input type="hidden" name="cardId" value={cardId} /><label>E-mail<input style={input} type="email" name="email" defaultValue={contact[0]?.email ?? ""} maxLength={254} /></label><button type="submit" className="btn-primary">Salvar e-mail</button></form>
    <h2 style={{ marginTop: 24 }}>Boletos</h2><p className="helper-text">A situação é informada manualmente; confirme o pagamento antes de marcar como pago.</p>
    <form action={saveStudentBill} style={{ display: "grid", gap: 12, marginTop: 12 }}><input type="hidden" name="cardId" value={cardId} /><BillFields /><button type="submit" className="btn-primary">Adicionar boleto</button></form>
    {bills.map(bill => <div key={bill.id} style={{ borderTop: "1px solid #303848", marginTop: 20, paddingTop: 20 }}><form action={saveStudentBill} style={{ display: "grid", gap: 12 }}><input type="hidden" name="cardId" value={cardId} /><input type="hidden" name="id" value={bill.id} /><BillFields bill={bill} /><button type="submit" className="btn-primary">Salvar boleto</button></form><form action={deleteStudentBill} style={{ marginTop: 8 }}><input type="hidden" name="cardId" value={cardId} /><input type="hidden" name="id" value={bill.id} /><button type="submit" className="btn-secondary">Excluir boleto</button></form></div>)}
  </section>;
}
