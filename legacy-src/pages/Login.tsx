import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { User, Eye, EyeOff, IdCard } from "lucide-react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import LetterGlitch from "@/components/LetterGlitch";

export function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const checkSession = useAuthStore((s) => s.checkSession);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const ok = await login(email, password);
    if (ok) navigate("/");
    else setError("E-mail ou senha incorretos.");

    setLoading(false);
  }

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      {/* Background animado */}
      <div style={{ position: "absolute", inset: 0 }}>
        <LetterGlitch
          glitchColors={["#0f2347", "#1a3a6b", "#2d5fa8"]}
          glitchSpeed={60}
          outerVignette={true}
          smooth={true}
        />
      </div>

      {/* Card centralizado */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: "16px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 360,
            borderRadius: 24,
            overflow: "hidden",
            background: "rgba(16, 18, 32, 0.95)",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.9)",
          }}
        >
          {/* Topo decorativo */}
          <div
            style={{
              position: "relative",
              height: 176,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              background: "linear-gradient(180deg, #1a2240 0%, #11152a 100%)",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {/* Grade */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0.08,
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
                backgroundSize: "30px 30px",
              }}
            />
            {/* Glow azul embaixo */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(ellipse at 50% 130%, rgba(26, 90, 200, 0.35) 0%, transparent 65%)",
              }}
            />
            {/* Ícone */}
            <div
              style={{
                position: "relative",
                zIndex: 1,
                width: 76,
                height: 76,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #1e2848 0%, #263266 100%)",
                border: "1px solid rgba(255,255,255,0.13)",
                boxShadow: "0 0 36px rgba(45,95,168,0.55)",
              }}
            >
              <IdCard size={32} color="rgba(255,255,255,0.75)" />
            </div>
            {/* Mini card esquerda */}
            <div
              style={{
                position: "absolute",
                left: 20,
                bottom: 18,
                width: 96,
                borderRadius: 12,
                padding: "8px 12px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                opacity: 0.5,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 5,
                  borderRadius: 3,
                  background: "rgba(255,255,255,0.3)",
                  marginBottom: 6,
                }}
              />
              <div
                style={{
                  width: 56,
                  height: 4,
                  borderRadius: 3,
                  background: "rgba(255,255,255,0.18)",
                }}
              />
            </div>
            {/* Mini card direita */}
            <div
              style={{
                position: "absolute",
                right: 20,
                top: 18,
                width: 76,
                borderRadius: 12,
                padding: "8px 12px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                opacity: 0.4,
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 5,
                  borderRadius: 3,
                  background: "rgba(255,255,255,0.3)",
                  marginBottom: 6,
                }}
              />
              <div
                style={{
                  width: 44,
                  height: 4,
                  borderRadius: 3,
                  background: "rgba(255,255,255,0.18)",
                }}
              />
            </div>
          </div>

          {/* Formulário */}
          <div style={{ padding: "24px 28px 28px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <User size={14} color="rgba(255,255,255,0.55)" />
              <span
                style={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                Entrar
              </span>
            </div>
            <p
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: 12,
                marginBottom: 24,
              }}
            >
              Acesse o painel de carteirinhas da PUC
            </p>

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail"
                required
                style={{
                  display: "block",
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 16px",
                  marginBottom: 10,
                  borderRadius: 12,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.85)",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  outline: "none",
                }}
              />

              {/* Senha */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 12,
                  marginBottom: 10,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  overflow: "hidden",
                }}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha"
                  required
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    fontSize: 13,
                    color: "rgba(255,255,255,0.85)",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0 14px",
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.4)",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Esqueci senha */}
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "rgba(255,255,255,0.35)",
                  fontSize: 11,
                  cursor: "pointer",
                  marginBottom: 20,
                }}
              >
                Esqueci minha senha
              </button>

              {error && (
                <p
                  style={{
                    color: "#f87171",
                    fontSize: 12,
                    textAlign: "center",
                    marginBottom: 12,
                  }}
                >
                  {error}
                </p>
              )}

              {/* Botão */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "13px",
                  borderRadius: 12,
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  background:
                    "linear-gradient(90deg, #1a3a6b 0%, #2d5fa8 100%)",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
