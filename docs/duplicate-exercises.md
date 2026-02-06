# Funcionalidade de Duplicar Cadernos

## Visão Geral

Foi implementada a funcionalidade de duplicar cadernos de exercícios no dashboard do professor, com inversão automática do target audience.

## Funcionalidades

### Duplicação de Cadernos
- **Localização**: Menu dropdown de ações nos exercícios
- **Ícone**: Copy (ícone de duplicar)
- **Comportamento**: Cria uma cópia do caderno com target invertido

### Regras de Duplicação
1. **Target Audience**: Automaticamente invertido
   - Particular → Bela Lira
   - Bela Lira → Particular

2. **Título**: Adiciona sufixo "(Copy)" ao título original

3. **Status**: Sempre criado como rascunho (não publicado)

4. **Conteúdo**: Mantém todos os exercícios e configurações originais

## Arquivos Modificados

### API Route
- `app/api/exercises/[id]/duplicate/route.ts` - Nova API para duplicação

### Interface
- `app/dashboard/teacher/TeacherDashboardClient.tsx` - Adicionada opção no menu

## Implementação Técnica

### Endpoint da API
```
POST /api/exercises/[id]/duplicate
```

### Autenticação
- Requer usuário logado (teacher ou admin)
- Professores só podem duplicar seus próprios exercícios
- Admins podem duplicar qualquer exercício

### Processo de Duplicação
1. Busca o exercício original
2. Verifica permissões do usuário
3. Cria nova entrada no banco com:
   - Título com "(Copy)"
   - Target audience invertido
   - Status como rascunho
   - Mesmo conteúdo e configurações

### Feedback ao Usuário
- Toast de sucesso com mensagem explicativa
- Atualização automática da lista de exercícios
- Tratamento de erros com mensagens apropriadas

## Como Usar

1. **Acessar Dashboard**: Vá para o dashboard do professor
2. **Localizar Exercício**: Na aba "Exercises", encontre o caderno desejado
3. **Abrir Menu**: Clique no ícone de três pontos (⋮) na coluna Actions
4. **Duplicar**: Clique em "Duplicate" no menu dropdown
5. **Confirmação**: Aguarde a mensagem de sucesso

## Resultado da Duplicação

### Exercício Original: Particular
- **Novo exercício**: Target = Bela Lira
- **Título**: "Nome Original (Copy)"
- **Status**: Rascunho

### Exercício Original: Bela Lira  
- **Novo exercício**: Target = Particular
- **Título**: "Nome Original (Copy)"
- **Status**: Rascunho

## Casos de Uso

1. **Adaptar Conteúdo**: Usar o mesmo exercício para diferentes públicos
2. **Versões Alternativas**: Criar variações do mesmo conteúdo
3. **Backup**: Manter cópia antes de grandes modificações
4. **Reutilização**: Aproveitar estrutura existente para novos exercícios

## Limitações

- Não duplica submissões ou histórico
- Sempre cria como rascunho (precisa republicar)
- Não permite duplicação em lote
- Título sempre recebe sufixo "(Copy)"

## Possíveis Melhorias Futuras

- Opção de editar título durante duplicação
- Duplicação em lote (múltiplos exercícios)
- Preservar status de publicação (opcional)
- Duplicação para outros professores (admin)
- Histórico de duplicações
