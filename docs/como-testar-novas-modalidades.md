# Como Testar as Novas Modalidades (Cruzadinha e Caça-Palavras)

## 🎯 Status Atual
As novas modalidades estão **parcialmente implementadas**. Você pode criar exercícios, mas ainda não há interface de resolução para alunos.

## 🔍 Como Testar no Dashboard do Professor

### 1. Acessar o Dashboard
1. Faça login como professor
2. Acesse `/dashboard/teacher`
3. Na aba "Exercises", procure pelo botão **"Criar Exercício"**

### 2. Criar uma Cruzadinha
1. Clique em **"Criar Exercício"** → **"Cruzadinha"**
2. Você será redirecionado para `/dashboard/teacher/exercises/crossword/new`
3. Preencha o formulário:
   - **Título**: Ex: "Vocabulário de Animais"
   - **Descrição**: Ex: "Cruzadinha com nomes de animais"
   - **Texto**: Use palavras marcadas com asterisco:
     ```
     Os *cat* e *dog* são animais domésticos.
     O *elephant* é um animal grande.
     O *bird* voa no céu.
     ```
   - **Dificuldade**: Easy/Medium/Hard
   - **Nível**: Ex: "Beginner"
   - **Tamanho do Grid**: 15 (padrão)

4. Clique em **"Gerar Preview"** para ver a cruzadinha
5. Clique em **"Salvar Exercício"** para criar

### 3. Criar um Caça-Palavras
1. Clique em **"Criar Exercício"** → **"Caça-Palavras"**
2. Você será redirecionado para `/dashboard/teacher/exercises/word-search/new`
3. Preencha o formulário:
   - **Título**: Ex: "Cores em Inglês"
   - **Descrição**: Ex: "Encontre as cores no caça-palavras"
   - **Tipo de Entrada**: 
     - **Texto Marcado**: `The *red* car and *blue* house are *beautiful*.`
     - **Lista de Palavras**: `red, blue, green, yellow, purple`
   - **Dificuldade**: Easy/Medium/Hard
   - **Nível**: Ex: "Elementary"
   - **Tamanho do Grid**: 15 (padrão)

4. Clique em **"Gerar Preview"** para ver o caça-palavras
5. Clique em **"Salvar Exercício"** para criar

## 📊 Verificar se Foi Criado

### No Dashboard
1. Volte para `/dashboard/teacher`
2. Na aba **"Exercises"**, você verá os novos exercícios listados
3. O tipo aparecerá como "crossword" ou "word_search"

### No Banco de Dados
Se você tiver acesso ao Prisma Studio:
```bash
npx prisma studio
```
1. Verifique a tabela `exercises` - novos registros com `type: 'crossword'` ou `type: 'word_search'`
2. Verifique as tabelas `CrosswordData` e `WordSearchData` - dados específicos dos exercícios

## ⚠️ Limitações Atuais

### ✅ O que funciona:
- ✅ Criação de exercícios pelo professor
- ✅ Algoritmos de geração de grid
- ✅ Salvamento no banco de dados
- ✅ Preview dos exercícios gerados
- ✅ Listagem no dashboard

### ❌ O que ainda não funciona:
- ❌ Interface de resolução para alunos
- ❌ Sistema de submissão de respostas
- ❌ Validação de respostas
- ❌ Relatórios específicos
- ❌ Visualização no dashboard do aluno

## 🚧 Próximos Passos para Completar

### 1. Interface do Aluno (Prioridade Alta)
- Criar componentes `CrosswordPlayer.tsx` e `WordSearchPlayer.tsx`
- Implementar grids interativos
- Sistema de seleção de palavras/células

### 2. APIs de Submissão
- `POST /api/submissions/crossword`
- `POST /api/submissions/word-search`
- Validação de respostas

### 3. Integração com Sistema Existente
- Adicionar suporte no `ExercisePreviewClient.tsx`
- Atualizar dashboard do aluno
- Sistema de pontuação

## 🐛 Possíveis Problemas

### Erro de Tipagem TypeScript
Se encontrar erro `'WordSearchWord[]' is not assignable to type 'JsonNull | InputJsonValue'`:
- **Solução**: Já foi corrigida no arquivo `app/api/exercises/word-search/route.ts`

### Componentes Não Encontrados
Se aparecer erro de componente não encontrado:
- Verifique se os arquivos `CrosswordCreator.tsx` e `WordSearchCreator.tsx` existem em `components/teacher/`

### Rotas 404
Se as rotas `/dashboard/teacher/exercises/crossword/new` ou `/dashboard/teacher/exercises/word-search/new` retornarem 404:
- Verifique se os arquivos `page.tsx` existem nos diretórios corretos

## 📝 Exemplo de Teste Completo

1. **Login como professor**
2. **Criar cruzadinha** com texto: `The *sun* is bright. *Water* is essential. *Trees* are green.`
3. **Gerar preview** e verificar se as palavras foram posicionadas corretamente
4. **Salvar exercício**
5. **Verificar na lista** se aparece com tipo "crossword"
6. **Repetir para caça-palavras** com lista: `sun, water, trees, sky, earth`

## 🎯 Resultado Esperado
Após seguir estes passos, você deve ter exercícios de cruzadinha e caça-palavras criados e visíveis no dashboard do professor, prontos para a próxima fase de implementação (interface do aluno).
