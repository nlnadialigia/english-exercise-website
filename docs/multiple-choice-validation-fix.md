# Correção do Erro de Validação de Múltipla Escolha

## Problema Identificado

O erro "Multiple choice exercises need at least 2 options" está ocorrendo devido a dois problemas no componente `MultipleChoiceEditor`:

1. **Inicialização com apenas 1 opção**: O editor está inicializando com apenas 1 opção quando `content.options` não existe
2. **Campo `explanation` ausente**: O schema Zod espera o campo `explanation`, mas ele não está sendo incluído no `setContent`

## Localização do Problema

**Arquivo**: `components/exercises/editors/MultipleChoiceEditor.tsx`

**Linha problemática**:
```typescript
const [options, setOptions] = useState(content.options || [{ id: crypto.randomUUID(), text: "", correct: false }]);
```

**useEffect problemático**:
```typescript
useEffect(() => {
  setContent({
    options,
    allowMultiple: false,
  });
}, [options]);
```

## Solução

### 1. Inicializar com 2 opções mínimas
### 2. Incluir o campo `explanation` no setContent
### 3. Garantir que sempre tenha pelo menos 2 opções válidas

## Validação do Schema

O schema `MultipleChoiceSchema` em `lib/exercise-schema.ts` exige:
- `options`: array com mínimo de 2 itens
- `allowMultiple`: boolean
- `explanation`: string

## Impacto da Correção

- Resolve o erro de validação na criação de exercícios
- Garante compatibilidade com o schema Zod
- Melhora a experiência do usuário ao criar exercícios de múltipla escolha
