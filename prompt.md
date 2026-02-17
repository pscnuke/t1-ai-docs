# CODEX PROMPT — t1-ai (NestJS + Prisma + Postgres) — Regras Operacionais (temporárias/permanentes) com prioridade sobre o RAG

Você é um Coding Agent especialista em **NestJS + TypeScript + Prisma + PostgreSQL** atuando no projeto real **t1-ai**.

## Objetivo (produção, multi-tenant)

Implementar **Regras Operacionais** por tenant (temporárias ou permanentes) que possam ser criadas por um supervisor/admin e que tenham **prioridade sobre os documentos do RAG**. As regras devem ser configuráveis em linguagem natural (título/descrição/response), mas **as “conditions” precisam ser estruturadas e validadas** (lista fixa e extensível em código), para ser previsível e segura em produção.

Exemplos de regras:

- “Atenção, o Dr João estará ausente de 01/03/2026 até 15/03/2026” → responder automaticamente essa mensagem (auto-reply) no período.
- “Se chegar mensagem do número 9999 já encaminhe para atendimento manual” → handoff imediato.
- “No carnaval não haverá atendimento” → auto-reply por janela de tempo.
- Regras podem ser **temporárias** (startsAt/endsAt) ou **permanentes** (sem endsAt).
- Não deletar regra: apenas **desabilitar**.

As regras devem ser **por tenant** (NUNCA misturar tenants) e devem rodar **antes** do RAG (retrieval/LLM). Elas também devem poder “pegar” saudações (oi/bom dia) quando necessário (ex.: clínica fechada → responder aviso mesmo se o usuário disser “oi”).

---

## Restrições obrigatórias

- ❌ sem `any`
- ❌ sem `require`
- ❌ sem `eslint-disable`
- ❌ sem bibliotecas novas
- ✅ manter ESLint + Prettier
- ✅ manter contratos públicos onde possível (apenas adicionar campos opcionais)
- ✅ Swagger atualizado para endpoints criados/alterados
- ✅ falha em regras (ex.: JSON inválido no banco) **não pode derrubar** o fluxo; deve logar warning e seguir o fluxo normal

---

## Passo 0 — Descoberta (NÃO pule)

Antes de codar, leia no repo:

1. `prisma/schema.prisma`
   - confirme enums existentes, especialmente `AiResponseType`
   - confirme `Tenant` e `AiMessageLog` e campos atuais
2. `src/openai/rag/rag.service.ts`
   - confirme o fluxo atual do `chat(...)` (ordem: carregamento prompt-pack, classificação de mensagem, routing/intention, retrieval, resposta, logging)
3. `src/openai/rag/ai-observability.service.ts` e `src/openai/rag/ai-message-log.repository.ts`
   - como logar no `AiMessageLog`
4. Controllers admin existentes (ex.: `admin-*`) para seguir padrão de autenticação/guards/DTOs/Swagger.
5. Swagger atual (projeto já tem `/api-docs` em dev) e DTO do `/ai/chat` para manter compatibilidade.

Só depois implemente.

---

## “Conditions” (explicação e decisão de produção)

**Conditions** são os critérios estruturados que determinam se uma regra “dispara”. Em produção, isso NÃO deve ser texto livre, porque:

- texto livre é ambíguo, difícil de validar, e pode gerar falsos positivos
- UI precisa montar formulários previsíveis
- auditoria e testes ficam melhores com estrutura

Portanto:

- teremos um **catálogo fixo** de `ConditionType` (extensível via código)
- cada regra armazena um `conditions` em JSON **validado** (com versão + op AND/OR + itens)
- UI do front pode consumir um endpoint de “capabilities” para saber quais conditions existem e quais campos cada uma pede.

---

## Escopo de implementação

1. Criar persistência no Postgres (Prisma) para regras operacionais por tenant.
2. Criar endpoints Admin para CRUD (sem delete; enable/disable).
3. Integrar avaliação das regras no início do fluxo do `/ai/chat`, garantindo prioridade sobre o RAG.
4. Logging em `AiMessageLog`: registrar qual regra foi aplicada (id/nome/ação).
5. Atualizar Swagger de tudo que for criado/alterado.
6. Atualizar todos os `agents.md` encontrados no repo com a regra de “Operational Rules”.

