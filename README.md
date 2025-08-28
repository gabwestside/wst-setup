# 🟣 Habits Tracker

Aplicação fullstack para acompanhar hábitos diários, inspirada no layout estilo **GitHub Contributions Graph**.  
Permite criar hábitos, marcar como concluídos e acompanhar o progresso por dia.

---

## 📸 Screenshots
<img width="518" height="926" alt="image" src="https://github.com/user-attachments/assets/3eda0895-8da2-4661-8bc2-122240b52f88" />

---

## 🚀 Tecnologias

- **Frontend**
  - [React](https://reactjs.org/)
  - [Vite](https://vitejs.dev/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [TailwindCSS](https://tailwindcss.com/)
  - [Radix UI](https://www.radix-ui.com/)

- **Backend**
  - [Node.js](https://nodejs.org/)
  - [Fastify](https://fastify.dev/) *(ou Express, dependendo do que você usou)*
  - [Prisma](https://www.prisma.io/) + SQLite/Postgres
  - [Day.js](https://day.js.org/) para manipulação de datas

- **Infra**
  - Frontend hospedado no **Vercel**
  - Backend hospedado no **Render**

---

## 📦 Como rodar localmente

### 1. Clone o projeto
```bash
git clone https://github.com/gabwestside/wst-setup
cd wst-setup
````

### 2. Configuração do backend

```bash
cd server
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

Por padrão o backend roda em `http://localhost:3333`.

### 3. Configuração do frontend

```bash
cd web
cp .env.example .env
npm install
npm run dev
```

Por padrão o frontend roda em `http://localhost:5173`.

---

## 🔑 Variáveis de ambiente

### Backend (`server/.env`)

```env
DATABASE_URL="file:./dev.db" # ou postgres
FRONTEND_URLS=http://localhost:5173,https://wstside-habits.vercel.app
FRONTEND_SUFFIXES=.vercel.app
```

### Frontend (`web/.env`)

```env
VITE_API_URL=http://localhost:3333
```

No deploy (Vercel), use:

```env
VITE_API_URL=https://wst-setup.onrender.com
```

---

## 🌍 Deploy

* Frontend: [https://wstside-habits.vercel.app](https://wstside-habits.vercel.app)
* Backend: [https://wst-setup.onrender.com](https://wst-setup.onrender.com)

---

## 📌 Próximas melhorias

* ✅ Criar/editar hábitos
* ✅ Visualizar progresso em layout estilo GitHub contributions
* 🚧 Marcar hábitos em dias passados (com confirmação)
* 🚧 Dashboard com estatísticas semanais/mensais
* 🚧 Login e autenticação por usuário
* 🚧 Deploy com banco de dados Postgres para produção

---

## 📝 Licença

Esse projeto está sob a licença MIT.
Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
