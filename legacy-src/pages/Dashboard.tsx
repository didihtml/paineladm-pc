import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUsersStore } from "@/store/usersStore";
import { UserForm } from "@/components/users/UserForm";
import type { User, UserFormData } from "@/types/user";
import { Plus, UserCircle } from "lucide-react";
import { buildAssetUrl } from "@/utils/api";

const LIMIT = 999;

export function Dashboard() {
  const navigate = useNavigate();
  const { users, isLoading, fetchUsers, addUser, updateUser, deleteUser } =
    useUsersStore();

  const [modal, setModal] = useState<{ open: boolean; editing: User | null }>({
    open: false,
    editing: null,
  });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  async function handleSubmit(data: UserFormData) {
    setIsSubmitting(true);

    const ok = modal.editing
      ? await updateUser(modal.editing.id, data)
      : await addUser(data);

    setIsSubmitting(false);

    if (!ok) {
      window.alert("Não foi possível salvar a carteirinha.");
      return;
    }

    setModal({ open: false, editing: null });
  }

  async function handleDelete(id: string) {
    setIsDeleting(true);
    const ok = await deleteUser(id);
    setIsDeleting(false);
    setConfirmDelete(null);

    if (!ok) {
      window.alert("Não foi possível excluir a carteirinha.");
    }
  }

  function formatDate(iso: string) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        height: "100%",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "14px 16px",
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          boxSizing: "border-box",
          width: "100%",
        }}
      >
        <div>
          <p style={{ color: "#64748b", fontSize: 13 }}>Suas Carteirinhas</p>
          <p
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#1e293b",
              lineHeight: 1.2,
            }}
          >
            {users.length}{" "}
            <span style={{ color: "#94a3b8", fontWeight: 400, fontSize: 15 }}>
              / {LIMIT}
            </span>
          </p>
        </div>
        <button
          onClick={() => setModal({ open: true, editing: null })}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 16px",
            background: "#22c55e",
            border: "none",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 12,
            cursor: "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          <Plus size={15} />
          Criar Carteirinha
        </button>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          background: "rgba(16, 18, 32, 0.72)",
          borderRadius: 16,
          padding: 12,
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {isLoading && users.length === 0 ? (
          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: "32px 16px",
              textAlign: "center",
              color: "rgba(255,255,255,0.5)",
              fontSize: 13,
            }}
          >
            Carregando carteirinhas...
          </div>
        ) : null}

        {!isLoading && users.length === 0 ? (
          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: "32px 16px",
              textAlign: "center",
              color: "rgba(255,255,255,0.4)",
              fontSize: 13,
            }}
          >
            Nenhuma carteirinha criada ainda.
          </div>
        ) : null}

        {users.map((user) => (
          <div
            key={user.id}
            style={{
              background: "#fff",
              borderRadius: 14,
              overflow: "hidden",
              boxSizing: "border-box",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", gap: 14, padding: "14px 16px" }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 10,
                  overflow: "hidden",
                  background: "#f1f5f9",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {normalizePhotoSrc(user.foto) ? (
                  <img
                    src={normalizePhotoSrc(user.foto)!}
                    alt={user.nome}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <UserCircle size={32} color="#cbd5e1" />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                <p
                  style={{
                    fontWeight: 700,
                    color: "#1e293b",
                    fontSize: 14,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.nome}
                </p>
                <p style={{ color: "#64748b", fontSize: 12, marginTop: 3 }}>
                  CPF: {user.cpf}
                </p>
                <p style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>
                  Nascimento: {formatDate(user.dataNascimento)}
                </p>
                <p
                  style={{
                    color: "#1a3a6b",
                    fontSize: 12,
                    marginTop: 4,
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.curso} — {user.campus}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", borderTop: "1px solid #f1f5f9" }}>
              {[
                {
                  label: "Editar",
                  color: "#1a3a6b",
                  onClick: () => setModal({ open: true, editing: user }),
                },
                {
                  label: "Ver Carteirinha",
                  color: "#16a34a",
                  onClick: () => navigate(`/carteirinha?id=${user.id}`),
                },
                {
                  label: "Excluir",
                  color: "#ef4444",
                  onClick: () => setConfirmDelete(user.id),
                },
              ].map((btn, i, arr) => (
                <button
                  key={btn.label}
                  onClick={btn.onClick}
                  style={{
                    flex: 1,
                    padding: "11px 4px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: btn.color,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    borderRight:
                      i < arr.length - 1 ? "1px solid #f1f5f9" : "none",
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {modal.open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              width: "100%",
              maxWidth: 560,
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
            }}
          >
            <div
              style={{
                padding: "18px 20px",
                borderBottom: "1px solid #f1f5f9",
                position: "sticky",
                top: 0,
                background: "#fff",
                borderRadius: "20px 20px 0 0",
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>
                {modal.editing ? "Editar carteirinha" : "Nova carteirinha"}
              </h3>
            </div>
            <div style={{ padding: 20, opacity: isSubmitting ? 0.7 : 1 }}>
              <UserForm
                defaultValues={modal.editing ?? undefined}
                onSubmit={handleSubmit}
                onCancel={() => setModal({ open: false, editing: null })}
              />
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: 24,
              width: "100%",
              maxWidth: 360,
              boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
            }}
          >
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#1e293b",
                marginBottom: 8,
              }}
            >
              Excluir carteirinha
            </h3>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
              Essa ação não pode ser desfeita.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setConfirmDelete(null)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  fontSize: 13,
                  borderRadius: 12,
                  cursor: "pointer",
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  color: "#475569",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => void handleDelete(confirmDelete)}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  fontSize: 13,
                  fontWeight: 600,
                  borderRadius: 12,
                  cursor: "pointer",
                  background: "#ef4444",
                  border: "none",
                  color: "#fff",
                  opacity: isDeleting ? 0.7 : 1,
                }}
              >
                {isDeleting ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function normalizePhotoSrc(photo: string | null) {
  if (!photo) return null;
  if (/^(data:|blob:|https?:|content:|file:)/i.test(photo)) return photo;
  if (photo.startsWith("/")) return buildAssetUrl(photo);
  return photo;
}
