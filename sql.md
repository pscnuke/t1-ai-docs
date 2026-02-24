# Comandos uteis para testar o banco de dados

```bash
# subir banco
brew services start postgresql@17

# parar banco
brew services stop postgresql@17

# conectar banco
psql -U rag_user -d rag_db

```

## Geral

```sql
# ver usuários
\du

# lista tabelas
\dt

# listar bancos
\l

# listar extensões
\dx

# limpar tela
\! clear


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

## Categorias de Mensagens

### Categorias dos templates

```sql
# consulta os templates das categorias das mensagens [MessageCategoryTemplate]
select "tenantType", "key", "name", "createdAt" from "MessageCategoryTemplate" order by "tenantType";
```

### Categorias do tenant

```sql
# consulta as categorias do tenant [MessageCategory]
SELECT "key", "name", "isActive", "createdAt", "updatedAt" FROM "MessageCategory"
WHERE "tenantId" = 'cAX0ZWfKhjRuxfCNdrfC';

# consulta as categorias do tenant com descrição e exemplos
SELECT "key", "description", "examples" FROM "MessageCategory"
WHERE "tenantId" = 'cAX0ZWfKhjRuxfCNdrfC';
```

## PromptPack

### PromptPack do templates

```sql
# consulta aos templates de Prompt Packs [PromptPackTemplate]
select "tenantType", "key", "createdAt", "updatedAt" from "PromptPackTemplate" order by "tenantType";
select "tenantType", "key", "createdAt", "updatedAt" from "PromptPackTemplate" where "tenantType" = 'CLINIC';
select "tenantType", "key", "createdAt", "updatedAt" from "PromptPackTemplate" where "tenantType" = 'CLINIC' and "key" = 'INTENTION_RULES';
select "tenantType", "key", "content" from "PromptPackTemplate" where "tenantType" = 'CLINIC' and "key" = 'INTENTION_RULES';
```

### PromptPack de tenant

```sql
# consulta aos Prompt Packs do tenant [PromptPack]
select "tenantId", "key" from "PromptPack";

select "tenantId", "key", "content" from "PromptPack" where "tenantId" = 'clinica_orto_exemplo' and "key" = 'FALLBACK';

select "id", "tenantId", "key", "content", "createdAt","updatedAt"
from "PromptPack" where "key" = 'CONVERSATION_SUMMARY';

select "tenantId", "key", "content" from "PromptPack" where "tenantId" = 'clinica_orto_exemplo' and "key" = 'INTENTION_RULES';


```

## Regras Operacionais

```sql
# consulta geral a regra operacional [OperationalRule]
select "id", "tenantId", "name", "description", "isEnabled", "priority", "actionType" from "OperationalRule";
```

## Filas (Queue)

### Filas do Templates

```sql
# consulta geral a filas do template [ConversationQueueTemplate]
SELECT "id", "updatedAt", "tenantType", "key", "name", "isDefault"
FROM "ConversationQueueTemplate" ORDER BY "tenantType";

```

### Filas do tenant

```sql
# consulta geral a filas do tenant [ConversationQueue]
SELECT "id", "createdAt", "updatedAt", "tenantId", "key", "name", "isSystem"
FROM "ConversationQueue" ORDER BY "tenantId";

```
