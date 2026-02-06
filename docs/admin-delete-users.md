# Funcionalidade de Exclusão de Usuários - Dashboard Admin

## Visão Geral

Foi implementada a funcionalidade de excluir professores e alunos no dashboard do administrador, com validações de segurança para proteger dados importantes.

## Funcionalidades

### Exclusão de Usuários
- **Localização**: Coluna "Ações" na tabela de usuários
- **Ícone**: Trash2 (lixeira) em vermelho
- **Usuários permitidos**: Apenas professores e alunos
- **Restrição**: Administradores não podem ser excluídos

### Validações de Segurança

#### Para Professores:
- ❌ **Não pode excluir** se tiver exercícios criados
- ❌ **Não pode excluir** se tiver alunos vinculados
- ✅ **Pode excluir** apenas se não tiver dados associados

#### Para Alunos:
- ❌ **Não pode excluir** se tiver submissões realizadas
- ✅ **Pode excluir** se não tiver histórico de atividades
- 🔄 **Remove automaticamente** vínculos com professores

#### Restrições Gerais:
- ❌ Administradores não podem ser excluídos
- ❌ Não pode excluir a si mesmo
- ✅ Confirmação obrigatória antes da exclusão

## Arquivos Modificados

### Nova API Route
- `app/api/admin/users/[id]/route.ts` - Endpoint DELETE para exclusão

### Interface Atualizada
- `app/dashboard/admin/AdminUserManagement.tsx` - Botão e diálogo de exclusão

## Implementação Técnica

### Endpoint da API
```
DELETE /api/admin/users/[id]
```

### Processo de Validação
1. **Autenticação**: Verifica se é admin
2. **Autorização**: Confirma permissões
3. **Validação de dados**: Verifica dependências
4. **Limpeza**: Remove relacionamentos quando necessário
5. **Exclusão**: Remove o usuário do banco

### Validações Específicas

#### Professor:
```sql
-- Verifica exercícios
SELECT COUNT(*) FROM exercises WHERE teacherId = ?

-- Verifica alunos
SELECT COUNT(*) FROM teacher_students WHERE teacherId = ?
```

#### Aluno:
```sql
-- Verifica submissões
SELECT COUNT(*) FROM submissions WHERE studentId = ?

-- Remove vínculos (se não tiver submissões)
DELETE FROM teacher_students WHERE studentId = ?
```

## Interface do Usuário

### Botão de Exclusão
- **Aparência**: Ícone de lixeira em vermelho
- **Localização**: Coluna "Ações" ao lado do botão "Visualizar"
- **Visibilidade**: Apenas para professores e alunos

### Diálogo de Confirmação
- **Título**: "Confirmar Exclusão"
- **Conteúdo**: Nome do usuário e avisos específicos
- **Avisos contextuais**:
  - Professores: Alerta sobre exercícios/alunos
  - Alunos: Alerta sobre submissões
  - Geral: "Esta ação não pode ser desfeita"

### Feedback ao Usuário
- **Sucesso**: Toast verde "Usuário excluído com sucesso!"
- **Erro**: Toast vermelho com mensagem específica
- **Loading**: Spinner no botão durante processamento

## Como Usar

1. **Acessar Dashboard Admin**: Login como administrador
2. **Localizar Usuário**: Na tabela de usuários cadastrados
3. **Clicar em Excluir**: Ícone de lixeira na coluna "Ações"
4. **Confirmar**: Ler avisos e confirmar exclusão
5. **Aguardar**: Processamento e feedback

## Mensagens de Erro

### Validação de Dados:
- `"Cannot delete admin users"` - Tentativa de excluir admin
- `"Cannot delete yourself"` - Tentativa de auto-exclusão
- `"Cannot delete teacher with existing exercises or students"` - Professor com dados
- `"Cannot delete student with existing submissions"` - Aluno com histórico

### Erros Técnicos:
- `"User not found"` - Usuário não existe
- `"Unauthorized"` - Não logado
- `"Forbidden"` - Não é admin
- `"Internal server error"` - Erro do sistema

## Casos de Uso

### ✅ Exclusões Permitidas:
- Professor recém-criado sem exercícios ou alunos
- Aluno recém-criado sem submissões
- Usuários inativos sem dados associados

### ❌ Exclusões Bloqueadas:
- Professor com exercícios publicados
- Professor com alunos vinculados
- Aluno com histórico de submissões
- Qualquer administrador
- Auto-exclusão

## Segurança

### Controle de Acesso:
- Apenas administradores podem excluir
- Verificação de sessão ativa
- Validação de permissões

### Proteção de Dados:
- Impede perda de exercícios
- Preserva histórico de submissões
- Mantém integridade referencial

### Auditoria:
- Logs de tentativas de exclusão
- Rastreamento de ações administrativas

## Limitações

- Não permite exclusão em lote
- Não oferece arquivamento como alternativa
- Não mantém histórico de usuários excluídos
- Não permite recuperação após exclusão

## Possíveis Melhorias Futuras

- **Arquivamento**: Desativar ao invés de excluir
- **Transferência**: Mover exercícios para outro professor
- **Backup**: Exportar dados antes da exclusão
- **Exclusão em lote**: Selecionar múltiplos usuários
- **Histórico**: Log de usuários excluídos
- **Recuperação**: Possibilidade de restaurar usuários
