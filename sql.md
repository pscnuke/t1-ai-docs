### Comandos uteis para testar o banco de dados

```bash
# conectar banco
psql -U rag_user -d rag_db
```

```sql

# lista tabelas
\dt

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

# consulta PromptPackTemplate

select "tenantType", "key", "createdAt", "updatedAt" from "PromptPackTemplate";

```

```
