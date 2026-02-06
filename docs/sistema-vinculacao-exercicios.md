# Sistema de Vinculação de Exercícios por Aluno

## 🎯 Problema Identificado
Professores relataram que disponibilizar todos os exercícios simultaneamente para todos os alunos não é adequado pedagogicamente. É necessário controle granular sobre quais exercícios cada aluno pode acessar.

## 💡 Solução Proposta
Implementar sistema de vinculação de exercícios por aluno na aba "Alunos" do dashboard do professor, permitindo controle individual de acesso aos exercícios.

---

## 🗄️ Mudanças no Banco de Dados

### Nova Tabela: StudentExerciseAccess
```prisma
model StudentExerciseAccess {
  id          Int      @id @default(autoincrement())
  studentId   Int
  exerciseId  Int
  assignedAt  DateTime @default(now())
  assignedBy  Int      // teacherId
  dueDate     DateTime?
  isActive    Boolean  @default(true)
  
  student     User     @relation("StudentAccess", fields: [studentId], references: [id])
  exercise    Exercise @relation(fields: [exerciseId], references: [id])
  assignedByTeacher User @relation("TeacherAssignments", fields: [assignedBy], references: [id])
  
  @@unique([studentId, exerciseId])
  @@map("student_exercise_access")
}
```

### Atualizar Models Existentes
```prisma
model User {
  // ... campos existentes
  studentExercises     StudentExerciseAccess[] @relation("StudentAccess")
  assignedExercises    StudentExerciseAccess[] @relation("TeacherAssignments")
}

model Exercise {
  // ... campos existentes
  studentAccess        StudentExerciseAccess[]
}
```

---

## 🔧 Implementação Backend

### 1. API para Gerenciar Vinculações
```typescript
// app/api/teacher/students/[studentId]/exercises/route.ts

// GET - Listar exercícios do aluno (vinculados e disponíveis)
// POST - Vincular exercício ao aluno
// DELETE - Remover vinculação
```

### 2. API para Operações em Lote
```typescript
// app/api/teacher/students/bulk-assign/route.ts

// POST - Vincular exercício a múltiplos alunos
// POST - Vincular múltiplos exercícios a um aluno
```

### 3. Atualizar Lógica de Acesso do Aluno
```typescript
// Modificar queries existentes para considerar StudentExerciseAccess
// Aluno só vê exercícios que foram explicitamente vinculados a ele
```

---

## 🎨 Interface do Professor

### Aba Alunos - Nova Funcionalidade
```
components/teacher/students/
├── StudentExerciseManager.tsx    # Componente principal
├── ExerciseAssignmentModal.tsx   # Modal para vincular exercícios
├── StudentExerciseList.tsx       # Lista de exercícios do aluno
└── BulkAssignmentModal.tsx       # Atribuição em lote
```

### Funcionalidades da Interface
1. **Lista de Alunos** (existente) + **Botão "Gerenciar Exercícios"**
2. **Modal de Gerenciamento** por aluno:
   - Lista de exercícios vinculados
   - Lista de exercícios disponíveis para vincular
   - Botões de ação (vincular/desvincular)
   - Data de vencimento (opcional)
3. **Operações em Lote**:
   - Vincular um exercício a múltiplos alunos
   - Vincular múltiplos exercícios a um aluno

---

## 📱 Fluxo de Uso

### Professor
1. Acessa **Dashboard → Alunos**
2. Clica em **"Gerenciar Exercícios"** ao lado do nome do aluno
3. Vê exercícios já vinculados ao aluno
4. Pode adicionar novos exercícios da lista disponível
5. Pode remover exercícios já vinculados
6. Pode definir data de vencimento (opcional)
7. Salva alterações

### Aluno
1. Acessa dashboard
2. Vê apenas exercícios que foram vinculados a ele pelo professor
3. Não tem acesso a exercícios não vinculados

---

## ✅ Checklist de Implementação

### Fase 1: Backend (1-2 dias)
- [ ] Criar migração para tabela `StudentExerciseAccess`
- [ ] Atualizar schema Prisma
- [ ] Criar APIs de gerenciamento de vinculações
- [ ] Atualizar lógica de acesso do aluno
- [ ] Testes das APIs

### Fase 2: Interface (2-3 dias)
- [ ] Criar componente `StudentExerciseManager`
- [ ] Criar modal de atribuição de exercícios
- [ ] Integrar com aba de alunos existente
- [ ] Implementar operações em lote
- [ ] Testes de interface

### Fase 3: Migração e Deploy (1 dia)
- [ ] Migração de dados existentes (se necessário)
- [ ] Testes de integração
- [ ] Deploy e validação

---

## 🔄 Estratégia de Migração

### Opção 1: Todos os Exercícios Vinculados (Padrão Atual)
```sql
-- Vincular todos os exercícios existentes a todos os alunos
-- Mantém comportamento atual durante transição
INSERT INTO student_exercise_access (studentId, exerciseId, assignedBy)
SELECT s.id, e.id, e.teacherId 
FROM users s, exercises e 
WHERE s.role = 'STUDENT' AND e.isPublished = true;
```

### Opção 2: Começar do Zero
```sql
-- Não vincular nada automaticamente
-- Professores precisam vincular manualmente
-- Mais limpo, mas requer trabalho inicial
```

---

## 🎯 Benefícios da Implementação

### Para Professores
- **Controle Pedagógico**: Liberar exercícios gradualmente
- **Personalização**: Exercícios específicos por aluno
- **Organização**: Melhor gestão do cronograma de atividades
- **Flexibilidade**: Diferentes ritmos de aprendizado

### Para Alunos
- **Foco**: Apenas exercícios relevantes no momento
- **Menos Sobrecarga**: Interface mais limpa
- **Progressão Clara**: Exercícios liberados conforme avanço

### Para o Sistema
- **Escalabilidade**: Melhor performance com menos dados
- **Segurança**: Controle de acesso mais granular
- **Auditoria**: Rastreamento de atribuições

---

## 🚀 Funcionalidades Futuras (Opcional)

### Automação
- **Regras de Liberação**: Exercícios liberados automaticamente após conclusão de pré-requisitos
- **Cronograma**: Liberação automática por data
- **Grupos**: Atribuição por turmas/grupos

### Analytics
- **Relatórios de Atribuição**: Quais exercícios foram mais atribuídos
- **Progresso por Aluno**: Visualização do avanço individual
- **Métricas de Engajamento**: Tempo entre atribuição e conclusão

---

## ⚠️ Considerações Importantes

### Compatibilidade
- Manter funcionamento atual durante transição
- Não quebrar submissões existentes
- Preservar histórico de tentativas

### Performance
- Indexar adequadamente a nova tabela
- Otimizar queries de acesso do aluno
- Cache de exercícios vinculados

### UX/UI
- Interface intuitiva para professores
- Feedback claro sobre vinculações
- Operações em lote para eficiência

---

## 🎯 Próximos Passos

1. **Validar abordagem** com stakeholders
2. **Implementar Fase 1** (backend)
3. **Testar com dados reais**
4. **Implementar interface**
5. **Planejar migração** dos dados existentes
6. **Deploy gradual** com rollback preparado
