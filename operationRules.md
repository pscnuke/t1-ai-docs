Perfeito. Estudei backend + frontend + Prisma.

**1) Como as Regras Operacionais são armazenadas**

- Ficam no **Postgres**, na tabela/model `OperationalRule` (não no Firestore): [schema.prisma](/Users/paulo/dsv/teste-ai/t1-ai/prisma/schema.prisma#L137).
- Campos principais:
  - `tenantId`, `name`, `description`, `isEnabled`, `priority`, `startsAt`, `endsAt`
  - `conditions` (**Json**)
  - `actionType` (enum `AUTO_REPLY | HANDOFF | ADD_SYSTEM_NOTE`)
  - `actionPayload` (**Json**)
- Tipos de condição permitidos vêm do enum `OperationalConditionType`: [schema.prisma](/Users/paulo/dsv/teste-ai/t1-ai/prisma/schema.prisma#L55).
- Logs de execução da regra são gravados em `AiMessageLog` (`operationalRuleId`, `operationalRuleActionType`, etc.): [schema.prisma](/Users/paulo/dsv/teste-ai/t1-ai/prisma/schema.prisma#L85), [ai-observability.service.ts](/Users/paulo/dsv/teste-ai/t1-ai/src/openai/rag/ai-observability.service.ts#L256).
- O `seed.ts` **não** cria `OperationalRule`; ele semeia templates de categorias/filas/prompt packs: [seed.ts](/Users/paulo/dsv/teste-ai/t1-ai/prisma/seed.ts#L1149).

**2) Como elas são usadas no runtime**

- No chat, as regras são avaliadas no início do fluxo (antes da busca RAG): [rag.service.ts](/Users/paulo/dsv/teste-ai/t1-ai/src/openai/rag/rag.service.ts#L540), [rag.service.ts](/Users/paulo/dsv/teste-ai/t1-ai/src/openai/rag/rag.service.ts#L914).
- Busca regras ativas por tenant + vigência + prioridade (menor número = maior prioridade): [operational-rule.repository.ts](/Users/paulo/dsv/teste-ai/t1-ai/src/openai/rag/operational-rules/operational-rule.repository.ts#L152).
- Avaliação é determinística (código), sobre contexto:
  - `messageText`, `meta.fromPhone`, `meta.inboundIdentity`, `categoryId`: [operational-rules.types.ts](/Users/paulo/dsv/teste-ai/t1-ai/src/openai/rag/operational-rules/operational-rules.types.ts#L44), [operational-rule.service.ts](/Users/paulo/dsv/teste-ai/t1-ai/src/openai/rag/operational-rules/operational-rule.service.ts#L896).
- A primeira regra que casar dispara:
  - `AUTO_REPLY`: responde e encerra
  - `HANDOFF`: retorna mensagem operacional e encerra
  - `ADD_SYSTEM_NOTE`: injeta nota e continua fluxo normal: [operational-rule.service.ts](/Users/paulo/dsv/teste-ai/t1-ai/src/openai/rag/operational-rules/operational-rule.service.ts#L324), [rag.service.ts](/Users/paulo/dsv/teste-ai/t1-ai/src/openai/rag/rag.service.ts#L684).

**3) Elas usam LLM ou RAG?**

- **Motor de regra (match + decisão): não usa LLM nem RAG**, é regra em código.
- **Exceção**: endpoint de linguagem natural (`POST /admin/operational-rules/natural-language`) usa LLM para traduzir instrução em JSON de regra (preview): [admin-operational-rules.controller.ts](/Users/paulo/dsv/teste-ai/t1-ai/src/openai/rag/admin-operational-rules.controller.ts#L435), [operational-rule.service.ts](/Users/paulo/dsv/teste-ai/t1-ai/src/openai/rag/operational-rules/operational-rule.service.ts#L703).
- `ADD_SYSTEM_NOTE` impacta o prompt e aí o fluxo pode usar RAG/LLM depois.

**4) Endpoints backend e entrada no frontend**

- Backend (grupo Admin Operational Rules):  
  `GET /capabilities`, `GET /`, `POST /`, `POST /natural-language`, `PATCH /:id`, `POST /:id/disable`, `POST /:id/enable`: [admin-operational-rules.controller.ts](/Users/paulo/dsv/teste-ai/t1-ai/src/openai/rag/admin-operational-rules.controller.ts#L229).
- Frontend (tela Configurações -> Regras Operacionais) está no projeto **`t1-ai-front`**:
  - chamadas API: [settings.ts](/Users/paulo/dsv/teste-ai/t1-ai-front/src/services/settings.ts#L27)
  - rotas: [endpoints.ts](/Users/paulo/dsv/teste-ai/t1-ai-front/src/services/endpoints.ts#L53)
  - UI/form: [SettingsView.tsx](/Users/paulo/dsv/teste-ai/t1-ai-front/src/features/settings/SettingsView.tsx#L2360)

**5) “Como criar novas Keys/Chaves?”**

- Ponto importante: `OperationalRule` **não tem campo `key`** (tem `id` e `name`).
- Se “chave” = **novo tipo de condição/ação** (ex.: novo `type`):
  1. adicionar no enum Prisma (`OperationalConditionType` ou `OperationalRuleActionType`) e gerar migration: [schema.prisma](/Users/paulo/dsv/teste-ai/t1-ai/prisma/schema.prisma#L49)
  2. atualizar catálogo de capacidades: [operational-rules.types.ts](/Users/paulo/dsv/teste-ai/t1-ai/src/openai/rag/operational-rules/operational-rules.types.ts#L96)
  3. atualizar validação + execução no service: [operational-rule.service.ts](/Users/paulo/dsv/teste-ai/t1-ai/src/openai/rag/operational-rules/operational-rule.service.ts#L564)
  4. atualizar frontend (labels, tipos e selects de ação): [SettingsView.tsx](/Users/paulo/dsv/teste-ai/t1-ai-front/src/features/settings/SettingsView.tsx#L135), [SettingsView.tsx](/Users/paulo/dsv/teste-ai/t1-ai-front/src/features/settings/SettingsView.tsx#L2447), [types/settings.ts](/Users/paulo/dsv/teste-ai/t1-ai-front/src/types/settings.ts#L1).
- Se “chave” = criar uma **nova regra operacional** (instância), usa `POST /admin/operational-rules` com `conditions` + `actionType` + `actionPayload`.

Se quiser, eu te entrego no próximo passo um “guia prático” com exemplo real de payload para criar 3 regras (auto-reply, handoff e add_system_note).
