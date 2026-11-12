import { prisma } from "@/lib/prisma";
import { saveDiscipline, deleteDiscipline } from "@/actions/disciplines";

type Discipline = { id: string; name: string; code: string | null; grade: string | null; grade_max: string | null; absences: number | null; absence_limit: number | null };
const inputStyle = { width: "100%", padding: "9px", borderRadius: "8px", border: "1px solid #576274", background: "#121a29", color: "white" };
function Fields({ discipline }: { discipline?: Discipline }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
    {[{ name: "name", label: "Disciplina", value: discipline?.name, required: true }, { name: "code", label: "Código", value: discipline?.code }, { name: "grade", label: "Nota", value: discipline?.grade, type: "number", step: "0.01" }, { name: "gradeMax", label: "Nota máxima", value: discipline?.grade_max, type: "number", step: "0.01" }, { name: "absences", label: "Faltas", value: discipline?.absences, type: "number", step: "1" }, { name: "absenceLimit", label: "Limite de faltas", value: discipline?.absence_limit, type: "number", step: "1" }].map(field => <label key={field.name} style={{ display: "grid", gap: 5, fontSize: 13 }}>{field.label}<input style={inputStyle} name={field.name} type={field.type || "text"} step={field.step} min={field.type === "number" ? 0 : undefined} required={field.required} defaultValue={field.value ?? ""} /></label>)}
  </div>;
}
export async function DisciplinesEditor({ cardId }: { cardId: string }) {
  let disciplines: Discipline[];
  try {
    disciplines = await prisma.$queryRaw<Discipline[]>`SELECT id::text, name, code, grade::text, grade_max::text, absences, absence_limit FROM student_disciplines WHERE card_id=${cardId} ORDER BY created_at, id`;
  } catch {
    return <section className="panel" style={{ marginTop: 20 }}><h2>Disciplinas, notas e faltas</h2><p>O cadastro acadêmico ainda não está configurado no banco de dados.</p></section>;
  }
  return <section className="panel" style={{ marginTop: 20, padding: 20 }}><h2>Disciplinas, notas e faltas</h2><p className="helper-text">Cadastre somente informações confirmadas para este aluno. Deixe nota e faltas vazias quando não estiverem disponíveis.</p>
    <form action={saveDiscipline} style={{ display: "grid", gap: 12, marginTop: 16 }}><input type="hidden" name="cardId" value={cardId} /><Fields /><button type="submit" className="btn-primary">Adicionar disciplina</button></form>
    {disciplines.map(discipline => <div key={discipline.id} style={{ borderTop: "1px solid #303848", marginTop: 20, paddingTop: 20 }}><form action={saveDiscipline} style={{ display: "grid", gap: 12 }}><input type="hidden" name="cardId" value={cardId} /><input type="hidden" name="id" value={discipline.id} /><Fields discipline={discipline} /><button type="submit" className="btn-primary">Salvar alterações</button></form><form action={deleteDiscipline} style={{ marginTop: 8 }}><input type="hidden" name="cardId" value={cardId} /><input type="hidden" name="id" value={discipline.id} /><button type="submit" className="btn-secondary">Excluir disciplina</button></form></div>)}
  </section>;
}
