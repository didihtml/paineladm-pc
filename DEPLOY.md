# Deploy do Painel Admin na Vercel

## Arquitetura

```
Projeto Vercel (painel-puc) — Next.js 16 App Router
├── Painel Admin (/admin/*)
├── API Routes (/api/legacy/*)
├── Página pública da carteirinha (/card/[id])
└── PostgreSQL (compartilhado com o portal-app)
```

> **IMPORTANTE:** O painel e o portal-app DEVEM compartilhar o **mesmo banco PostgreSQL** para que as carteirinhas criadas no painel apareçam no APK.

---

## Pré-requisitos

1. Conta na [Vercel](https://vercel.com)
2. Banco PostgreSQL na nuvem ([Neon](https://neon.tech) recomendado — 500 MB grátis)
3. Conta no [Cloudinary](https://cloudinary.com) (obrigatório para upload de imagens na Vercel)
4. O **portal-app** já deve estar deployado na Vercel (para configurar `NEXT_PUBLIC_PORTAL_URL`)

---

## Passo 1: Configurar o Cloudinary

Na Vercel o filesystem é **read-only**, então uploads locais (`public/uploads/`) **não funcionam**.

1. Crie uma conta gratuita em [cloudinary.com](https://cloudinary.com)
2. Acesse o Dashboard → copie:
   - **Cloud name**
   - **API Key**
   - **API Secret**
3. (Opcional) Crie uma pasta chamada `puc-minas/cards` no Cloudinary

---

## Passo 2: Configurar variáveis de ambiente na Vercel

No dashboard da Vercel → Project Settings → Environment Variables:

| Variável | Valor | Ambiente |
|----------|-------|----------|
| `DATABASE_URL` | `postgres://...` (URL do Neon/Supabase) | Production, Preview, Development |
| `ADMIN_EMAIL` | Email para login no painel | Production |
| `ADMIN_PASSWORD` | Senha para login no painel | Production |
| `NEXT_PUBLIC_APP_URL` | `https://painel-puc.vercel.app` | Production |
| `NEXT_PUBLIC_PORTAL_URL` | `https://SEU-PORTAL.vercel.app` | Production |
| `CLOUDINARY_CLOUD_NAME` | Seu cloud name | Production |
| `CLOUDINARY_API_KEY` | Sua API key | Production |
| `CLOUDINARY_API_SECRET` | Sua API secret | Production |
| `CLOUDINARY_FOLDER` | `puc-minas/cards` | Production |

> ⚠️ **NUNCA** commite o `.env` com valores reais no Git!

---

## Passo 3: Fazer deploy

### Via Git (recomendado)

1. Certifique-se que o código está no GitHub:
   ```bash
   git push origin main
   ```

2. No dashboard da Vercel → "Add New Project"
3. Importe o repositório `paineladm-pc`
4. A Vercel vai detectar automaticamente:
   - **Framework Preset:** `Next.js`
   - **Build Command:** `next build`
   - **Output Directory:** `.next`
5. Clique em **Deploy**

### Via CLI

```bash
# Na pasta do painel-puc
vercel --prod
```

---

## Passo 4: Testar

Após o deploy, teste os endpoints:

```bash
# Health check da API legacy
curl https://SEU-PAINEL.vercel.app/api/legacy/cards

# Login admin
curl -X POST https://SEU-PAINEL.vercel.app/api/legacy/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pucminas.br","password":"admin123"}'

# Página pública de uma carteirinha
curl https://SEU-PAINEL.vercel.app/card/ID_DA_CARTEIRINHA
```

---

## Passo 5: Verificar integração com o portal

1. Crie uma carteirinha no painel admin
2. Acesse a URL do portal-app: `https://SEU-PORTAL.vercel.app/card/ID_DA_CARTEIRINHA`
3. A carteirinha deve aparecer com a foto correta

Se a foto não aparecer, verifique se o Cloudinary está configurado corretamente.

---

## Solução de problemas

### "DATABASE_URL is not defined"
- Verifique se a variável está configurada no dashboard da Vercel (não apenas no `.env` local)

### Upload de imagem falha
- Confirme que todas as 3 variáveis do Cloudinary estão preenchidas
- Verifique se o `CLOUDINARY_FOLDER` existe no Cloudinary

### Fotos não aparecem no portal
- O painel e o portal devem usar o **mesmo banco de dados**
- O painel deve estar usando Cloudinary (uploads locais não funcionam na Vercel)

### CORS bloqueando requisições
- As API routes já incluem headers CORS via `vercel.json`
- Se o portal estiver em outro domínio, verifique se `Access-Control-Allow-Origin` está com `*`

---

## Estrutura de arquivos modificada para deploy

```
painel-puc/
├── vercel.json          ← NOVO: Configuração de headers CORS
├── next.config.mjs      ← MODIFICADO: adicionado images.remotePatterns
├── .env.example         ← MODIFICADO: instruções para produção
└── DEPLOY.md            ← NOVO: Este guia
```
