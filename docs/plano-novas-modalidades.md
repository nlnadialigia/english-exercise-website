# Plano de Ação: Implementação de Cruzadinha e Caça-Palavras

## 📋 Visão Geral
Implementar duas novas modalidades de exercícios no dashboard do professor:
- **Cruzadinha (Crossword)**: Exercício interativo de palavras cruzadas
- **Caça-Palavras (Word Search)**: Exercício de busca de palavras em grade

## 🎯 Funcionalidades Principais

### Entrada de Dados
- **Frases/Textos**: Palavras-chave marcadas com `*palavra*`
- **Palavras Isoladas**: Para caça-palavras especificamente
- **Dicas/Pistas**: Para cruzadinhas (opcional)

### Interface do Professor
- Botões separados no dashboard para cada modalidade
- Formulários específicos para criação
- Preview dos exercícios gerados
- Configurações de dificuldade

### Interface do Aluno
- Grids interativos para resolução
- Sistema de validação em tempo real
- Feedback visual de acertos/erros

## 🗂️ Estrutura de Implementação

### 1. Backend (Database & API)

#### 1.1 Schema do Banco de Dados
```sql
-- Adicionar novos tipos de exercício
ALTER TYPE "ExerciseType" ADD VALUE 'CROSSWORD';
ALTER TYPE "ExerciseType" ADD VALUE 'WORD_SEARCH';

-- Tabela para dados específicos de cruzadinha
CREATE TABLE CrosswordData (
  id SERIAL PRIMARY KEY,
  exerciseId INT REFERENCES exercises(id),
  gridSize INT DEFAULT 15,
  words JSONB, -- [{word, clue, startRow, startCol, direction}]
  grid JSONB   -- Grid final gerado
);

-- Tabela para dados específicos de caça-palavras
CREATE TABLE WordSearchData (
  id SERIAL PRIMARY KEY,
  exerciseId INT REFERENCES exercises(id),
  gridSize INT DEFAULT 15,
  words JSONB, -- [word1, word2, ...]
  grid JSONB,  -- Grid com palavras posicionadas
  wordPositions JSONB -- Posições das palavras para validação
);
```

#### 1.2 APIs Necessárias
- `POST /api/exercises/crossword` - Criar cruzadinha
- `POST /api/exercises/word-search` - Criar caça-palavras
- `GET /api/exercises/[id]/crossword-data` - Dados da cruzadinha
- `GET /api/exercises/[id]/word-search-data` - Dados do caça-palavras
- `POST /api/submissions/crossword` - Submeter cruzadinha
- `POST /api/submissions/word-search` - Submeter caça-palavras

### 2. Frontend (Components & Pages)

#### 2.1 Dashboard do Professor
```
components/teacher/
├── CrosswordCreator.tsx     # Formulário de criação
├── WordSearchCreator.tsx    # Formulário de criação
├── CrosswordPreview.tsx     # Preview da cruzadinha
├── WordSearchPreview.tsx    # Preview do caça-palavras
└── ExerciseTypeButtons.tsx  # Botões das modalidades
```

#### 2.2 Interface do Aluno
```
components/student/
├── CrosswordPlayer.tsx      # Interface de resolução
├── WordSearchPlayer.tsx     # Interface de resolução
├── CrosswordGrid.tsx        # Grid interativo
└── WordSearchGrid.tsx       # Grid interativo
```

#### 2.3 Utilitários
```
lib/
├── crossword-generator.ts   # Algoritmo de geração
├── word-search-generator.ts # Algoritmo de geração
├── text-parser.ts          # Parser de texto com *palavra*
└── grid-utils.ts           # Utilitários de grid
```

## ✅ Checklist de Implementação

### Fase 1: Preparação e Estrutura Base ✅ CONCLUÍDA
- [x] Atualizar schema do Prisma com novos tipos
- [x] Criar migrações do banco de dados
- [x] Implementar parser de texto para extrair palavras com `*`
- [x] Criar tipos TypeScript para as novas modalidades

### Fase 2: Algoritmos de Geração ✅ CONCLUÍDA
- [x] Implementar algoritmo de geração de cruzadinha
  - [x] Posicionamento automático de palavras
  - [x] Validação de intersecções
  - [x] Otimização de layout
- [x] Implementar algoritmo de geração de caça-palavras
  - [x] Posicionamento aleatório de palavras
  - [x] Preenchimento com letras aleatórias
  - [x] Múltiplas direções (horizontal, vertical, diagonal)

