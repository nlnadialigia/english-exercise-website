# 📘 Plano de Ação — Correção de Exercícios com IA
Aplicação educacional (Next.js + Prisma + IA)

## 🎯 Objetivo
Evoluir a plataforma de exercícios de inglês adicionando:
- Exercícios de compreensão de texto
- Exercícios de diálogo (texto)
- Correção automática com IA
- Feedback pedagógico estruturado
- Arquitetura escalável, econômica e adequada a nível pleno/sênior

## 🧱 Stack Atual
- **Frontend / Backend**: Next.js (App Router)
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL
- **Hospedagem**: Vercel
- **Auth**: (assumido) NextAuth / Auth.js
- **Linguagem**: TypeScript

## 🧠 Visão Geral da Arquitetura

Client (Aluno / Professor)
↓
Next.js API Routes
↓
Service Layer (Domínio)
├── Correção por Regras
├── Correção por IA
├── Prompt Factory
└── Observabilidade
↓
Prisma / PostgreSQL

A lógica de domínio **não fica nas rotas**.

---

## 📦 Bibliotecas Principais

### Core
- **Next.js**
  https://nextjs.org/docs
- **Prisma**
  https://www.prisma.io/docs
- **TypeScript**
  https://www.typescriptlang.org/docs/

### IA
- **OpenAI SDK** (ou compatível)
  https://platform.openai.com/docs
- **Hugging Face Inference API (opcional / fallback)**
  https://huggingface.co/docs/api-inference

### Background / Jobs
- **Upstash Redis**
  https://upstash.com/docs
- **BullMQ**
  https://docs.bullmq.io/

### Observabilidade
- **Pino (logs)**
  https://getpino.io/
- **Zod (validação)**
  https://zod.dev/

---

## 🗂️ Estrutura de Pastas Recomendada


src/
├── app/
│   └── api/
│       └── exercises/
│           └── submit/route.ts
├── services/
│   ├── ai/
│   │   ├── aiCorrectionService.ts
│   │   ├── promptFactory.ts
│   │   └── aiClient.ts
│   ├── correction/
│   │   ├── ruleBasedCorrection.ts
│   │   └── correctionOrchestrator.ts
│   └── observability/
│       └── correctionLogger.ts
├── queues/
│   └── correctionQueue.ts
├── types/
│   └── correction.ts

`

---

## 🧪 Tipos de Exercício (Novos)

### 1️⃣ Compreensão de Texto
- Texto base
- Pergunta aberta
- Resposta textual do aluno

Avaliação:
- Correção semântica
- Gramática
- Vocabulário
- Coerência

---

### 2️⃣ Diálogo (Texto)
- Contexto do diálogo
- Turno esperado do aluno
- Avaliação contextual

Avaliação:
- Adequação ao contexto
- Naturalidade
- Vocabulário
- Clareza

---

## 🤖 Estratégia de Correção (Híbrida)

### Etapa 1 — Regras Determinísticas
Executadas localmente:
- Tamanho mínimo da resposta
- Presença de palavras-chave
- Estrutura básica da frase

### Etapa 2 — IA (Somente se passar nas regras)
- Avaliação semântica
- Feedback pedagógico
- Sugestão de resposta

➡️ Reduz custo e dependência da IA

---

## 🧠 Prompt Engineering

### Prompt Base
- Sempre solicitar **JSON válido**
- Informar:
  - Nível do aluno (A2, B1, B2…)
  - Objetivo do exercício
  - Critérios de avaliação

### Exemplo de saída esperada:
json
{
  "score": 0.8,
  "isCorrect": true,
  "feedback": {
    "grammar": "...",
    "vocabulary": "...",
    "coherence": "..."
  },
  "suggestedAnswer": "..."
}
`

---

## 🔄 Fluxo Assíncrono de Correção

1. Aluno envia resposta
2. API salva como `PENDING`
3. Job é enviado para fila
4. Worker executa:

   * Regras
   * IA
   * Persistência do resultado
5. Status atualizado para `DONE` ou `FAILED`

Estados:

* `PENDING`
* `PROCESSING`
* `DONE`
* `FAILED`

---

## 📊 Observabilidade e Controle

Registrar:

* Tempo de correção
* Modelo utilizado
* Tokens estimados
* Erros de parsing
* Revisões manuais do professor

---

## 🆓 Estratégia de Uso Gratuito de IA

* Limite diário por aluno
* Feedback resumido
* Correção assíncrona
* Cache de respostas similares

Fallback:

* Se IA falhar → mensagem educativa + revisão manual

---

## 🧪 Testes

### Tipos recomendados:

* Testes de regras determinísticas
* Testes de parsing do JSON da IA
* Testes de prompt (snapshot)

Libs:

* **Vitest**
  [https://vitest.dev/](https://vitest.dev/)

---

## 📄 README (Checklist para Portfólio)

* Problema real
* Decisões de arquitetura
* Por que Next.js sem backend separado
* Uso consciente de IA
* Limitações conhecidas
* Próximos passos

---

## 🚀 Próximos Passos (Evolução)

* Áudio (Speech-to-Text)
* Extração do serviço de IA
* WebSockets para feedback em tempo real
* Dashboard analítico para professores

---

## 🏁 Conclusão

Este projeto demonstra:

* Arquitetura limpa
* Uso responsável de IA
* Visão de produto
* Decisões técnicas conscientes