---

## 1) Prisma — Modelos + Enum + Migration

### 1.1) Adicionar novo responseType para log

No enum existente `AiResponseType` (já tem `RAG`, `FALLBACK`, `OUT_OF_SCOPE`, `GREETING`, `SUMMARY`), adicionar:

- `OPERATIONAL_RULE`

### 1.2) Criar enums para regras

Adicionar no `schema.prisma`:

- `enum OperationalRuleActionType { AUTO_REPLY HANDOFF ADD_SYSTEM_NOTE }`
  - `AUTO_REPLY`: devolve resposta pronta (sem retrieval)
  - `HANDOFF`: sinaliza transbordo/humano (mantém contrato do endpoint, mas `blocked=true` por exemplo)
  - `ADD_SYSTEM_NOTE`: injeta nota de sistema ANTES do LLM (não é necessário disparar agora se quiser manter simples; mas implemente o modelo para suportar)

- `enum OperationalConditionType { MESSAGE_CONTAINS MESSAGE_REGEX SENDER_EQUALS SENDER_IN CATEGORY_EQUALS CATEGORY_IN }`
  - `MESSAGE_*` opera em cima do texto “principal” da conversa/mensagem do request (ver item 3)
  - `SENDER_*` usa metadado opcional (ex.: número whatsapp)
  - `CATEGORY_*` usa a categoria resultante da classificação de mensagem (que já existe no fluxo)

### 1.3) Criar model OperationalRule (tenant-scoped)

Adicionar em `schema.prisma`:

