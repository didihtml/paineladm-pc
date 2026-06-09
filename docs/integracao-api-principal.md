# Integração do Painel Admin com a API principal

## Decisão arquitetural

A API principal (`localhost:3001`) deve ser a única dona de:

- PostgreSQL
- Prisma schema
- migrações
- regras de negócio da carteirinha
- autenticação e credenciais
- upload e URL final da foto

O Painel Admin (`localhost:3000`) deve virar apenas um cliente da API principal.

## Fluxo recomendado

```text
Painel Admin (3000)
        |
        v
API principal (3001)
        |
        v
PostgreSQL principal
```

## Problema atual

Hoje o projeto `painel-puc`:

- grava direto no banco com Prisma
- não chama a API `3001`
- possui um modelo `Card` simplificado
- não cobre todos os campos exibidos no app principal
- está desalinhado do banco real em relação às colunas de credenciais

## Campos exigidos pelo card do app principal

Pelo layout atual do app principal, a credencial precisa de pelo menos:

- foto
- nome
- código do aluno
- atribuição
- RG
- CPF
- data de nascimento
- campus
- curso
- código da credencial
- QR Code
- status
- validade

## Modelo de dados recomendado

### Tabela `users`
Dados pessoais da pessoa.

| Campo | Tipo | Observação |
|---|---|---|
| `id` | uuid | PK |
| `full_name` | text | nome completo |
| `cpf` | text | único |
| `rg` | text | opcional ou único conforme regra |
| `birth_date` | date | data de nascimento |
| `photo_url` | text | URL pública da foto |
| `user_type` | enum | ex: `ALUNO` |
| `created_at` | timestamptz | default now |
| `updated_at` | timestamptz | atualização automática |

### Tabela `credentials`
Credenciais de login/autenticação.

| Campo | Tipo | Observação |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | FK para `users.id` |
| `origin` | text | ex: `SGA` |
| `username` | text | único |
| `password_hash` | text | hash seguro |
| `is_active` | boolean | default true |
| `created_at` | timestamptz | default now |
| `updated_at` | timestamptz | atualização automática |

### Tabela `cards`
Dados da carteirinha/credencial de acesso.

| Campo | Tipo | Observação |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | FK para `users.id` |
| `student_code` | text | código exibido no card |
| `access_code` | text | código da credencial |
| `role_label` | text | ex: `Aluno` |
| `campus_name` | text | campus exibido |
| `course_name` | text | curso exibido |
| `institution_name` | text | ex: `PUC Minas` |
| `status` | enum | `ATIVA`, `INATIVA`, `BLOQUEADA`, `EXPIRADA` |
| `valid_until` | date | validade |
| `qr_code_value` | text | valor bruto do QR Code |
| `card_number` | text | opcional, se existir no app |
| `created_at` | timestamptz | default now |
| `updated_at` | timestamptz | atualização automática |

### Relação recomendada

- `users` 1:1 `credentials`
- `users` 1:1 `cards`

Se no futuro uma pessoa puder ter múltiplas carteirinhas, mude `users` 1:N `cards`.

## Prisma sugerido para a API principal

```prisma
enum UserType {
  ALUNO
}

enum CardStatus {
  ATIVA
  INATIVA
  BLOQUEADA
  EXPIRADA
}

model User {
  id          String      @id @default(uuid())
  fullName    String      @map("full_name")
  cpf         String      @unique
  rg          String?
  birthDate   DateTime    @map("birth_date")
  photoUrl    String      @map("photo_url")
  userType    UserType    @default(ALUNO) @map("user_type")
  createdAt   DateTime    @default(now()) @map("created_at")
  updatedAt   DateTime    @updatedAt @map("updated_at")
  credential  Credential?
  card        Card?

  @@map("users")
}

model Credential {
  id           String    @id @default(uuid())
  userId       String    @unique @map("user_id")
  origin       String
  username     String    @unique
  passwordHash String    @map("password_hash")
  isActive     Boolean   @default(true) @map("is_active")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("credentials")
}

model Card {
  id              String      @id @default(uuid())
  userId          String      @unique @map("user_id")
  studentCode     String      @map("student_code")
  accessCode      String      @map("access_code")
  roleLabel       String      @map("role_label")
  campusName      String      @map("campus_name")
  courseName      String      @map("course_name")
  institutionName String      @map("institution_name")
  status          CardStatus
  validUntil      DateTime    @map("valid_until")
  qrCodeValue     String      @map("qr_code_value")
  cardNumber      String?     @map("card_number")
  createdAt       DateTime    @default(now()) @map("created_at")
  updatedAt       DateTime    @updatedAt @map("updated_at")
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("cards")
}
```

## Endpoints recomendados na API principal

Base URL:

```text
http://localhost:3001
```

### Criar usuário + credencial + carteirinha

`POST /admin/cards`

Content-Type sugerido:

- `multipart/form-data` se a foto subir junto
- ou JSON + endpoint separado para upload

Campos sugeridos:

- `fullName`
- `cpf`
- `rg`
- `birthDate`
- `studentCode`
- `roleLabel`
- `campusName`
- `courseName`
- `institutionName`
- `validUntil`
- `status`
- `origin`
- `username`
- `password`
- `accessCode`
- `qrCodeValue`
- `photo`

Resposta `201` sugerida:

