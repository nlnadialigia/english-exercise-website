# English Exercise Platform

Uma plataforma completa para criação, gerenciamento e resolução de exercícios de inglês, desenvolvida com Next.js, Prisma e PostgreSQL.

## 🚀 Funcionalidades

### Para Professores
- **Gerenciamento de Exercícios**: Criar, editar, publicar e visualizar exercícios
- **Tipos de Questões**: Múltipla escolha, verdadeiro/falso, completar lacunas
- **Gerenciamento de Alunos**: Adicionar, editar e acompanhar progresso dos alunos
- **Relatórios Detalhados**: Visualizar submissões e desempenho dos alunos
- **Exportação PDF**: Gerar relatórios em PDF usando react-pdf
- **Envio de Email**: Enviar resultados por email usando MailerSend
- **Dashboard Completo**: Visão geral de exercícios, submissões e alunos

### Para Alunos
- **Resolução de Exercícios**: Interface intuitiva para responder exercícios
- **History de Tentativas**: Acompanhar todas as tentativas realizadas
- **Resultados Detalhados**: Ver correção completa com explicações
- **Progresso**: Visualizar exercícios em aberto e concluídos
- **Múltiplas Tentativas**: Possibilidade de refazer exercícios

### Para Administradores
- **Gerenciamento de Usuários**: Criar e gerenciar professores e alunos
- **Visão Geral**: Acesso a todos os dashboards em modo somente leitura
- **Controle Total**: Gerenciar toda a plataforma

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Autenticação**: Sistema próprio com bcryptjs
- **UI**: Tailwind CSS, Radix UI, Lucide Icons
- **Tabelas**: AG Grid
- **PDF**: @react-pdf/renderer
- **Email**: MailerSend
- **Formulários**: React Hook Form + Zod

## 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL 12+
- npm ou yarn

## 🚀 Como Rodar o Projeto

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd english-exercise-website
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o banco de dados

#### Opção A: PostgreSQL Local

1. **Instale o PostgreSQL**
   - **Ubuntu/Debian**: `sudo apt install postgresql postgresql-contrib`
   - **macOS**: `brew install postgresql`
   - **Windows**: Baixe do [site oficial](https://www.postgresql.org/download/)

2. **Inicie o serviço PostgreSQL**
   ```bash
   # Ubuntu/Debian
   sudo systemctl start postgresql
   
   # macOS
   brew services start postgresql
   ```

3. **Crie o banco de dados**
   ```bash
   # Acesse o PostgreSQL
   sudo -u postgres psql
   
   # Crie o banco
   CREATE DATABASE english_exercises;
   
   # Crie um usuário (opcional)
   CREATE USER english_user WITH PASSWORD 'password';
   GRANT ALL PRIVILEGES ON DATABASE english_exercises TO english_user;
   
   # Saia do PostgreSQL
   \q
   ```

#### Opção B: Docker (Recomendado)
```bash
# Criar e iniciar container PostgreSQL
docker run --name postgres-english \
  -e POSTGRES_DB=english_exercises \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15

# Verificar se está rodando
docker ps
```

#### Opção C: Serviços em Nuvem
- **Supabase**: Crie um projeto gratuito em [supabase.com](https://supabase.com)
- **Railway**: Crie um banco PostgreSQL em [railway.app](https://railway.app)
- **Neon**: Crie um banco serverless em [neon.tech](https://neon.tech)

### 4. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações.

### 5. Execute as migrações do banco
```bash
npm run migrate
```

### 6. (Opcional) Execute o seed para dados iniciais
```bash
npm run seed
```

### 7. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

Acesse http://localhost:3000

## 🗄️ Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run start` - Inicia servidor de produção
- `npm run migrate` - Executa migrações do Prisma
- `npm run generate` - Gera cliente Prisma
- `npm run studio` - Abre Prisma Studio
- `npm run seed` - Executa seed do banco de dados

## 🔧 Configuração do Banco de Dados

### Estrutura Principal

O banco possui as seguintes entidades principais:

- **Users**: Usuários (admin, teacher, student)
- **Exercises**: Exercícios criados pelos professores
- **Submissions**: Submissões/tentativas dos alunos
- **TeacherStudent**: Relacionamento professor-aluno

### Migrações

Para criar uma nova migração:
```bash
npx prisma migrate dev --name nome_da_migracao
```

Para aplicar migrações em produção:
```bash
npm run deploy
```
## 🔐 Autenticação

O sistema possui três tipos de usuários:

- **Admin**: Acesso total à plataforma
- **Teacher**: Pode criar exercícios e gerenciar alunos
- **Student**: Pode resolver exercícios

### Usuários Padrão (após seed)
- Admin: admin@admin.com / admin

## 📁 Estrutura do Projeto

```
├── app/                    # App Router do Next.js
│   ├── api/               # API Routes
│   ├── dashboard/         # Dashboards por role
│   └── login/             # Página de login
├── components/            # Componentes React
│   ├── ui/               # Componentes base (shadcn/ui)
│   ├── emails/           # Templates de email
│   ├── pdf/              # Templates de PDF
│   └── teacher/          # Componentes específicos do professor
├── lib/                   # Utilitários e configurações
├── prisma/               # Schema e migrações do banco
└── docs/                 # Documentação
```

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Configure um banco PostgreSQL (Supabase, Railway, etc.)
4. Deploy automático

### Docker
```bash
# Build da imagem
docker build -t english-exercise-platform .

# Executar
docker run -p 3000:3000 english-exercise-platform
```
## 📚 Documentação Adicional

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Documentação completa](docs/application-overview.md)
- [Sistema de logs](docs/logger-examples.md)
- [Link mágico](docs/magic-link-system.md)