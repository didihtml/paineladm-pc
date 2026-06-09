import Link from "next/link";

export function DatabaseSetupNotice() {
  return (
    <section className="panel empty-state">
      <h1 className="empty-title">Banco de dados não configurado</h1>
      <p className="helper-text" style={{ maxWidth: 680, margin: "0 auto" }}>
        O projeto precisa da variável <strong>DATABASE_URL</strong> em um
        arquivo <strong>.env</strong> para conseguir acessar o PostgreSQL.
      </p>

      <div
        className="surface-card"
        style={{
          marginTop: 20,
          textAlign: "left",
          maxWidth: 760,
          marginInline: "auto",
        }}
      >
        <p style={{ marginTop: 0 }}>
          <strong>Passos:</strong>
        </p>
        <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
          <li>
            Crie um arquivo <strong>.env</strong> na raiz do projeto.
          </li>
          <li>
            Adicione a conexão do PostgreSQL, por exemplo:
            <pre
              style={{
                marginTop: 10,
                padding: 14,
                borderRadius: 14,
                background: "#0f172a",
                color: "#e2e8f0",
                overflowX: "auto",
              }}
            >{`DATABASE_URL="postgresql://postgres:postgres@localhost:5432/painel_puc"
ADMIN_EMAIL="admin@pucminas.br"
ADMIN_PASSWORD="admin123"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_PORTAL_URL="http://localhost:3001"
NEXT_PUBLIC_PORTAL_CARD_PATH="/cartoes-de-acesso/{id}"
NEXT_PUBLIC_PORTAL_LOGIN_PATH="/aluno/login"`}</pre>
          </li>
          <li>
            Rode <strong>npx prisma db push</strong>.
          </li>
          <li>
            Reinicie com <strong>npm run dev</strong>.
          </li>
        </ol>
      </div>

      <div
        className="actions-row"
        style={{ justifyContent: "center", marginTop: 18 }}
      >
        <Link href="/admin/login" className="btn-secondary">
          Voltar ao login
        </Link>
      </div>
    </section>
  );
}