- `model OperationalRule {`
  - `id String @id @default(uuid())`
  - `tenantId String`
  - `name String`
  - `description String?` (texto livre do supervisor)
  - `isEnabled Boolean @default(true)`
  - `priority Int @default(100)` (menor número = maior prioridade)
  - `startsAt DateTime?`
  - `endsAt DateTime?`
  - `conditions Json` // expressão com version + op + itens
  - `actionType OperationalRuleActionType`
  - `actionPayload Json` // depende do actionType (ex.: { replyText: "...", handoffReason: "...", systemNote: "..." })
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)`
  - `@@index([tenantId, isEnabled, priority])`
  - `@@index([tenantId, startsAt, endsAt])`
- `}`

### 1.4) Log: adicionar campos no AiMessageLog (sem quebrar o que já existe)

No model `AiMessageLog`, adicionar campos opcionais:

- `operationalRuleId String?`
- `operationalRuleName String?`
- `operationalRuleActionType OperationalRuleActionType?`
- `operationalRulePriority Int?`

(Manter existentes de classificação, etc. Não remova nada.)

### 1.5) Migration

Criar migration:

- `npx prisma migrate dev -n add_operational_rules`

Garanta que os testes e build passem.

---

## 2) DTO/Contrato — /ai/chat (compatível)

Hoje o `/ai/chat` recebe `{ message: string }`. **Não quebre isso.**
Apenas adicione campos opcionais para permitir conditions “SENDER\_\*” e futuro contexto.

Atualize o DTO do `/ai/chat` (RagChatDto) para aceitar também:

- `meta?: { fromPhone?: string; channel?: 'whatsapp' | 'web' | 'api'; authorId?: string }`
- `conversationId?: string` (opcional, apenas para log/observabilidade)

O serviço deve continuar funcionando se o cliente mandar apenas `{ message }`.

Atualize Swagger do endpoint `/ai/chat` com esses opcionais.

---

## 3) Formato de “conditions” (JSON validado)

Armazenar no campo `OperationalRule.conditions` um JSON com estrutura **versionada**:

### 3.1) Tipos TS internos (sem exportar para API pública obrigatoriamente)

Criar types internos (ex.: `src/openai/rag/operational-rules/operational-rules.types.ts`):

- `type ConditionLeaf = { type: OperationalConditionType; params: Record<string, unknown> }`
- `type ConditionGroup = { op: 'AND' | 'OR'; items: Array<ConditionGroup | ConditionLeaf> }`
- `type OperationalRuleConditions = { version: 1; root: ConditionGroup }`

### 3.2) Params esperados por ConditionType (lista fixa)

Implementar validação manual (sem libs novas). Regras:

- `MESSAGE_CONTAINS`:
  - params: `{ text: string; caseSensitive?: boolean }`
- `MESSAGE_REGEX`:
  - params: `{ pattern: string; flags?: string }` (validar regex com try/catch)
- `SENDER_EQUALS`:
  - params: `{ phone: string }`
- `SENDER_IN`:
  - params: `{ phones: string[] }`
- `CATEGORY_EQUALS`:
  - params: `{ categoryId: string }` (ou permitir categoryName, mas prefira id)
- `CATEGORY_IN`:
  - params: `{ categoryIds: string[] }`

Validação deve retornar erro 400 nos endpoints admin se inválido.

### 3.3) Capabilities endpoint para UI

Criar endpoint:

- `GET /admin/operational-rules/capabilities`
  Retornar JSON com:
- lista de `conditionTypes` e o schema esperado (nome de fields + descrição)
- lista de `actionTypes` e payload esperado
  Isso evita hardcode no front e é mais “produção”.

---

## 4) Admin Endpoints (CRUD sem delete) + Swagger

Criar controller admin seguindo o padrão dos outros `admin-*` no projeto, com guards/autorização existentes.

Endpoints sugeridos:

- `GET /admin/operational-rules?tenantId=...&includeDisabled=false`
- `POST /admin/operational-rules`
- `PATCH /admin/operational-rules/:id`
- `POST /admin/operational-rules/:id/disable`
- `POST /admin/operational-rules/:id/enable`
- `GET /admin/operational-rules/capabilities`

Regras:

- Sempre exigir/validar `tenantId` (e opcionalmente validar que Tenant existe).
- `POST` e `PATCH` validam `conditions` e `actionPayload`.
- Não deletar: só disable.

Swagger:

- `@ApiTags('Admin - Operational Rules')`
- `@ApiOperation` com `summary` e `description`
- `@ApiQuery` para tenantId/filters
- `@ApiBody` com exemplos completos
- `@ApiResponse` (200/201/400/404/500)
- Documentar que isso tem prioridade sobre o RAG.

---

## 5) Service/Repository — regras operacionais

Criar pasta/módulo (exemplo):

- `src/openai/rag/operational-rules/`

Arquivos mínimos:

- `operational-rule.repository.ts` (Prisma queries)
- `operational-rule.service.ts` (validação + avaliação + cache)
- `operational-rule.dto.ts` (Create/Update DTOs com class-validator)
- `admin-operational-rules.controller.ts`
- `operational-rules.module.ts` (exporta service)

### 5.1) Cache (produção sem infra extra)

Implementar cache em memória por tenant com TTL curto (ex.: 10–30s) para reduzir queries no chat.

- Use `Map<string, { expiresAt: number; rules: OperationalRule[] }>`
- Em update/create/enable/disable: invalidar cache daquele tenant.
- Em múltiplas instâncias, TTL curto é suficiente (eventual consistency aceitável). Não introduzir Redis agora.

### 5.2) Query de regras “ativas”

Buscar regras por tenant:

- `tenantId = ...`
- `isEnabled = true`
- janela de tempo:
  - (`startsAt` is null OR `startsAt` <= now)
  - AND (`endsAt` is null OR `endsAt` >= now)
- order:
  - `priority asc`, depois `createdAt desc`

---

## 6) Integração no fluxo do /ai/chat (prioridade sobre RAG)

Editar `src/openai/rag/rag.service.ts` no método `chat(...)`:

### 6.1) Ordem correta (produção)

Ordem desejada:

1. carregar prompt-pack/tenant config (como já existe)
2. classificar mensagem (como já existe; inclusive saudações)
3. **avaliar Operational Rules** (novo) — se match, responder imediatamente conforme action
4. routing atual (greeting/handoff/out-of-scope etc) se não houve rule
5. retrieval/LLM do RAG se liberado

Importante: Operational Rules devem rodar **antes** do greeting guard para que “clínica fechada” ganhe de “oi”.

### 6.2) Como obter texto-base da regra

Como o endpoint hoje é `{ message }`, use:

- `message` como texto principal (string)
  Se `meta` existir, passe para avaliação (sender conditions).

### 6.3) Ações

- `AUTO_REPLY`:
  - retornar `answer` com `actionPayload.replyText`
  - `usedLlm = false`, `usedChunkIds = []`
  - `responseType = OPERATIONAL_RULE`
  - `blocked = false` (a menos que o contrato atual exija; não inventar)
- `HANDOFF`:
  - retornar `answer` com `actionPayload.messageToUser` ou um default
  - `usedLlm = false`, `responseType = OPERATIONAL_RULE`
  - `blocked = true` (se hoje “transbordo” usa blocked; manter)
- `ADD_SYSTEM_NOTE`:
  - não precisa bloquear; injeta um texto no system prompt **antes** do LLM (ex.: “A clínica está em reformas...”)
  - se optar por simplificar agora, você pode implementar `ADD_SYSTEM_NOTE` somente como “prefixo” do system prompt, sem mudar contratos.

### 6.4) Placeholders simples (sem libs)

Implementar interpolação mínima no replyText/systemNote:

- Suporte `{{tenantId}}`, `{{tenantName}}` (se você conseguir carregar), `{{startsAt}}`, `{{endsAt}}`, `{{now}}`
- Datas formatadas em pt-BR (pode usar `Intl.DateTimeFormat('pt-BR')`)
- Falha em placeholder não deve quebrar.

---

## 7) Logging em AiMessageLog

Ao logar qualquer resposta (inclusive early-return), preencher:

- `responseType = OPERATIONAL_RULE` quando regra aplicada
- `operationalRuleId`, `operationalRuleName`, `operationalRuleActionType`, `operationalRulePriority`
- manter o resto (classificationCategoryId/Name/Confidence/Reason etc) como já existe

Garanta:

- falha no log não derruba o fluxo (try/catch + warn)

---

## 8) Testes (obrigatório)

### 8.1) Unit tests

Criar testes unitários para:

- validação de `conditions` (aceita e rejeita corretamente)
- avaliação AND/OR, regex inválida, caseSensitive
- janela de tempo (startsAt/endsAt)
- condições por sender e por categoria (simular classification)

### 8.2) E2E (se o repo já usa e2e)

Cobrir:

1. Cria regra AUTO_REPLY para tenant X (ativa) com MESSAGE_CONTAINS “unimed”
2. Chama `POST /ai/chat` com `{ message: "Vocês atendem Unimed?", meta: { fromPhone: "9999" } }`
3. Deve retornar resposta da regra, `responseType = OPERATIONAL_RULE`
4. Log deve conter operationalRuleId/name
5. Desabilita regra e garante que o fluxo volta ao normal (não precisa validar RAG, apenas que não retorna a resposta da regra)

---

## 9) Atualizar agents.md (obrigatório)

Buscar no repo por `agents.md` (existem múltiplos).
Adicionar seção “Operational Rules” com:

- Regras são tenant-scoped
- Nunca misturar tenants
- Ordem de precedência: Security/Compliance guard (se existir) → Operational Rules → Greeting/Handoff → RAG
- Todo endpoint novo/alterado deve ter Swagger atualizado
- Toda mudança em Prisma exige migration e testes

---

## Critérios de aceitação

- [ ] Existe `OperationalRule` no Postgres/Prisma com conditions JSON validado e action payload
- [ ] Admin consegue criar/editar/listar/enable/disable regras por tenant
- [ ] `/ai/chat` aplica regra ativa com prioridade, sem usar retrieval/LLM quando AUTO_REPLY/HANDOFF
- [ ] `AiMessageLog` registra qual regra foi aplicada
- [ ] Swagger atualizado
- [ ] Testes passam
- [ ] agents.md atualizado

---

## Entrega final do agente (obrigatório)

Ao finalizar, retornar:

1. lista de arquivos alterados/criados
2. migration criada (nome)
3. exemplos de payload para criar regra (AUTO_REPLY e HANDOFF)
4. como testar via Postman/cURL rapidamente
5. evidência (ou descrição) de log com operationalRuleId preenchido

FIM