```json
{
  "id": "card_uuid",
  "user": {
    "id": "user_uuid",
    "fullName": "Felippe Henrique Mascarin",
    "cpf": "12814673670",
    "rg": "MG-22.814.943",
    "birthDate": "2008-01-02",
    "photoUrl": "https://api.exemplo.com/uploads/cards/abc.jpg"
  },
  "credential": {
    "id": "credential_uuid",
    "origin": "SGA",
    "username": "felippe.123456",
    "temporaryPassword": "AbC123xY9"
  },
  "card": {
    "id": "card_uuid",
    "studentCode": "7362946285",
    "accessCode": "00807683",
    "roleLabel": "Aluno",
    "campusName": "Campus Poços De Caldas",
    "courseName": "Administração",
    "institutionName": "PUC Minas",
    "status": "ATIVA",
    "validUntil": "2027-02-02",
    "qrCodeValue": "00807683"
  }
}
```

### Listar carteirinhas

`GET /admin/cards`

Query params sugeridos:

- `search`
- `status`
- `campus`
- `page`
- `pageSize`

Resposta `200` sugerida:

```json
{
  "items": [
    {
      "id": "card_uuid",
      "studentCode": "7362946285",
      "status": "ATIVA",
      "validUntil": "2027-02-02",
      "user": {
        "fullName": "Felippe Henrique Mascarin",
        "photoUrl": "https://api.exemplo.com/uploads/cards/abc.jpg",
        "cpf": "12814673670"
      },
      "campusName": "Campus Poços De Caldas",
      "courseName": "Administração"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1
}
```

### Buscar uma carteirinha

`GET /admin/cards/:id`

### Editar carteirinha

`PUT /admin/cards/:id`

Pode aceitar `multipart/form-data` quando houver troca de foto.

### Excluir carteirinha

`DELETE /admin/cards/:id`

### Resetar senha da credencial

`POST /admin/cards/:id/reset-password`

Resposta `200` sugerida:

```json
{
  "username": "felippe.123456",
  "temporaryPassword": "NovaSenha123",
  "origin": "SGA"
}
```

### Endpoint do app mobile

`GET /mobile/me/card`

Esse endpoint deve devolver o payload pronto para o card do app autenticado.

Resposta `200` sugerida:

```json
{
  "name": "Felippe Henrique Mascarin",
  "studentCode": "7362946285",
  "roleLabel": "Aluno",
  "rg": "MG-22.814.943",
  "cpf": "12814673670",
  "birthDate": "2008-01-02",
  "campusName": "Campus Poços De Caldas",
  "courseName": "Administração",
  "photoUrl": "https://api.exemplo.com/uploads/cards/abc.jpg",
  "credential": {
    "accessCode": "00807683",
    "qrCodeValue": "00807683"
  },
  "status": "ATIVA",
  "validUntil": "2027-02-02"
}
```

## Upload de foto

### Recomendação
A foto deve ser salva pela API principal, não pelo painel.

### Opções
1. Storage em nuvem: S3, Cloudinary ou equivalente
2. Disco local apenas em desenvolvimento

### Regra
No banco deve ficar apenas a `photo_url`.

## Estratégia de migração

### Fase 1
- criar o schema correto na API principal
- gerar migrações Prisma na API principal
- criar endpoints REST acima

### Fase 2
- adaptar o Painel Admin para parar de usar `prisma` diretamente
- trocar `createCardAction`, `updateCardAction`, `deleteCardAction` e listagem por chamadas HTTP para `3001`
- criar `API_BASE_URL` no painel, por exemplo:

```env
API_BASE_URL="http://localhost:3001"
NEXT_PUBLIC_PORTAL_URL="http://localhost:3001"
NEXT_PUBLIC_PORTAL_CARD_PATH="/cartoes-de-acesso/{id}"
NEXT_PUBLIC_PORTAL_LOGIN_PATH="/aluno/login"
```

### Fase 3
- adaptar o formulário do painel para os campos faltantes:
  - `rg`
  - `birthDate`
  - `studentCode`
  - `roleLabel`
  - `campusName`
  - `accessCode`
  - `qrCodeValue`

### Fase 4
- fazer o app mobile consumir os endpoints autenticados da API principal
- remover qualquer duplicação de usuários e credenciais

## O que não fazer

- não manter um banco para o painel e outro para o app
- não manter schemas Prisma diferentes para o mesmo domínio
- não deixar o painel gerar credenciais fora da API principal
- não salvar foto em caminhos locais diferentes por projeto em produção

## Ajustes necessários neste projeto `painel-puc`

Hoje os pontos que terão de mudar aqui são:

- `painel-puc/actions/cards.ts`
  - remover gravação direta com `prisma.card.create/update/delete`
  - passar a chamar a API principal

- `painel-puc/app/admin/(protected)/cards/page.tsx`
  - trocar `prisma.card.findMany()` por `fetch` na API principal

- `painel-puc/app/admin/(protected)/cards/[id]/page.tsx`
  - trocar `prisma.card.findUnique()` por `fetch` na API principal

- `painel-puc/app/card/[id]/page.tsx`
  - decidir se continua existindo como página pública local ou se também lê da API principal

- `painel-puc/lib/storage.ts`
  - idealmente deixar de ser responsável pelo storage final

## Próximo passo recomendado

Implementar primeiro a API principal com o schema novo. Depois adaptar o painel para consumir esses endpoints.

Sem isso, qualquer integração do painel continuará frágil ou duplicada.
