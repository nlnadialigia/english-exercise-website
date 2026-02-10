# 📋 Guia de Uso do Logger

## 🚀 Importação

```typescript
import { logger } from "@/lib/logger";
// ou
import logger from "@/lib/logger";
```

## 📝 Métodos Básicos

### Níveis de Log
```typescript
// Debug (apenas em desenvolvimento)
logger.debug("Informação de debug", "CONTEXT", { data: "example" });

// Info (informações gerais)
logger.info("Operação realizada com sucesso");

// Warning (avisos)
logger.warn("Algo pode estar errado", "WARNING", { details: "..." });

// Error (erros)
logger.error("Erro crítico", "ERROR", errorObject);
```

### Métodos Específicos por Contexto
```typescript
// Autenticação
logger.auth("Usuário logado", { email: "user@example.com" });

// Middleware
logger.middleware("Requisição processada", { path: "/dashboard" });

// Database
logger.database("Query executada", { table: "users", rows: 5 });

// API
logger.api("Endpoint chamado", { method: "POST", endpoint: "/api/users" });

// Session
logger.session("Sessão criada", { sessionId: "***" });
```

## 🎯 Exemplos Práticos

### Em Server Actions
```typescript
"use server";
import { logger } from "@/lib/logger";

export async function createUser(formData: FormData) {
  logger.auth("Criando novo usuário");
  
  try {
    // ... lógica
    logger.auth("Usuário criado com sucesso", { email });
  } catch (error) {
    logger.error("Erro ao criar usuário", "AUTH", error);
  }
}
```

### Em API Routes
```typescript
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  logger.api("POST /api/users iniciado");
  
  try {
    // ... lógica
    logger.api("Usuário criado via API", { userId });
    return Response.json({ success: true });
  } catch (error) {
    logger.error("Erro na API", "API", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
```

### Em Componentes Server
```typescript
import { logger } from "@/lib/logger";

export default async function Dashboard() {
  logger.info("Dashboard carregado");
  
  try {
    const data = await fetchData();
    logger.info("Dados carregados", "DASHBOARD", { count: data.length });
    return <div>...</div>;
  } catch (error) {
    logger.error("Erro ao carregar dashboard", "DASHBOARD", error);
    return <div>Erro</div>;
  }
}
```

## 📊 Formato de Saída

```
2024-01-15 14:30:25 ℹ️ [AUTH] Usuário logado {"email":"user@example.com"}
2024-01-15 14:30:26 🔍 [MIDDLEWARE] Executando para: /dashboard/admin
2024-01-15 14:30:27 ❌ [DATABASE] Erro na query {"table":"users","error":"..."}
```

## ⚙️ Configuração

- **Desenvolvimento**: Todos os logs são exibidos
- **Produção**: Logs de debug são omitidos
- **Contexto**: Sempre inclua contexto para facilitar debugging
- **Dados sensíveis**: Use `***` para mascarar informações sensíveis

## 🔒 Segurança

```typescript
// ❌ Não faça isso
logger.auth("Login", { password: "123456" });

// ✅ Faça isso
logger.auth("Login", { email: "user@example.com", sessionId: "***" });
```