### Comandos uteis para testar o banco de dados

```bash
# conectar banco
psql -U rag_user -d rag_db

```

```sql
# ver usuários
\du

# lista tabelas
\dt

# listar bancos
\l

# listar extensões
\dx

# ver usuário corrente
SELECT current_user, session_user;


#contar registros de uma tabela (testar)
SELECT COUNT(*) FROM "RagChunk";

# consultar AiMessageLog
SELECT "id", "tenantId", "responseType", "createdAt", "usedLlm"
FROM "AiMessageLog"
ORDER BY "createdAt" DESC
LIMIT 5;

# consulta Tenant
select * from "Tenant";
```

## Consulta as Categorias de Mensagens

```sql
# consulta os templates das categorias das mensagens [MessageCategoryTemplate]
select "tenantType", "key", "name", "createdAt" from "MessageCategoryTemplate" order by "tenantType";

# consulta as categorias das mensagens do tenant [MessageCategory]
SELECT "tenantId", "key", "name", "createdAt" FROM "MessageCategory";
```

## Consulta os PromptPack

```sql
# consulta aos templates de Prompt Packs [PromptPackTemplate]
select "tenantType", "key", "createdAt", "updatedAt" from "PromptPackTemplate" order by "tenantType";
select "tenantType", "key", "createdAt", "updatedAt" from "PromptPackTemplate" where "tenantType" = 'CLINIC' and "key" = 'INTENTION_RULES';
select "tenantType", "key", "content" from "PromptPackTemplate" where "tenantType" = 'CLINIC' and "key" = 'INTENTION_RULES';

# consulta aos Prompt Packs do tenant [PromptPack]
select "tenantId", "key" from "PromptPack";
select "tenantId", "key", "content" from "PromptPack" where "tenantId" = 'clinica_orto_exemplo' and "key" = 'FALLBACK';
select
  "id",
  "tenantId",
  "key",
  "content",
  "createdAt",
  "updatedAt"
from "PromptPack"
where "key" = 'CONVERSATION_SUMMARY';



select "tenantId", "key", "content" from "PromptPack" where "tenantId" = 'clinica_orto_exemplo' and "key" = 'INTENTION_RULES';

# consulta a regra operacional (OperationalRule)
select "id", "tenantId", "name", "description", "isEnabled", "priority", "actionType" from "OperationalRule";

```
