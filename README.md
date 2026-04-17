# Strooke

E-commerce de gorras. Frontend en React + Vite, backend en Node.js + Express, base de datos MySQL con Sequelize.

---

## Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- [MySQL](https://dev.mysql.com/downloads/) 8.0 o superior
- npm

---

## Instalación (primera vez)

### 1. Clonar el repositorio

```powershell
git clone https://github.com/alejandroarana2005/Strooke.git
cd Strooke
```

### 2. Crear la base de datos

Abre MySQL y ejecuta:

```sql
CREATE DATABASE IF NOT EXISTS strooke_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Configurar variables de entorno

Edita `server/.env` y ajusta tu contraseña de MySQL:

```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_NAME=strooke_db
DB_USER=root
DB_PASSWORD=tu_contraseña_mysql
JWT_SECRET=strooke_secret_key_2024
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
EMAIL_USER=
EMAIL_PASS=
```

### 4. Instalar dependencias

```powershell
cd server
npm install
cd ..\client
npm install
```

### 5. Poblar la base de datos

```powershell
cd ..\server
npm run seed
```

---

## Iniciar la aplicación

Necesitas **dos terminales abiertas al mismo tiempo**.

**Terminal 1 — Servidor:**

```powershell
cd server
npm run dev
```

Corre en `http://localhost:3001`

**Terminal 2 — Cliente:**

```powershell
cd client
npm run dev
```

Corre en `http://localhost:5173` — abre esta URL en el navegador.

---

## Scripts disponibles

### Servidor (`server/`)

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor con nodemon (recarga automática) |
| `npm start` | Inicia el servidor sin recarga automática |
| `npm run seed` | Pobla la base de datos con datos iniciales |

### Cliente (`client/`)

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo con Vite |
| `npm run build` | Genera el build de producción |
| `npm run preview` | Previsualiza el build de producción |
