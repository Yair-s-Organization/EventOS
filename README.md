# Documentación del proyecto EventOS

## Contenido

- [Arquitectura del Proyecto: Monorepo](#arquitectura-del-proyecto-monorepo)
  - [Tecnologías a usar](#tecnologías-a-usar)
  - [Cómo se manejarán las ramas en Github](#como-se-manejarán-las-ramas-en-github)
- [Guía de Instalación](#guía-de-instalación)
- [Configuración del monorepo](#configuración-del-monorepo)
- [Guía de ejecución del proyecto](#guía-de-ejecución-del-proyecto)

---

# Arquitectura del Proyecto: Monorepo

Un Monorepo es un único repositorio en GitHub que aloja múltiples proyectos distintos (en este caso, el código del frontend y del backend juntos). Existe para resolver el problema de mantener sincronizados varios repositorios; permite compartir configuraciones, dependencias y código (como interfaces de TypeScript) entre el cliente y el servidor de forma directa.

Github: <https://github.com/Yair-s-Organization/EventOS>

## Tecnologías a usar

- **Backend:** TypeScript con NestJs
- **Frontend:** HTML, CSS, React
  - Vite es el bundler y servidor de desarrollo oficial del frontend. React por sí solo no incluye herramientas para compilar JSX/TypeScript ni para servir la aplicación mientras se desarrolla; Vite cubre ambas cosas: levanta un servidor de desarrollo con recarga instantánea (HMR) y, con `vite build`, genera el paquete optimizado para producción.
- **Editor de código:** Es libre, pero se recomienda Visual Studio Code
- **Gestor de paquetes/Entorno:** Bun
  - Bun es un entorno de ejecución y gestor de paquetes para JavaScript/TypeScript. Reemplaza a herramientas tradicionales como Node.js y npm. Existe porque los tiempos de instalación y ejecución en Node pueden ser lentos en proyectos grandes; Bun está diseñado desde cero para ser extremadamente rápido, optimizando el tiempo de desarrollo.
  - El proyecto se desarrolla en un entorno 100% Bun: no se instala Node.js, FNM ni npm. Todos los comandos del proyecto usan `bun` o `bunx`.
- **Orquestación del monorepo:** Bun Workspaces
  - Bun Workspaces vincula los proyectos del repositorio: declara qué carpetas son paquetes, instala todas las dependencias en una sola operación (`bun install` en la raíz, con un único `bun.lock`) y permite que un paquete dependa de otro del mismo repositorio mediante el protocolo `workspace:*`. También permite ejecutar un mismo script en varios paquetes a la vez con `bun run --filter`.
- **ORM (Base de datos):** TypeORM y PostgreSQL
  - TypeORM es un Mapeador Objeto-Relacional. Existe para evitar que los desarrolladores tengan que escribir consultas de bases de datos en SQL puro. Permite interactuar con la base de datos manipulando clases y objetos directamente en TypeScript, lo que reduce errores de sintaxis, facilita la migración de datos y agiliza el desarrollo del backend.
  - PostgreSQL soporta tipos de datos complejos de forma nativa, como JSONB, UUIDs y arreglos (arrays). TypeORM aprovecha esto perfectamente, permitiéndote mapear estos tipos de datos directamente a interfaces de TypeScript sin hacer conversiones manuales.

## Como se manejarán las ramas en Github

**main (Rama Principal / Producción)**

- Contiene la versión final, estable y funcional del sistema. Es el código listo para desplegarse.
- **Nadie puede programar ni hacer commits directamente en esta rama.** El código llega a esta rama a través de fusiones (merges) de versiones previamente revisadas y aprobadas.

**develop (Rama de Integración y Pruebas)**

- Es la rama central de desarrollo. Es aquí donde se junta el trabajo individual de todos los integrantes para probar que todo funcione en conjunto.
- No se programa directamente aquí. Sirve como punto de integración de código.

**feature/ (Ramas de Desarrollo de Funcionalidades)**

- Es aquí donde se programa. Cada vez que un integrante tome una nueva tarea debe crear una rama exclusiva para este trabajo.
- Se deben crear a partir de la rama **develop** más actualizada.
- **Nomenclatura:** se nombran usando el prefijo **feature/** seguido de una descripción corta (usando guiones para los espacios). Ejemplos:
  - feature/pantalla-login
  - feature/formulario-solicitar-evento
  - feature/validación-7-dias-anticipacion
- Al terminar la tarea se sube la rama a GitHub y se solicita integrarla a **develop** mediante un **Pull Request**.

**bugfix/ (Ramas de Corrección de Errores)**

- Si durante las pruebas en **develop** se detecta un fallo se crea esta rama exclusivamente para solucionar ese problema, sin mezclarlo con código nuevo.
- Se crean a partir de **develop**
- **Nomenclatura:** Se nombran usando el prefijo **bugfix/** seguido del problema (usando guiones para los espacios).

---

# Guía de Instalación

Instalaciones necesarias:

- Git
- PostgreSQL 18.x (La última versión disponible)
- Bun v1.x (Latest Stable)
- NestJS CLI (se instala como dependencia del backend, no de forma global; ver sección NestJS)

> **Entorno 100% Bun.** No se instala Node.js, FNM ni npm. Bun ejecuta, instala y compila todo el proyecto. Para no depender de un Node externo, los scripts de herramientas con ejecutable Node (Vite, CLI de TypeORM, CLI de Nest) se invocan con `bun --bun` o `bunx --bun`, que obliga a usar el runtime de Bun.

## Git

Windows (PowerShell):

```powershell
winget install Git.Git
```

Linux (Debian/Ubuntu; en otras distros usar su gestor de paquetes):

```bash
sudo apt install git
```

Confirmar con `git --version`.

## PostgreSQL

Windows: <https://www.youtube.com/watch?v=KBtrtOAVLYQ>

Linux: Depende de la distro, se recomienda investigar para distro en especifica

## Bun

1. Windows en PowerShell

   ```powershell
   powershell -c "irm bun.sh/install.ps1 | iex"
   ```

   Cerrar y volver a abrir la terminal. Confirmar con:

   ```powershell
   bun --version
   ```

2. Linux:

   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

   Aplicar los cambios para tu terminal en específico (por ejemplo `source ~/.bashrc` en bash o `source ~/.zshrc` en zsh) y confirmar con `bun --version`. Debe mostrar una versión 1.x.

## NestJS

El CLI de Nest no se instala de forma global: queda como dependencia de desarrollo del backend (se agrega en la sección de configuración del backend) para que todo el equipo use la misma versión. Como su ejecutable es de Node, se invoca siempre con `bun --bun run nest`. Ejemplo, desde `apps/backend`:

```bash
bun --bun run nest --version
bun --bun run nest g resource eventos
```

---

# Configuración del monorepo

Esta sección documenta cómo está armado el repositorio: cómo se vinculan los paquetes con Bun Workspaces, cómo se ejecutan las tareas de todos los paquetes con los scripts de Bun y cómo se configuran el backend (NestJS + TypeORM) y el frontend (React + Vite). Quien clone un repositorio que ya tiene esta configuración solo necesita seguir la Guía de ejecución del proyecto.

## Estructura de carpetas

```text
EventOS/
├── package.json            # raíz: workspaces + scripts globales
├── bun.lock                # lockfile único (se versiona)
├── .gitignore
├── apps/
│   ├── backend/            # NestJS + TypeORM
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── .env.example
│   │   └── src/
│   │       ├── main.ts
│   │       ├── app.module.ts
│   │       ├── data-source.ts
│   │       └── migrations/
│   └── frontend/           # React + Vite
│       ├── package.json
│       ├── vite.config.ts
│       ├── tsconfig.json
│       ├── index.html
│       └── src/
│           ├── main.tsx
│           └── App.tsx
└── packages/
    └── shared/             # tipos/interfaces TypeScript compartidos
        ├── package.json
        └── src/index.ts
```

- `apps/` contiene las aplicaciones ejecutables (backend y frontend).
- `packages/` contiene código compartido que no se ejecuta solo (por ejemplo, las interfaces TypeScript que usan ambos lados).

## Bun Workspaces: package.json raíz

El `package.json` de la raíz es lo que convierte el repositorio en un monorepo. El campo `workspaces` le indica a Bun qué carpetas son paquetes:

**`package.json`**

```json
{
  "name": "eventos",
  "private": true,
  "packageManager": "bun@1.4.3",
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "bun run --filter '*' dev",
    "dev:backend": "bun run --filter @eventos/backend dev",
    "dev:frontend": "bun run --filter @eventos/frontend dev",
    "build": "bun run --filter '*' build",
    "db:migrate": "bun run --filter @eventos/backend migration:run",
    "db:revert": "bun run --filter @eventos/backend migration:revert"
  }
}
```

Después de crearlo, agregar TypeScript (esto escribe su versión en `devDependencies`):

```bash
bun add -d typescript
```

- `private: true` evita publicar la raíz por accidente.
- `packageManager` fija la versión de Bun que usa el proyecto. Ajustarlo a la versión instalada (`bun --version`).
- `workspaces` hace que un único `bun install` en la raíz instale las dependencias de todos los paquetes y genere un solo `bun.lock`. Nunca ejecutar `bun install` dentro de `apps/*`, ni usar npm.
- Los scripts de la raíz son el punto de entrada del equipo: `bun run dev`, `bun run build`, `bun run db:migrate`.
- `bun run --filter '*' dev` ejecuta en paralelo el script `dev` de todos los paquetes que lo definan; por eso backend y frontend exponen `dev` y `build` en su propio `package.json`. `--filter @eventos/backend` limita la ejecución a un solo paquete.

## Paquete compartido: packages/shared

Contiene las interfaces TypeScript que comparten backend y frontend. Al apuntar `main` y `types` directamente al código fuente `.ts`, no necesita paso de compilación: Bun y Vite lo leen tal cual.

**`packages/shared/package.json`**

```json
{
  "name": "@eventos/shared",
  "version": "0.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts"
}
```

**`packages/shared/src/index.ts`**

```ts
export interface Evento {
  id: string;
  nombre: string;
}
```

Para usarlo, cada app lo declara como dependencia con el protocolo `workspace:*` (Bun lo enlaza localmente, no lo descarga) y lo importa por nombre:

```ts
import type { Evento } from '@eventos/shared';
```

## Backend: apps/backend (NestJS + TypeORM + PostgreSQL)

**`apps/backend/package.json`**

```json
{
  "name": "@eventos/backend",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "bun --watch src/main.ts",
    "build": "bun build src/main.ts --target=bun --outdir=dist --packages=external",
    "start": "bun dist/main.js",
    "migration:generate": "bun --bun run typeorm migration:generate -d src/data-source.ts",
    "migration:run": "bun --bun run typeorm migration:run -d src/data-source.ts",
    "migration:revert": "bun --bun run typeorm migration:revert -d src/data-source.ts"
  },
  "dependencies": {
    "@eventos/shared": "workspace:*"
  }
}
```

Instalar las dependencias desde `apps/backend` (esto escribe sus versiones en el `package.json`):

```bash
cd apps/backend
bun add @nestjs/common @nestjs/core @nestjs/platform-express @nestjs/typeorm typeorm pg reflect-metadata rxjs
bun add -d @nestjs/cli @types/bun
```

- `dev` usa `bun --watch`: Bun ejecuta TypeScript directamente y reinicia el proceso al detectar cambios. No se necesita `ts-node` ni `nest start`.
- `build` genera `dist/main.js` con `bun build`. La bandera `--packages=external` es obligatoria: sin ella Bun intenta empaquetar las dependencias opcionales de Nest (como `class-transformer`) y la compilación falla.
- Los scripts `migration:*` ejecutan el CLI de TypeORM con el runtime de Bun (`bun --bun`) apuntando al `DataSource` del proyecto.

**`apps/backend/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strictPropertyInitialization": false,
    "skipLibCheck": true,
    "types": ["bun"]
  },
  "include": ["src"]
}
```

`experimentalDecorators` y `emitDecoratorMetadata` son obligatorios: NestJS (inyección de dependencias) y TypeORM (tipos de columnas) dependen de los decoradores y su metadata. Bun respeta ambas opciones del `tsconfig.json`.

**`apps/backend/.env.example`**

```ini
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_NAME=eventos
```

Este archivo se versiona como plantilla; el `.env` real con la contraseña de cada persona **no** se sube a GitHub (está en `.gitignore`). Bun carga el `.env` automáticamente desde la carpeta donde corre el script, por lo que no se necesita `dotenv`.

**`apps/backend/src/data-source.ts`**

```ts
import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';

export const dbOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ?? 'eventos',
};

// Usado solo por el CLI de TypeORM (migraciones)
export default new DataSource({
  ...dbOptions,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
});
```

**`apps/backend/src/app.module.ts`**

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbOptions } from './data-source';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...dbOptions,
      autoLoadEntities: true,
      synchronize: false, // el esquema se gestiona solo con migraciones
    }),
  ],
})
export class AppModule {}
```

**`apps/backend/src/main.ts`**

```ts
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

- `synchronize: false`: el esquema de la base de datos se modifica únicamente con migraciones, nunca de forma automática.
- `data-source.ts` es la única fuente de la conexión: lo usan tanto la aplicación (`app.module.ts`) como el CLI de migraciones. Las entidades se escriben como `*.entity.ts` y se registran con `TypeOrmModule.forFeature([...])`.
- El prefijo global `/api` permite que el frontend use un proxy de Vite hacia el backend.

## Frontend: apps/frontend (React + Vite)

**`apps/frontend/package.json`**

```json
{
  "name": "@eventos/frontend",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "bun --bun vite",
    "build": "bun --bun vite build",
    "preview": "bun --bun vite preview"
  },
  "dependencies": {
    "@eventos/shared": "workspace:*"
  }
}
```

Instalar las dependencias desde `apps/frontend`:

```bash
cd apps/frontend
bun add react react-dom
bun add -d vite @vitejs/plugin-react @types/react @types/react-dom
```

- Los scripts usan `bun --bun vite` para que Vite corra sobre el runtime de Bun y no requiera Node.js.

**`apps/frontend/vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000', // evita CORS en desarrollo
    },
  },
});
```

- `@vitejs/plugin-react` habilita JSX y Fast Refresh de React.
- El `proxy` redirige las peticiones del navegador a `/api/...` hacia el backend en el puerto 3000, evitando configurar CORS durante el desarrollo.

**`apps/frontend/index.html`**

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>EventOS</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**`apps/frontend/src/main.tsx`**

```tsx
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(<App />);
```

**`apps/frontend/src/App.tsx`**

```tsx
import type { Evento } from '@eventos/shared';

export default function App() {
  const ejemplo: Evento = { id: '1', nombre: 'EventOS' };
  return <h1>{ejemplo.nombre}</h1>;
}
```

**`apps/frontend/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["src", "vite.config.ts"]
}
```

## Archivos de control de versiones

**`.gitignore` (raíz)**

```gitignore
node_modules/
dist/
.env
```

Se debe versionar `bun.lock` (garantiza que todo el equipo instale exactamente las mismas versiones) y `.env.example`; nunca `.env`.

---

# Guía de ejecución del proyecto

Todos los comandos se ejecutan desde la **raíz del repositorio** salvo que se indique lo contrario. Requisitos previos: Git, PostgreSQL y Bun instalados (ver Guía de Instalación).

## 1. Clonar el repositorio e instalar dependencias

```bash
git clone https://github.com/Yair-s-Organization/EventOS.git
cd EventOS
git switch develop
git switch -c feature/nombre-de-tu-tarea
bun install
```

`bun install` instala las dependencias de los tres paquetes (backend, frontend y shared) y enlaza el paquete compartido. La rama `feature/` se crea a partir de `develop`, según la estrategia de ramas. Repetir `bun install` cada vez que se haga `git pull` y cambie algún `package.json` o `bun.lock`.

## 2. Levantar la base de datos (PostgreSQL)

PostgreSQL se ejecuta como servicio del sistema. Primero asegurarse de que esté activo y después crear la base de datos del proyecto, una sola vez.

**Windows** (PowerShell como administrador):

```powershell
Get-Service postgresql*
Start-Service postgresql-x64-18
psql -U postgres -c "CREATE DATABASE eventos;"
```

Si `psql` no se reconoce, agregar `C:\Program Files\PostgreSQL\18\bin` al PATH o usar la aplicación "SQL Shell (psql)" del menú Inicio. El comando pide la contraseña que se definió al instalar PostgreSQL.

**Linux:**

```bash
sudo systemctl start postgresql
sudo -u postgres psql -c "CREATE DATABASE eventos;"
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'tu_contraseña';"
```

El tercer comando asigna una contraseña al usuario `postgres`, necesaria porque el backend se conecta por TCP con usuario y contraseña. Para comprobar la conexión:

```bash
psql -U postgres -h localhost -d eventos -c "SELECT 1;"
```

## 3. Configurar las variables de entorno

Windows (PowerShell):

```powershell
Copy-Item apps/backend/.env.example apps/backend/.env
```

Linux:

```bash
cp apps/backend/.env.example apps/backend/.env
```

Editar `apps/backend/.env` y poner la contraseña real en `DB_PASSWORD` (y ajustar usuario, puerto o nombre de base de datos si son distintos).

## 4. Aplicar las migraciones

```bash
bun run db:migrate
```

Crea o actualiza las tablas de la base de datos con las migraciones de `apps/backend/src/migrations`. Si no hay migraciones pendientes, TypeORM lo indica y no hace cambios. Para crear una migración nueva después de modificar una entidad (desde `apps/backend`):

```bash
cd apps/backend
bun run migration:generate src/migrations/NombreDelCambio
```

## 5. Levantar backend y frontend en modo desarrollo

**Opción A (recomendada):** ambos servicios a la vez, en una sola terminal:

```bash
bun run dev
```

Bun ejecuta en paralelo el script `dev` de cada aplicación y muestra la salida de ambas con el nombre del paquete como prefijo. Para detenerlos, `Ctrl+C`.

**Opción B:** cada servicio en su propia terminal:

```bash
# Terminal 1
bun run dev:backend

# Terminal 2
bun run dev:frontend
```

| Servicio | URL | Comportamiento en desarrollo |
|---|---|---|
| Backend (NestJS) | http://localhost:3000/api | Se reinicia solo al guardar cambios (`bun --watch`) |
| Frontend (Vite) | http://localhost:5173 | Recarga instantánea (HMR); reenvía `/api` al backend |

## 6. Verificar que todo funciona

- En la terminal del backend debe aparecer `Nest application successfully started`.
- En la terminal del frontend debe aparecer `VITE ... ready` con la URL local.
- Abrir `http://localhost:5173` en el navegador: debe cargar la aplicación React.
- Abrir `http://localhost:3000/api`: una respuesta `404 Cannot GET /api` es correcta mientras no exista un controlador en esa ruta; confirma que el backend responde.

## Comandos frecuentes

| Comando | Qué hace |
|---|---|
| `bun install` | Instala las dependencias de todos los paquetes (en la raíz) |
| `bun run dev` | Levanta backend y frontend en modo desarrollo |
| `bun run dev:backend` | Levanta solo el backend |
| `bun run dev:frontend` | Levanta solo el frontend |
| `bun run build` | Compila el backend y el frontend |
| `bun run db:migrate` | Aplica las migraciones pendientes |
| `bun run db:revert` | Revierte la última migración aplicada |
| `bun add <paquete>` | Agrega una dependencia; ejecutarlo dentro de `apps/backend`, `apps/frontend` o `packages/shared` según corresponda |
| `bun --bun run nest g resource <nombre>` | Genera un módulo CRUD de Nest (desde `apps/backend`) |

## Problemas comunes

- `ECONNREFUSED 127.0.0.1:5432` o `Unable to connect to the database`: PostgreSQL no está activo o el puerto es otro. Repetir el paso 2 y revisar `DB_PORT`. El backend reintenta conectarse automáticamente.
- `password authentication failed`: la contraseña de `DB_PASSWORD` no coincide con la del usuario de PostgreSQL.
- `database "eventos" does not exist`: falta crear la base de datos (paso 2) o el nombre en `DB_NAME` es distinto.
- `EADDRINUSE` / puerto ocupado: otro proceso usa el 3000 o el 5173. Cerrarlo o cambiar `PORT` en `.env` (backend) o `server.port` en `vite.config.ts` (frontend).
- `node: command not found` al ejecutar una herramienta: ese comando intenta usar Node.js. Ejecutarlo con `bun --bun` o `bunx --bun` en lugar de instalar Node.
- Errores de dependencias tras un `git pull`: ejecutar `bun install` en la raíz.
