import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useUsersStore } from "@/store/usersStore";
import { CarteirinhaCard } from "@/components/carteirinha/CarteirinhaCard";
import {
  exportCarteirinhaAsPDF,
  exportCarteirinhaAsImage,
} from "@/utils/exportCarteirinha";
import { buildPortalUrl } from "@/utils/portal";
import { ArrowLeft, Copy, Download, ExternalLink, Image } from "lucide-react";

export function Carteirinha() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const users = useUsersStore((s) => s.users);
  const isLoading = useUsersStore((s) => s.isLoading);
  const fetchUsers = useUsersStore((s) => s.fetchUsers);

  const [selectedId, setSelectedId] = useState(searchParams.get("id") ?? "");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const selectedUser = users.find((u) => u.id === selectedId);
  const portalUrl = useMemo(
    () => (selectedUser ? buildPortalUrl(selectedUser.codigoAcesso) : ""),
    [selectedUser],
  );

  async function handleCopyPortalUrl() {
    if (!portalUrl) return;

    await navigator.clipboard.writeText(portalUrl);
    setCopied(true);
  }

  return (
    <div className="pb-6">
      <button
        onClick={() => navigate("/")}
        className="mb-5 flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
      >
        <ArrowLeft size={16} />
        Voltar
      </button>

      <h2 className="mb-4 text-xl font-bold text-white">Carteirinha</h2>

      <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm">
        <label className="mb-2 block text-xs font-medium text-slate-500">
          Selecionar aluno
        </label>
        <select
          value={selectedId}
          onChange={(e) => {
            setSelectedId(e.target.value);
            setCopied(false);
          }}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
        >
          <option value="">-- Escolha um usuário --</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nome}
            </option>
          ))}
        </select>
      </div>

      {isLoading && !selectedUser ? (
        <div className="rounded-2xl bg-white p-10 text-center text-sm text-slate-400 shadow-sm">
          Carregando carteirinhas...
        </div>
      ) : null}

      {!isLoading && selectedUser ? (
        <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="flex justify-center">
              <CarteirinhaCard user={selectedUser} id="carteirinha-export" />
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="mb-2 text-xs font-medium text-slate-500">
                Portal da carteirinha
              </p>
              <p className="break-all text-sm text-slate-700">{portalUrl}</p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row xl:flex-row">
                <a
                  href={portalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#0f172a] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#020617]"
                >
                  <ExternalLink size={15} />
                  Abrir portal
                </a>
                <button
                  onClick={handleCopyPortalUrl}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <Copy size={15} />
                  {copied ? "Link copiado" : "Copiar link"}
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Exportação
              </p>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                <button
                  onClick={() =>
                    exportCarteirinhaAsPDF(
                      "carteirinha-export",
                      `carteirinha-${selectedUser.nome}`,
                    )
                  }
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#1a3a6b] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#163060]"
                >
                  <Download size={15} />
                  Exportar PDF
                </button>
                <button
                  onClick={() =>
                    exportCarteirinhaAsImage(
                      "carteirinha-export",
                      `carteirinha-${selectedUser.nome}`,
                    )
                  }
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <Image size={15} />
                  Salvar Imagem
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {!isLoading && !selectedUser ? (
        <div className="rounded-2xl bg-white p-10 text-center text-sm text-slate-400 shadow-sm">
          Selecione um usuário para visualizar a carteirinha
        </div>
      ) : null}
    </div>
  );
}