### Fase 3: Backend APIs ⚠️ PARCIALMENTE CONCLUÍDA
- [x] API de criação de cruzadinha (`/api/exercises/crossword`)
- [x] API de criação de caça-palavras (`/api/exercises/word-search`)
- [x] APIs de recuperação de dados
- [ ] APIs de submissão e validação
- [ ] Testes unitários das APIs

### Fase 4: Interface do Professor ✅ CONCLUÍDA
- [x] Adicionar botões no dashboard principal (`ExerciseTypeButtons`)
- [x] Criar formulário de cruzadinha (`/dashboard/teacher/exercises/crossword/new`)
  - [x] Input de frases/textos
  - [x] Configurações de grid
  - [ ] Preview em tempo real
- [x] Criar formulário de caça-palavras (`/dashboard/teacher/exercises/word-search/new`)
  - [x] Input de palavras/frases
  - [x] Configurações de dificuldade
  - [ ] Preview em tempo real
- [x] Integrar com sistema de exercícios existente

### Fase 5: Interface do Aluno 🚧 EM DESENVOLVIMENTO
- [ ] Componente de resolução de cruzadinha
  - [ ] Grid interativo
  - [ ] Sistema de pistas
  - [ ] Validação em tempo real
- [ ] Componente de resolução de caça-palavras
  - [ ] Grid de seleção
  - [ ] Lista de palavras
  - [ ] Feedback visual
- [ ] Integração com sistema de submissões

### Fase 6: Funcionalidades Avançadas ⏳ PENDENTE
- [ ] Sistema de pontuação específico
- [ ] Relatórios para as novas modalidades
- [ ] Exportação PDF dos exercícios
- [ ] Responsividade mobile
- [ ] Acessibilidade (ARIA labels, navegação por teclado)

### Fase 7: Testes e Refinamentos ⏳ PENDENTE
- [ ] Testes de componentes React
- [ ] Testes de integração
- [ ] Testes de performance dos algoritmos
- [ ] Validação de UX/UI
- [ ] Otimizações de performance

## 🎯 Status Atual da Implementação

### ✅ O que está funcionando:
1. **Dashboard do Professor**: Botões para criar cruzadinha e caça-palavras estão visíveis
2. **Rotas de Criação**: `/dashboard/teacher/exercises/crossword/new` e `/dashboard/teacher/exercises/word-search/new`
3. **APIs Backend**: Criação de exercícios funcionando
4. **Banco de Dados**: Schema atualizado com tabelas `CrosswordData` e `WordSearchData`
5. **Algoritmos**: Geradores de grid funcionando

### 🚧 Próximos Passos Críticos:
1. **Interface do Aluno**: Criar componentes de resolução
2. **APIs de Submissão**: Implementar validação de respostas
3. **Preview**: Adicionar preview em tempo real nos formulários
4. **Integração**: Conectar com sistema de submissões existente

### 🔍 Como Testar Atualmente:
1. Acesse o dashboard do professor
2. Clique no botão "Criar Exercício" 
3. Selecione "Cruzadinha" ou "Caça-Palavras"
4. Preencha o formulário e salve
5. O exercício será criado no banco, mas ainda não há interface de resolução para alunos

## 🔧 Considerações Técnicas

### Algoritmos de Geração
- **Cruzadinha**: Usar algoritmo de backtracking para posicionamento ótimo
- **Caça-Palavras**: Posicionamento aleatório com validação de sobreposição

### Performance
- Geração assíncrona para grids grandes
- Cache de grids gerados
- Lazy loading de componentes pesados

### Acessibilidade
- Navegação por teclado nos grids
- Screen reader support
- Alto contraste para palavras encontradas

### Responsividade
- Grids adaptativos para mobile
- Touch gestures para seleção
- Zoom para dispositivos pequenos

## 📱 Fluxo de Uso

### Professor
1. Acessa dashboard → Clica em "Criar Cruzadinha" ou "Criar Caça-Palavras"
2. Insere texto com palavras marcadas (`*palavra*`)
3. Configura parâmetros (tamanho do grid, dificuldade)
4. Visualiza preview do exercício gerado
5. Salva e publica para alunos

### Aluno
1. Acessa exercício → Vê grid interativo
2. **Cruzadinha**: Clica nas células, digita letras, usa pistas
3. **Caça-Palavras**: Seleciona palavras no grid, marca como encontradas
4. Submete resposta → Recebe feedback imediato

## 🎨 Design System
- Manter consistência com UI existente (Tailwind + Radix)
- Cores específicas para cada modalidade
- Animações suaves para feedback
- Estados visuais claros (correto/incorreto/pendente)

## 📊 Métricas de Sucesso
- Tempo médio de resolução
- Taxa de conclusão por modalidade
- Feedback dos usuários
- Performance dos algoritmos de geração
