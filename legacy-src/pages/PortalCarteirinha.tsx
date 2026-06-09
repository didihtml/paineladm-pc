import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ShieldCheck,
  TriangleAlert,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { CarteirinhaCard } from "@/components/carteirinha/CarteirinhaCard";
import type { User } from "@/types/user";
import { useUsersStore } from "@/store/usersStore";
import { buildAssetUrl } from "@/utils/api";

export function PortalCarteirinha() {
  const { codigoAcesso = "" } = useParams();
  const fetchUserByAccessCode = useUsersStore((s) => s.fetchUserByAccessCode);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      setIsLoading(true);
      const result = await fetchUserByAccessCode(codigoAcesso);
      if (!active) return;
      setUser(result ?? null);
      setIsLoading(false);
    }

    void loadUser();

    return () => {
      active = false;
    };
  }, [codigoAcesso, fetchUserByAccessCode]);

  const photoSrc = normalizePhotoSrc(user?.foto ?? null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-center shadow-2xl">
          <p className="text-sm text-slate-300">Carregando carteirinha...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 text-red-300">
            <TriangleAlert size={28} />
          </div>
          <h1 className="text-2xl font-bold mb-2">
            Carteirinha não encontrada
          </h1>
          <p className="text-sm text-slate-300 mb-6">
            O código informado não corresponde a nenhuma carteirinha disponível
            neste portal.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            <ArrowLeft size={16} />
            Voltar ao painel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:gap-10 lg:px-8">
        <div className="mb-8 lg:mb-0 lg:flex-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
            <ShieldCheck size={14} />
            Portal da carteirinha
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Credencial digital de {user.nome}
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Este portal concentra os dados principais da carteirinha e permite
            validar a credencial por meio do código de acesso e do QR Code.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <InfoCard label="Código acadêmico" value={user.codigo} />
            <InfoCard label="Código de acesso" value={user.codigoAcesso} />
            <InfoCard label="Atribuição" value={user.atribuicao} />
            <InfoCard label="RG" value={user.rg} />
            <InfoCard label="CPF" value={user.cpf} />
            <InfoCard
              label="Nascimento"
              value={formatDate(user.dataNascimento)}
            />
            <InfoCard label="Campus" value={user.campus} />
            <InfoCard label="Curso" value={user.curso} />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
            >
              <ArrowLeft size={16} />
              Acessar painel
            </Link>
            {photoSrc ? (
              <a
                href={photoSrc}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                <ExternalLink size={16} />
                Abrir foto
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-400">
                <ExternalLink size={16} />
                Foto indisponível
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-center lg:w-100 lg:shrink-0">
          <CarteirinhaCard user={user} />
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold text-white">{value}</p>
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
