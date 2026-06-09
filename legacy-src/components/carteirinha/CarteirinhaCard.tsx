import { useEffect, useState } from "react";
import { QRCodeSVG as QRCode } from "qrcode.react";
import type { User } from "@/types/user";
import { UserCircle } from "lucide-react";
import { buildPortalUrl } from "@/utils/portal";
import { buildAssetUrl } from "@/utils/api";

interface CarteirinhaCardProps {
  user: User;
  id?: string;
}

export function CarteirinhaCard({ user, id }: CarteirinhaCardProps) {
  const portalUrl = buildPortalUrl(user.codigoAcesso);
  const photoSrc = normalizePhotoSrc(user.foto);
  const [photoUnavailable, setPhotoUnavailable] = useState(false);

  useEffect(() => {
    setPhotoUnavailable(false);
  }, [photoSrc]);

  return (
    <div
      id={id}
      className="w-[360px] max-w-full rounded-2xl overflow-hidden shadow-2xl"
      style={{
        background: "linear-gradient(180deg, #18548f 0%, #12416f 100%)",
      }}
    >
      <div className="h-5 bg-[#0f5a7c]" />

      <div className="p-4 space-y-4">
        {/* Foto + Nome + Código */}
        <div className="flex gap-4">
          <div className="h-32 w-28 shrink-0 overflow-hidden rounded-2xl border-2 border-[#74c1e6] bg-white p-1 shadow-[0_14px_30px_rgba(0,0,0,0.18)]">
            {photoSrc && !photoUnavailable ? (
              <img
                src={photoSrc}
                alt={user.nome}
                className="h-full w-full rounded-xl bg-white object-cover"
                loading="eager"
                referrerPolicy="no-referrer"
                onError={() => setPhotoUnavailable(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                <UserCircle size={48} />
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">
            <div>
              <p className="text-white/60 text-[11px]">Nome</p>
              <p className="text-white font-bold text-[15px] leading-tight break-words">
                {user.nome}
              </p>
            </div>
            <div>
              <p className="text-white/60 text-[11px]">Código</p>
              <p className="text-white font-bold text-[15px]">{user.codigo}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-3 border-t border-white/10 pt-3">
          <Field label="Atribuição" value={user.atribuicao} />
          <Field label="RG" value={user.rg} />
          <Field label="CPF" value={user.cpf} />
          <Field label="Nascimento" value={formatDate(user.dataNascimento)} />
          <Field label="Campus" value={user.campus} />
          <Field label="Curso" value={user.curso} />
        </div>

        <div className="rounded-b-2xl border-t border-white/10 bg-[#0d4d73]/50 px-4 py-4 -mx-4 -mb-4">
          <div className="flex items-center gap-2 mb-3">
            <UserCircle size={16} className="text-white/70" />
            <span className="text-white font-semibold text-sm">
              Credencial de acesso
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-white p-2 shadow-lg">
              <QRCode value={portalUrl} size={96} />
            </div>
            <div>
              <p className="text-white/60 text-[11px]">Código</p>
              <p className="text-white font-bold text-lg tracking-[0.02em]">
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

function normalizePhotoSrc(photo: string | null) {
  if (!photo) return null;

  const value = photo.trim();
  if (!value) return null;

  if (/^(data:|blob:|https?:|content:|file:)/i.test(value)) {
    return value;
  }

  if (value.startsWith("/")) {
    return buildAssetUrl(value);
  }

  const compactValue = value.replace(/\s+/g, "");
  const looksLikeBase64 =
    compactValue.length > 100 && /^[A-Za-z0-9+/=]+$/.test(compactValue);

  if (looksLikeBase64) {
    return `data:image/jpeg;base64,${compactValue}`;
  }

  return value;
}
