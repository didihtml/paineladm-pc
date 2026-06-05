import { QRCodeSVG as QRCode } from "qrcode.react";
import type { User } from "@/types/user";
import { UserCircle } from "lucide-react";
import { buildPortalUrl } from "@/utils/portal";

interface CarteirinhaCardProps {
  user: User;
  id?: string;
}

export function CarteirinhaCard({ user, id }: CarteirinhaCardProps) {
  const portalUrl = buildPortalUrl(user.codigoAcesso);

  return (
    <div
      id={id}
      className="w-90 rounded-2xl overflow-hidden shadow-2xl"
      style={{
        background: "linear-gradient(180deg, #1e4d8c 0%, #163a6b 100%)",
      }}
    >
      {/* Header */}
      <div className="bg-[#1a4080] px-5 py-3 flex items-center justify-between border-b border-white/10">
        <span className="text-white font-bold text-sm tracking-widest uppercase">
          Cartões de Acesso
        </span>
      </div>

      {/* Corpo principal */}
      <div className="p-4 space-y-4">
        {/* Foto + Nome + Código */}
        <div className="flex gap-4">
          <div className="w-28 h-32 rounded-xl overflow-hidden bg-white/10 shrink-0 border-2 border-[#5b9bd5]">
            {user.foto ? (
              <img
                src={user.foto}
                alt={user.nome}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/40">
                <UserCircle size={48} />
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center gap-2">
            <div>
              <p className="text-white/60 text-[11px]">Nome</p>
              <p className="text-white font-bold text-[15px] leading-tight">
                {user.nome}
              </p>
            </div>
            <div>
              <p className="text-white/60 text-[11px]">Código</p>
              <p className="text-white font-bold text-[15px]">{user.codigo}</p>
            </div>
          </div>
        </div>

        {/* Grid de dados */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/10 pt-3">
          <Field label="Atribuição" value={user.atribuicao} />
          <Field label="RG" value={user.rg} />
          <Field label="CPF" value={user.cpf} />
          <Field label="Nascimento" value={formatDate(user.dataNascimento)} />
          <Field label="Campus" value={user.campus} />
          <Field label="Curso" value={user.curso} />
        </div>

        {/* Credencial de acesso */}
        <div className="border-t border-white/10 pt-3">
          <div className="flex items-center gap-2 mb-3">
            <UserCircle size={16} className="text-white/70" />
            <span className="text-white font-semibold text-sm">
              Credencial de acesso
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white p-1.5 rounded-xl">
              <QRCode value={portalUrl} size={80} />
            </div>
            <div>
              <p className="text-white/60 text-[11px]">Código</p>
              <p className="text-white font-bold text-lg">
                {user.codigoAcesso}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-white/60 text-[11px]">{label}</p>
      <p className="text-white font-bold text-[13px] leading-tight">{value}</p>
    </div>
  );
}

function formatDate(iso: string) {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}
