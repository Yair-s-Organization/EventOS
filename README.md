# Documentación General del Proyecto — EventOS

## Contenido

1. [Arquitectura del Proyecto: Monorepo](#1-arquitectura-del-proyecto-monorepo)
3. [Tecnologías a usar](#2-tecnologías-a-usar)
4. [Cómo se manejarán las ramas en GitHub](#3-cómo-se-manejarán-las-ramas-en-github)
5. [Guía de Instalación](#4-guía-de-instalación)
   - [Git](#git)
   - [PostgreSQL](#postgresql)
   - [Bun](#bun)
   - [NestJS](#nestjs)
6. [Configuración del Monorepo](#5-configuración-del-monorepo)
   - [Estructura general de carpetas](#estructura-general-de-carpetas)
   - [Bun Workspaces: `package.json` raíz](#bun-workspaces-packagejson-raíz)
   - [Paquete compartido: `packages/shared`](#paquete-compartido-packagesshared)
   - [Backend: `apps/backend` (NestJS + TypeORM + PostgreSQL)](#backend-appsbackend-nestjs--typeorm--postgresql)
   - [Arquitectura y Estructura de Carpetas del Backend (`apps/backend/src/`)](#arquitectura-y-estructura-de-carpetas-del-backend-appsbackendsrc)
    - [Almacenamiento de archivos (MinIO / R2)](#almacenamiento-de-archivos-minio--r2)
   - [Frontend: `apps/frontend` (React + Vite)](#frontend-appsfrontend-react--vite)
   - [Arquitectura y Estructura de Carpetas del Frontend (`apps/frontend/src/`)](#arquitectura-y-estructura-de-carpetas-del-frontend-appsfrontendsrc)
   - [¿Cómo se conecta todo? (Ejemplo del flujo completo)](#cómo-se-conecta-todo-ejemplo-del-flujo-completo)
   - [Archivos de control de versiones](#archivos-de-control-de-versiones)
7. [Guía de ejecución del proyecto](#6-guía-de-ejecución-del-proyecto)
   - [1. Clonar el repositorio e instalar dependencias](#1-clonar-el-repositorio-e-instalar-dependencias)
   - [2. Levantar la base de datos (PostgreSQL)](#2-levantar-la-base-de-datos-postgresql)
   - [3. Configurar las variables de entorno](#3-configurar-las-variables-de-entorno)
    - [4. Levantar el almacenamiento de archivos (MinIO con Docker)](#4-levantar-el-almacenamiento-de-archivos-minio-con-docker)
   - [5. Aplicar las migraciones](#5-aplicar-las-migraciones)
   - [6. Levantar backend y frontend en modo desarrollo](#6-levantar-backend-y-frontend-en-modo-desarrollo)
   - [7. Verificar que todo funciona](#7-verificar-que-todo-funciona)
8. [Comandos frecuentes](#7-comandos-frecuentes)
9. [Problemas comunes](#8-problemas-comunes)



# ¿Quién aprueba y revisa los cambios?

Se acordó que los cambios se aprueban entre los miembros de cada equipo, es decir, si perteneces al equipo de Frontend los cambios deben ser aprobados por miembros del mismo equipo, sucede lo mismo con el Backend.

## 1. Arquitectura del Proyecto: Monorepo

Un **Monorepo** es un único repositorio en GitHub que aloja múltiples proyectos distintos (en este caso, el código del frontend y del backend juntos). Existe para resolver el problema de mantener sincronizados varios repositorios; permite compartir configuraciones, dependencias y código (como interfaces de TypeScript) entre el cliente y el servidor de forma directa.

Se divide en tres piezas principales dentro de la raíz:

1. **`apps/frontend`**: La aplicación web visual hecha con **React y Vite**.
2. **`apps/backend`**: El servidor y API REST hecho con **NestJS, TypeORM y PostgreSQL**.
3. **`packages/shared`**: Un paquete intermedio para compartir código e interfaces de TypeScript entre el frontend y el backend sin tener que escribirlas dos veces.

- **GitHub:** `https://github.com/gameShark1610/EventoOS` (Organización: `https://github.com/Yair-s-Organization/EventOS`)

---

## 2. Tecnologías a usar

- **Backend:** TypeScript con **NestJS**.
- **Frontend:** HTML, CSS, **React** y **React Router**.
  - **Vite** es el bundler y servidor de desarrollo oficial del frontend. React por sí solo no incluye herramientas para compilar JSX/TypeScript ni para servir la aplicación mientras se desarrolla; Vite cubre ambas cosas: levanta un servidor de desarrollo con recarga instantánea (HMR) y, con `vite build`, genera el paquete optimizado para producción.
- **Editor de código:** Es libre, pero se recomienda **Visual Studio Code**.
- **Gestor de paquetes / Entorno:** **Bun**
  - Bun es un entorno de ejecución y gestor de paquetes para JavaScript/TypeScript. Reemplaza a herramientas tradicionales como Node.js y npm. Existe porque los tiempos de instalación y ejecución en Node pueden ser lentos en proyectos grandes; Bun está diseñado desde cero para ser extremadamente rápido, optimizando el tiempo de desarrollo.
  - **El proyecto se desarrolla en un entorno 100% Bun:** no se instala Node.js, FNM ni npm. Todos los comandos del proyecto usan `bun` o `bunx`.
- **Orquestación del monorepo:** **Bun Workspaces**
  - Bun Workspaces vincula los proyectos del repositorio: declara qué carpetas son paquetes, instala todas las dependencias en una sola operación (`bun install` en la raíz, con un único `bun.lock`) y permite que un paquete dependa de otro del mismo repositorio mediante el protocolo `workspace:*`. También permite ejecutar un mismo script en varios paquetes a la vez con `bun run --filter`.
- **ORM (Base de datos):** **TypeORM y PostgreSQL**
  - **TypeORM** es un Mapeador Objeto-Relacional. Existe para evitar que los desarrolladores tengan que escribir consultas de bases de datos en SQL puro. Permite interactuar con la base de datos manipulando clases y objetos directamente en TypeScript, lo que reduce errores de sintaxis, facilita la migración de datos y agiliza el desarrollo del backend.
  - **PostgreSQL** soporta tipos de datos complejos de forma nativa, como `JSONB`, `UUID` y arreglos (`arrays`). TypeORM aprovecha esto perfectamente, permitiendo mapear estos tipos de datos directamente a interfaces de TypeScript sin hacer conversiones manuales.

---

## 3. Cómo se manejarán las ramas en GitHub

### `main` (Rama Principal / Producción)

- Contiene la versión final, estable y funcional del sistema. Es el código listo para desplegarse.
- **Nadie puede programar ni hacer commits directamente en esta rama.** El código llega a esta rama a través de fusiones (*merges*) de versiones previamente revisadas y aprobadas.

### `develop` (Rama de Integración y Pruebas)

- Es la rama central de desarrollo. Es aquí donde se junta el trabajo individual de todos los integrantes para probar que todo funcione en conjunto.
- **No se programa directamente aquí.** Sirve como punto de integración de código. Antes de fusionar un Pull Request se debe contar con las aprobaciones requeridas y verificar siempre que la rama de destino sea `develop`.

### `feature/` (Ramas de Desarrollo de Funcionalidades)

- Es aquí donde se programa. Cada vez que un integrante tome una nueva tarea debe crear una rama exclusiva para este trabajo.
- Se deben crear a partir de la rama `develop` más actualizada.
- **Nomenclatura:** se nombran usando el prefijo `feature/` seguido de una descripción corta (usando guiones para los espacios). Ejemplos:
  - `feature/pantalla-login`
  - `feature/formulario-solicitar-evento`
  - `feature/validacion-7-dias-anticipacion`
- Al terminar la tarea se sube la rama a GitHub y se solicita integrarla a `develop` mediante un **Pull Request**.

### `bugfix/` (Ramas de Corrección de Errores)

- Si durante las pruebas en `develop` se detecta un fallo, se crea esta rama exclusivamente para solucionar ese problema, sin mezclarlo con código nuevo.
- Se crean a partir de `develop`.
- **Nomenclatura:** Se nombran usando el prefijo `bugfix/` seguido del problema (usando guiones para los espacios).

---

## 4. Guía de Instalación

**Instalaciones necesarias:**

- Git
- PostgreSQL 18.x (La última versión disponible)
- Bun v1.x (Latest Stable)
- NestJS CLI (se instala como dependencia del backend, no de forma global; ver sección NestJS)

> **Entorno 100% Bun:** No se instala Node.js, FNM ni npm. Bun ejecuta, instala y compila todo el proyecto. Para no depender de un Node externo, los scripts de herramientas con ejecutable Node (Vite, CLI de TypeORM, CLI de Nest) se invocan con `bun --bun` o `bunx --bun`, que obliga a usar el runtime de Bun.

### Git

**Windows (PowerShell):**

```powershell
winget install Git.Git
```

**Linux (Debian/Ubuntu; en otras distros usar su gestor de paquetes):**

```bash
sudo apt install git
```

Confirmar con `git --version`.

### PostgreSQL

- **Windows:** [Guía en video de instalación](https://www.youtube.com/watch?v=KBtrtOAVLYQ) o mediante PowerShell:
  ```powershell
  winget install PostgreSQL.PostgreSQL.18
  ```
- **Linux:** Depende de la distribución; se recomienda investigar para la distribución en específico.

### Bun

**1. Windows en PowerShell:**

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

Cerrar y volver a abrir la terminal. Confirmar con:

```powershell
bun --version
```

**2. Linux:**

```bash
curl -fsSL https://bun.sh/install | bash
```

Aplicar los cambios para tu terminal en específico (por ejemplo `source ~/.bashrc` en bash o `source ~/.zshrc` en zsh) y confirmar con `bun --version`. Debe mostrar una versión `1.x`.

### NestJS

El CLI de Nest no se instala de forma global: queda como dependencia de desarrollo del backend (se agrega en la sección de configuración del backend) para que todo el equipo use la misma versión. Como su ejecutable es de Node, se invoca siempre con `bun --bun run nest`. Ejemplo, desde `apps/backend`:

```bash
bun --bun run nest --version
bun --bun run nest g resource eventos
```

---

## 5. Configuración del Monorepo

Esta sección documenta cómo está armado el repositorio: cómo se vinculan los paquetes con Bun Workspaces, cómo se ejecutan las tareas de todos los paquetes con los scripts de Bun y cómo se configuran y organizan el backend (NestJS + TypeORM) y el frontend (React + Vite). Quien clone un repositorio que ya tiene esta configuración solo necesita seguir la [Guía de ejecución del proyecto](#6-guía-de-ejecución-del-proyecto).

### Estructura general de carpetas

```text
EventoOS/
├── package.json                  # raíz: workspaces + scripts globales
├── bun.lock                      # lockfile único (se versiona)
├── .gitignore
├── apps/
│   ├── backend/                  # NestJS + TypeORM + PostgreSQL
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── .env.example
│   │   └── src/
│   │       ├── common/
│   │       ├── config/
│   │       ├── database/
│   │       │   ├── migrations/
│   │       │   ├── seeds/
│   │       │   └── data-source.ts
│   │       ├── modules/
│   │       ├── app.module.ts
│   │       └── main.ts
│   └── frontend/                 # React + Vite
│       ├── package.json
│       ├── vite.config.ts
│       ├── tsconfig.json
│       ├── index.html
│       └── src/
│           ├── app/
│           ├── assets/
│           ├── components/
│           ├── features/
│           ├── hooks/
│           ├── lib/
│           ├── styles/
│           ├── types/
│           ├── utils/
│           ├── App.tsx
│           └── main.tsx
└── packages/
    └── shared/                   # tipos/interfaces TypeScript compartidos
        ├── package.json
        └── src/
            └── index.ts
```

- `apps/` contiene las aplicaciones ejecutables (`backend` y `frontend`).
- `packages/` contiene código compartido que no se ejecuta solo (por ejemplo, las interfaces TypeScript que usan ambos lados).

---

### Bun Workspaces: `package.json` raíz

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
- `workspaces` hace que un único `bun install` en la raíz instale las dependencias de todos los paquetes y genere un solo `bun.lock`. **Nunca ejecutar `bun install` dentro de `apps/*`, ni usar `npm`.**
- Los scripts de la raíz son el punto de entrada del equipo: `bun run dev`, `bun run build`, `bun run db:migrate`.
- `bun run --filter '*' dev` ejecuta en paralelo el script `dev` de todos los paquetes que lo definan; por eso backend y frontend exponen `dev` y `build` en su propio `package.json`. `--filter @eventos/backend` limita la ejecución a un solo paquete.

---

### Paquete compartido: `packages/shared`

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

```typescript
export interface Evento {
  id: string;
  nombre: string;
}
```

Para usarlo, cada app lo declara como dependencia con el protocolo `workspace:*` (Bun lo enlaza localmente, no lo descarga) y lo importa por nombre:

```typescript
import type { Evento } from '@eventos/shared';
```

---

### Backend: `apps/backend` (NestJS + TypeORM + PostgreSQL)

**`apps/backend/package.json`**

```json
{
  "name": "@eventos/backend",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "bun --watch src/main.ts",
    "build": "bun build src/main.ts --target bun --outdir=dist --packages external",
    "start": "bun dist/main.js",
    "migration:generate": "bun --bun run typeorm migration:generate -d src/database/data-source.ts",
    "migration:run": "bun --bun run typeorm migration:run -d src/database/data-source.ts",
    "migration:revert": "bun --bun run typeorm migration:revert -d src/database/data-source.ts"
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
- `build` genera `dist/main.js` con `bun build`. La bandera `--packages external` es obligatoria: sin ella Bun intenta empaquetar las dependencias opcionales de Nest (como `class-transformer`) y la compilación falla.
- Los scripts `migration:*` ejecutan el CLI de TypeORM con el runtime de Bun (`bun --bun`) apuntando al `DataSource` del proyecto (`src/database/data-source.ts`).

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

- `experimentalDecorators` y `emitDecoratorMetadata` son obligatorios: NestJS (inyección de dependencias) y TypeORM (tipos de columnas) dependen de los decoradores y su metadata. Bun respeta ambas opciones del `tsconfig.json`.

**`apps/backend/.env.example`**

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_NAME=eventos
```

- Este archivo se versiona como plantilla; el `.env` real con la contraseña de cada persona no se sube a GitHub (está en `.gitignore`). Bun carga el `.env` automáticamente desde la carpeta donde corre el script, por lo que no se necesita `dotenv`.

**`apps/backend/src/database/data-source.ts`**

```typescript
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
  migrations: ['src/database/migrations/*.ts'],
});
```

**`apps/backend/src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbOptions } from './database/data-source';

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

```typescript
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

---

### Arquitectura y Estructura de Carpetas del Backend (`apps/backend/src/`)

El backend está construido con **NestJS**, un framework que obliga a ordenar el código siguiendo una **Arquitectura Modular y en Capas** (Controladores, Servicios y Acceso a Datos). Esto evita el "código espagueti" donde las consultas SQL se mezclan con las rutas HTTP.

```text
apps/backend/src/
├── common/                          # Herramientas reutilizables en cualquier módulo de NestJS
│   ├── decorators/                  # Decoradores personalizados (ej. @CurrentUser, @Roles)
│   ├── filters/                     # Manejo global de errores y formato de excepciones HTTP
│   ├── guards/                      # Validación de sesión (JWT) y permisos de acceso
│   ├── interceptors/                # Transformación de respuestas o registro de logs/auditoría
│   ├── pipes/                       # Validaciones o transformaciones de datos de entrada
│   ├── storage/                     # StorageService: único acceso a archivos (MinIO / R2)
│   └── upload/                      # Opciones de Multer para recibir y validar archivos
├── config/                          # Lectura y validación de variables de entorno (.env)
├── database/
│   ├── migrations/                  # Historial de migraciones SQL generadas por TypeORM
│   ├── seeds/                       # Scripts para insertar datos iniciales de prueba o por defecto
│   └── data-source.ts               # Configuración única de conexión a PostgreSQL
├── modules/                         # Módulos de dominio de negocio
│   ├── events/                      # <-- EJEMPLO DE ORGANIZACIÓN INTERNA DE UN MÓDULO
│   │   ├── controllers/
│   │   │   └── events.controller.ts # Define los endpoints (GET, POST, PATCH, DELETE)
│   │   ├── dto/
│   │   │   ├── create-event.dto.ts  # Validación de datos de entrada al crear
│   │   │   └── update-event.dto.ts  # Validación de datos de entrada al actualizar
│   │   ├── entities/
│   │   │   └── event.entity.ts      # Modelo de tabla de base de datos para TypeORM
│   │   ├── services/
│   │   │   └── events.service.ts    # Lógica de negocio y consultas a la base de datos
│   │   └── events.module.ts         # Empaqueta el módulo, registra entidades y exporta servicios
│   └── ...                          # (Resto de módulos siguiendo el mismo patrón)
├── app.module.ts                    # Módulo raíz que importa todos los módulos de la carpeta modules/
└── main.ts                          # Punto de arranque del servidor NestJS (prefijo '/api', puerto, etc.)
```

#### 1. Carpeta `common/`

- **¿Por qué se llama así?** *Common* significa "común" o compartido entre todos los módulos.
- **¿A qué se refiere y para qué sirve?** Contiene las piezas especiales de NestJS que se encargan de la seguridad, validación y formato de todas las peticiones antes o después de que lleguen a la lógica de negocio.
- **¿Qué subcarpetas tiene y qué significa cada concepto en NestJS?**
  - `guards/` (*Guardias de seguridad*): Clases que deciden si una petición HTTP tiene permiso de ejecutarse o no. Revisan el token de sesión del usuario y su rol; si no tiene permiso, devuelven un error `401 Unauthorized` o `403 Forbidden` automáticamente.
  - `pipes/` (*Tuberías de validación/transformación*): Son filtros por los que pasan los datos que envía el usuario antes de llegar al controlador. Sirven para transformar datos (ej. convertir un `"12"` de texto en el número `12`) o rechazar datos mal formados.
  - `decorators/` (*Decoradores personalizados*): En TypeScript, los decoradores son etiquetas con un `@` (como `@Get()` o `@Column()`) que añaden funcionalidad extra. Aquí creamos etiquetas propias, como `@Roles('ADMIN')` para indicar fácilmente qué rol requiere un endpoint.
  - `filters/` (*Filtros de excepciones*): Capturan cualquier error que ocurra en el servidor y lo convierten en una respuesta JSON limpia y estandarizada con el mensaje de error correspondiente para el frontend.
  - `interceptors/` (*Interceptores*): Funcionan como cámaras de vigilancia que interceptan la petición al entrar y al salir. Son ideales para guardar registros automáticos en la bitácora de auditoría sin ensuciar el código de cada módulo.
  - `storage/` (*Almacenamiento de archivos*): Contiene `StorageService`, el único código que guarda, lee y borra archivos (póster, documento de identidad) en MinIO o R2. Ver [Almacenamiento de archivos](#almacenamiento-de-archivos-minio--r2).
  - `upload/` (*Recepción de archivos*): Configuraciones reutilizables de Multer (`posterOptions`, `documentoOptions`) que reciben el archivo y validan tipo y tamaño antes de pasarlo a `StorageService`.

#### 2. Carpeta `config/`

- **¿Por qué se llama así?** Abreviatura de *Configuration* (Configuración).
- **¿A qué se refiere y para qué sirve?** Centraliza la lectura de las variables de entorno del archivo `.env` (como puertos, claves secretas para tokens o credenciales de correo), asegurando que si falta alguna variable crítica al encender el servidor, avise de inmediato.

#### 3. Carpeta `database/`

- **¿Por qué se llama así?** *Database* (Base de datos).
- **¿A qué se refiere y para qué sirve?** Contiene todo lo referente a la conexión con **PostgreSQL** y el historial de estructura de tablas manejado por **TypeORM**.
- **¿Qué contiene y cómo se usa?**
  - `data-source.ts` (*Fuente de datos*): Es el archivo que lee las credenciales del `.env` (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`) y establece la conexión única hacia PostgreSQL.
  - `migrations/` (*Migraciones*): Como en el proyecto está configurado `synchronize: false` por seguridad, la base de datos nunca se modifica sola. Una migración es un archivo con instrucciones exactas para crear o modificar tablas que se comparte por Git para que todos los integrantes tengan exactamente la misma base de datos al ejecutar `bun run db:migrate`.
  - `seeds/` (*Semillas de datos*): Scripts que insertan los datos iniciales obligatorios cuando la base de datos está recién creada y vacía (por ejemplo, crear la primera cuenta de Administrador o el catálogo inicial de recintos).

#### 4. Carpeta `modules/`

- **¿Por qué se llama así?** En NestJS, la aplicación se divide en *Modules* (Módulos de dominio). Incluso el propio generador del framework los crea con el comando `bun --bun run nest g resource <nombre>`.
- **¿A qué se refiere y para qué sirve?** Cada subcarpeta dentro de `modules/` encapsula un área del negocio (ej. `auth`, `users`, `events`, `venues`, `reservations`).
- **¿Qué contiene un módulo por dentro y cómo funciona cada pieza?**
  - `controllers/` (*Controladores* — `*.controller.ts`): Son los **recepcionistas** del backend. Su único trabajo es escuchar una ruta URL (ej. `POST /api/events`), recibir los datos del cliente, llamar al servicio correspondiente y devolver la respuesta. **Regla:** Un controlador nunca debe hacer consultas directas a la base de datos ni tener cálculos complejos.
  - `services/` (*Servicios* — `*.service.ts`): Son el **cerebro** del módulo. Aquí vive toda la **lógica de negocio y las reglas del sistema** (validar que no haya traslape de horarios, verificar que queden lugares disponibles, descontar cupos, etc.) y es quien se comunica con las entidades de la base de datos.
  - `dto/` (*Data Transfer Objects / Objetos de Transferencia de Datos* — `*.dto.ts`): Son clases que definen **qué datos exactos esperamos recibir del usuario** en una petición (por ejemplo, en `create-event.dto.ts` especificamos que el nombre debe ser texto obligatorio y la fecha válida). Si el usuario manda basura o deja campos vacíos, el DTO rechaza la petición antes de que toque la base de datos.
  - `entities/` (*Entidades* — `*.entity.ts`): Son la representación en código TypeScript de las **tablas de PostgreSQL** usando decoradores de TypeORM (`@Entity()`, `@Column()`, `@PrimaryGeneratedColumn()`). TypeORM detecta automáticamente cualquier archivo terminado en `.entity.ts` gracias a la configuración del proyecto.
  - `[nombre].module.ts`: Es la "caja" que registra y conecta a los controladores, servicios y entidades de esa carpeta para que NestJS sepa cómo inyectarlos.

#### 5. Archivos raíz (`main.ts` y `app.module.ts`)

- `app.module.ts`: Es el módulo raíz donde se unen la conexión de TypeORM y todos los módulos de la carpeta `modules/`.
- `main.ts`: Es el archivo que arranca el servidor NestJS, aplica el prefijo global `/api` a todas las rutas y pone al servidor a escuchar en el puerto `3000`.

### Almacenamiento de archivos (MinIO / R2)

Todos los archivos que sube un usuario pasan por **un único camino**, sin importar si son un póster o un documento de identidad:

```text
Frontend ──▶ Multer (recibe y valida) ──▶ StorageService ──▶ MinIO (desarrollo) / Cloudflare R2 (producción)
                                              │
                                              └─▶ devuelve una "key" que se guarda en la base de datos
```

| Pieza                       | Archivo                                           | Qué hace                                                                          |
| --------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Multer**                  | `common/upload/upload.options.ts`                 | Recibe el archivo, valida tipo y tamaño. Lo deja en memoria (`file.buffer`).      |
| **`StorageService`**        | `common/storage/storage.service.ts`               | **Único** código que guarda, lee y borra archivos. Nadie más toca MinIO/R2.       |
| **`StorageModule`**         | `common/storage/storage.module.ts`                | Módulo global: se inyecta `StorageService` en cualquier módulo sin importarlo.    |
| **MinIO / R2**              | `docker-compose.yml` / `.env`                     | Donde quedan físicamente los archivos.                                            |

**Dos buckets según la privacidad del archivo:**

| Bucket            | Visibilidad | Qué se guarda                       | Cómo se ve                                    |
| ----------------- | ----------- | ----------------------------------- | --------------------------------------------- |
| `eventos-public`  | `'public'`  | Póster del evento                   | URL directa: `publicUrl(key)`                 |
| `eventos-private` | `'private'` | Documento de identidad (CU06)       | URL firmada temporal: `await privateUrl(key)` |

Los boletos con QR **no se guardan**: se generan al momento con `QrService`.

**Métodos de `StorageService`:**

| Método                                    | Devuelve                | Uso                                                                  |
| ----------------------------------------- | ----------------------- | -------------------------------------------------------------------- |
| `upload(file, folder, visibilidad)`       | `Promise<string>` (key) | Guarda el archivo con nombre único (UUID) y devuelve la key.         |
| `publicUrl(key)`                          | `string`                | URL directa. Solo para archivos subidos como `'public'`.             |
| `privateUrl(key, segundos = 300)`         | `Promise<string>`       | URL temporal (5 minutos por defecto) para archivos `'private'`.      |
| `delete(key, visibilidad)`                | `Promise<void>`         | Borra el archivo.                                                    |

**Cómo usarlo en un controlador:**

```ts
// Póster del evento (público)
@Post()
@UseInterceptors(FileInterceptor('poster', posterOptions))
async crear(@UploadedFile() file: Express.Multer.File) {
  const key = await this.storage.upload(file, 'posters', 'public');
  // guardar `key` en la columna evento.poster
  // para mostrarlo: this.storage.publicUrl(key)
}

// Documento de identidad (privado, CU06)
@Post()
@UseInterceptors(FileInterceptor('documento', documentoOptions))
async registrar(@UploadedFile() file: Express.Multer.File) {
  const key = await this.storage.upload(file, 'documentos-identidad', 'private');
  // guardar `key` en la base de datos
  // para que un administrador lo vea: await this.storage.privateUrl(key)
}
```

`StorageService` se recibe en el constructor (`constructor(private readonly storage: StorageService) {}`), sin importar nada en el módulo porque `StorageModule` es global.

**Validaciones incluidas en `upload.options.ts`:**

| Configuración      | Tipos permitidos                    | Tamaño máximo | Error si no cumple                     |
| ------------------ | ----------------------------------- | ------------- | -------------------------------------- |
| `posterOptions`    | JPG, PNG, WebP                      | 5 MB          | `400` (tipo) / `413` (tamaño)          |
| `documentoOptions` | PDF, JPG, PNG                       | 5 MB          | `400` (tipo) / `413` (tamaño)          |

Para otro caso de uso, se crea una configuración nueva con `crearUploadOptions(['tipos/permitidos'], maxMB)`.

**Reglas del equipo:**

- **Solo `StorageService` toca archivos.** Ningún otro código debe usar `fs`, `@aws-sdk` ni escribir en carpetas del servidor.
- **En la base de datos se guarda la `key`**, nunca una URL completa. Así, cambiar de MinIO a R2 no obliga a modificar datos existentes.
- **Los documentos de identidad siempre van como `'private'`.**

**Variables de entorno** (`apps/backend/.env`; las de desarrollo ya vienen en `.env.example`):

| Variable            | Desarrollo (MinIO)                          | Producción (Cloudflare R2)                          |
| ------------------- | ------------------------------------------- | --------------------------------------------------- |
| `S3_ENDPOINT`       | `http://localhost:9000`                     | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`     |
| `S3_REGION`         | `us-east-1`                                 | `auto`                                              |
| `S3_ACCESS_KEY`     | `minioadmin`                                | Access Key ID del token de R2                       |
| `S3_SECRET_KEY`     | `miniopassword`                             | Secret Access Key del token de R2                   |
| `S3_BUCKET_PUBLIC`  | `eventos-public`                            | Nombre del bucket público en R2                     |
| `S3_BUCKET_PRIVATE` | `eventos-private`                           | Nombre del bucket privado en R2                     |
| `S3_PUBLIC_URL`     | `http://localhost:9000/eventos-public`      | URL pública del bucket (`https://pub-xxxx.r2.dev` o dominio propio) |

**Pasar a producción (R2):** crear los dos buckets en Cloudflare R2, habilitar acceso público solo en el de pósters, crear un token de API con permisos de lectura y escritura, y reemplazar las variables de la tabla en el `.env` del servidor. **No se modifica código.** El nivel gratuito de R2 (10 GB, sin costo por transferencia de salida) cubre las necesidades del proyecto.

> **Nota sobre MinIO:** MinIO dejó de publicar imágenes en Docker Hub y quay.io. Por eso `docker-compose.yml` usa `cgr.dev/chainguard/minio` (imagen de Chainguard) y `amazon/aws-cli` para crear los buckets. Es solo para desarrollo local; no afecta a producción con R2.

---

### Frontend: `apps/frontend` (React + Vite)

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

```typescript
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
- El proxy redirige las peticiones del navegador a `/api/...` hacia el backend en el puerto `3000`, evitando configurar CORS durante el desarrollo.

**`apps/frontend/index.html`**

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>EventoOS</title>
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
  const ejemplo: Evento = { id: '1', nombre: 'EventoOS' };
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

---

### Arquitectura y Estructura de Carpetas del Frontend (`apps/frontend/src/`)

> **Nota sobre la arquitectura del Frontend:** El Frontend de EventOS proporciona las interfaces con las que interactúan los distintos perfiles del sistema combinando dos enfoques complementarios:
>
> - **Arquitectura por funcionalidades (Feature-Based / Feature-Sliced Design):** En lugar de meter todas las pantallas de todo el sistema en una sola carpeta gigante, agrupa el código según el módulo de negocio al que pertenece.
> - **Atomic Design:** Organiza los componentes visuales reutilizables según su nivel de composición (`atoms`, `molecules`, `organisms`, `templates`).
>
> El objetivo es facilitar el trabajo paralelo, la consistencia con los diseños de Figma y el mantenimiento del código sin acoplar las funcionalidades entre sí. Los estilos se implementan siguiendo la guía visual aprobada por Diseño (la adopción de Tailwind CSS aún no forma parte de esta propuesta).

```text
apps/frontend/
├── src/
│   ├── app/
│   │   ├── guards/
│   │   ├── providers.tsx
│   │   └── router.tsx
│   ├── assets/
│   │   ├── icons/
│   │   └── images/
│   ├── components/
│   │   ├── atoms/
│   │   ├── molecules/
│   │   ├── organisms/
│   │   └── templates/
│   │       └── MainLayout.tsx
│   ├── features/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── educational-services/
│   │   ├── events/
│   │   ├── logistics/
│   │   ├── organizer/
│   │   ├── reservations/
│   │   └── tickets/
│   ├── hooks/
│   ├── lib/
│   ├── styles/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

Las carpetas aún vacías contienen archivos `.gitkeep` para poder registrarse en Git. No es necesario crear subcarpetas adicionales hasta que exista código que las requiera.

#### Detalle de cada carpeta del Frontend

##### 1. Carpeta `app/`

- **¿Por qué se llama así?** Viene de *Application* (Aplicación). Representa el "núcleo" o configuración general que envuelve a todo el proyecto de React.
- **¿A qué se refiere y para qué sirve?** Contiene la configuración que hace que la aplicación funcione como un todo antes de mostrar cualquier pantalla: el enrutador, los estados globales y la seguridad de navegación.
- **¿Qué contiene y cómo se usa?**
  - `router.tsx` (*Enrutador*): Es el mapa de URLs del sistema. Declara las rutas mediante React Router y define qué página se muestra cuando el usuario entra a `/login`, `/eventos` o `/mis-boletos`.
  - `providers.tsx` (*Proveedores de contexto*): En React, un *Provider* es un componente que "provee" información global a toda la aplicación (por ejemplo, saber qué usuario tiene la sesión iniciada o mostrar alertas flotantes).
  - `guards/` (*Guardias de ruta*): Son componentes que actúan como cadeneros en la puerta de una ruta. Antes de dejar pasar al usuario a una página, revisan si tiene sesión activa o el rol necesario; si no, lo redirigen al inicio de sesión.

##### 2. Carpeta `assets/`

- **¿Por qué se llama así?** En desarrollo web, *Assets* significa "recursos estáticos" o activos multimedia.
- **¿A qué se refiere y para qué sirve?** Guarda archivos que **no son código** (no son `.ts` ni `.tsx`), sino archivos visuales o multimedia que Vite empaquetará junto con la página.
- **¿Qué contiene y cómo se usa?**
  - `icons/`: Iconos en formato `.svg` o `.png`.
  - `images/`: Logotipos institucionales, fondos o imágenes por defecto. Se importan directamente en los componentes (`import logo from '@/assets/images/logo.png'`).

##### 3. Carpeta `components/` (y niveles de Atomic Design)

- **¿Por qué se llama así?** En React, toda la interfaz se construye uniendo piezas llamadas *Components* (Componentes).
- **¿A qué se refiere y para qué sirve?** Almacena **únicamente los componentes visuales genéricos y globales** que se reutilizan en dos o más módulos distintos del sistema.
- **Organización con Atomic Design:**

| Nivel         | Responsabilidad                                                                                              | Ejemplos previstos                               |
| ------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| `atoms`     | Elementos básicos reutilizables ("bloques de LEGO" más básicos del diseño).                              | `Button`, `Input`, `Badge`.                |
| `molecules` | Combinaciones pequeñas de átomos.                                                                          | `FormField`, `SearchField`.                  |
| `organisms` | Secciones completas de interfaz.                                                                             | `Navbar`, `ConfirmDialog`, `EventFilters`. |
| `templates` | Distribución y estructura general de páginas (esqueleto visual que rodea a las páginas y usa `Outlet`). | `MainLayout`.                                  |

- **Regla de uso:** Un componente dentro de `components/` **nunca** debe saber nada específico de un módulo de negocio (por ejemplo, no debe llamarse `BotonCancelarEvento.tsx`, sino simplemente `Button.tsx` y recibir el texto por propiedades). Un componente solo debe trasladarse a `components/` cuando sea realmente reutilizable entre varias funcionalidades.

##### 4. Carpeta `features/` (Módulos funcionales)

- **¿Por qué se llama así?** *Feature* significa "funcionalidad" o "módulo de negocio".
- **¿A qué se refiere y para qué sirve?** Es el corazón del frontend. Cada subcarpeta aquí dentro representa un módulo funcional del proyecto. Su objetivo es que cada subequipo trabaje dentro de su propia carpeta sin chocar ni generar conflictos en Git con los demás equipos.

**Módulos funcionales del sistema:**

| Módulo                  | Responsabilidad principal                       |
| ------------------------ | ----------------------------------------------- |
| `admin`                | Administración del sistema.                    |
| `auth`                 | Inicio de sesión y autenticación.             |
| `educational-services` | Operaciones de Servicios Educativos.            |
| `events`               | Consulta y presentación de eventos.            |
| `logistics`            | Funciones del personal de Logística.           |
| `organizer`            | Herramientas del Organizador.                   |
| `reservations`         | Disponibilidad y reservas de lugares.           |
| `tickets`              | Visualización y gestión de boletos digitales. |

- **¿Cómo se organiza una *feature* por dentro y cómo se usa?**
  A medida que se implementen las funcionalidades, cada módulo podrá incorporar las subcarpetas que necesite:
  - `pages/` (*Páginas*): Son las pantallas completas de esa funcionalidad (ej. `EventsPage.tsx`). Son las únicas que se conectan directamente al `router.tsx`.
  - `components/` (*Componentes locales*): Son piezas visuales que **solo le importan a este módulo** (ej. `EventCard.tsx` para mostrar el recuadro de un evento). Al ponerlos aquí, no ensuciamos la carpeta global `src/components/`.
  - `api/` o `services/` (*Comunicación con API*): Archivos con las funciones que hacen peticiones HTTP (`fetch` o `axios`) hacia el backend para pedir o enviar datos de este módulo (ej. `getEvents()`, `createEvent()`).
  - `hooks/`: Lógica y manejo de estado exclusiva de este módulo.
  - `types/`: Interfaces de TypeScript exclusivas para los formularios o componentes de esta pantalla.
  - `index.ts` (*Archivo barril / Barrel file*): Es la "puerta de salida" del módulo. Exporta únicamente lo que el resto de la aplicación necesita ver de esta *feature* (como sus páginas para el `router.tsx`).

##### 5. Carpeta `hooks/`

- **¿Por qué se llama así?** En React, los *Hooks* ("ganchos") son funciones especiales cuyos nombres siempre empiezan con el prefijo `use` (como `useState` o `useEffect`) que permiten "enganchar" estado y ciclo de vida a los componentes.
- **¿A qué se refiere y para qué sirve?** Guarda **Custom Hooks (Hooks personalizados) globales** que resuelven problemas técnicos repetitivos en cualquier pantalla.
- **¿Cómo se usa?** Por ejemplo, si necesitan detectar cuando el usuario lleva 30 minutos sin mover el ratón para cerrar su sesión por inactividad, se crea aquí un archivo `useIdleTimer.ts` y se invoca donde se necesite.

##### 6. Carpeta `lib/`

- **¿Por qué se llama así?** Es la abreviatura estándar de *Libraries* (Librerías o bibliotecas externas).
- **¿A qué se refiere y para qué sirve?** Cuando instalamos una herramienta externa (por ejemplo, un cliente para hacer peticiones al servidor o una librería para manejar fechas), no queremos configurarla desde cero en cada archivo. En `lib/` guardamos la **configuración base (wrapper)** de esas herramientas.
- **¿Cómo se usa?** Aquí se crea, por ejemplo, `apiClient.ts`, donde se configura una sola vez que todas las peticiones apunten al prefijo `/api` (el cual Vite redirige automáticamente a `http://localhost:3000` en desarrollo) y que adjunten el token de sesión del usuario.

##### 7. Carpeta `styles/`

- **¿Por qué se llama así?** Viene de *Stylesheets* (Hojas de estilo).
- **¿A qué se refiere y para qué sirve?** Contiene los archivos `.css` globales de toda la aplicación, como la paleta de colores en variables CSS, las fuentes tipográficas y el reseteo de márgenes del navegador.

##### 8. Carpeta `types/`

- **¿Por qué se llama así?** Viene de *Data Types* (Tipos de datos de TypeScript).
- **¿A qué se refiere y para qué sirve?** Define la forma que tienen los objetos en el código para que el editor nos avise si escribimos mal una propiedad.
- **¿Cómo se usa?**
  - Si un tipo de dato lo usan tanto el Backend como el Frontend (por ejemplo, la interfaz `Evento`), se coloca en el paquete compartido `packages/shared/src/` y se importa con `@eventos/shared`.
  - Si un tipo es exclusivo del diseño visual de varios módulos del Frontend (por ejemplo, las opciones de un menú de navegación), se coloca en esta carpeta `src/types/`.

##### 9. Carpeta `utils/`

- **¿Por qué se llama así?** Es la abreviatura de *Utilities* (Utilidades o funciones auxiliares).
- **¿A qué se refiere y para qué sirve?** Contiene **funciones puras de JavaScript/TypeScript** (funciones simples que reciben un dato, lo transforman y devuelven un resultado, sin depender de React ni de la base de datos).
- **¿Cómo se usa?** Aquí van funciones como `formatDateToCDMX(date)` para mostrar fechas en formato de 24 horas, o validadores de formato de correo electrónico.

##### 10. Archivos raíz (`main.tsx` y `App.tsx`) y Navegación

- `main.tsx`: Es el punto de entrada técnico que busca el `<div id="root">` en el archivo `index.html` e inyecta nuestra aplicación de React en el navegador.
- `App.tsx`: Es el componente raíz de React donde se unen los `providers.tsx` y el enrutador principal `router.tsx`.
- `components/templates/MainLayout.tsx`: Establece la estructura general y utiliza `Outlet` para mostrar las páginas correspondientes.

#### Convenciones del Frontend

1. Mantener en `components/` los componentes visuales verdaderamente reutilizables entre módulos.
2. Guardar en `features/<modulo>/` el código específico de cada funcionalidad.
3. Separar la presentación visual, la lógica de estado y las peticiones HTTP cuando su complejidad lo justifique.
4. Definir propiedades y contratos mediante tipos de TypeScript claros.
5. Seguir los componentes y estilos aprobados por el equipo de Diseño.
6. Evitar la duplicación de código y las importaciones innecesarias entre módulos.
7. No añadir dependencias nuevas sin revisarlas con el equipo.

---

### ¿Cómo se conecta todo? (Ejemplo del flujo completo)

Para que cualquier integrante entienda cómo viaja la información cuando programa una tarea, este es el recorrido exacto cuando un usuario hace clic en **"Reservar Lugar"**:

1. **En `features/reservations/pages/` (Frontend):** El usuario hace clic en el botón de confirmar reserva dentro de la página.
2. **En `features/reservations/api/` o `services/` (Frontend):** La página llama a la función `createReservation(datos)` que envía una petición `POST` a `/api/reservations` usando el cliente configurado en `lib/`.
3. **En `common/guards/` (Backend):** El servidor recibe la petición. Antes de procesar nada, el `JwtAuthGuard` verifica que el usuario tenga una sesión válida y activa.
4. **En `modules/reservations/dto/` (Backend):** El objeto `CreateReservationDto` revisa que el ID del evento y el asiento enviados tengan el formato correcto.
5. **En `modules/reservations/controllers/` (Backend):** El `ReservationsController` recibe la petición ya validada y llama a `this.reservationsService.create(datos, usuario)`.
6. **En `modules/reservations/services/` (Backend):** El `ReservationsService` ejecuta las reglas de negocio (verifica que el usuario no tenga ya un boleto para ese evento y que el asiento siga libre).
7. **En `modules/reservations/entities/` (Backend):** El servicio usa la entidad `Reservation` de TypeORM para guardar el registro en **PostgreSQL** y devuelve la confirmación al controlador, el cual responde al Frontend para mostrar el mensaje de éxito en pantalla.

---

### Archivos de control de versiones

**`.gitignore` (raíz)**

```gitignore
node_modules/
dist/
.env
```

Se debe versionar `bun.lock` (garantiza que todo el equipo instale exactamente las mismas versiones) y `.env.example`; **nunca `.env`**.

---

## 6. Guía de ejecución del proyecto

Todos los comandos se ejecutan desde la raíz del repositorio salvo que se indique lo contrario. Requisitos previos: Git, PostgreSQL y Bun instalados (ver [Guía de Instalación](#4-guía-de-instalación)).

### 1. Clonar el repositorio e instalar dependencias

```bash
git clone https://github.com/gameShark1610/EventoOS.git
cd EventoOS
git switch develop
git switch -c feature/nombre-de-tu-tarea
bun install
```

`bun install` instala las dependencias de los tres paquetes (`backend`, `frontend` y `shared`) y enlaza el paquete compartido. La rama `feature/` se crea a partir de `develop`, según la estrategia de ramas. Repetir `bun install` cada vez que se haga `git pull` y cambie algún `package.json` o `bun.lock`.

### 2. Levantar la base de datos (PostgreSQL)

PostgreSQL se ejecuta como servicio del sistema. Primero asegurarse de que esté activo y después crear la base de datos del proyecto, una sola vez. Se recomienda usar **pgAdmin4** para interfaz gráfica.

**Windows (PowerShell como administrador):**

```powershell
Get-Service postgresql*
Start-Service postgresql-x64-18
psql -U postgres -c "CREATE DATABASE eventos;"
```

Si `psql` no se reconoce, agregar `C:\Program Files\PostgreSQL\18\bin` al `PATH` o usar la aplicación "SQL Shell (psql)" del menú Inicio. El comando pide la contraseña que se definió al instalar PostgreSQL.

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

### 3. Configurar las variables de entorno

**Windows (PowerShell):**

```powershell
Copy-Item apps/backend/.env.example apps/backend/.env
```

**Linux:**

```bash
cp apps/backend/.env.example apps/backend/.env
```

Editar `apps/backend/.env` y poner la contraseña real en `DB_PASSWORD` (y ajustar usuario, puerto o nombre de base de datos si son distintos).

Las variables `S3_*` de ese mismo archivo (almacenamiento de archivos) ya traen los valores correctos para desarrollo local con el paso 4; no hay que modificarlas.

### 4. Levantar el almacenamiento de archivos (MinIO con Docker)

El sistema guarda archivos (póster del evento y documento de identidad) en un almacenamiento compatible con S3. En desarrollo es **MinIO corriendo en Docker**; en producción se cambia a Cloudflare R2 solo con el `.env` (ver [Almacenamiento de archivos](#almacenamiento-de-archivos-minio--r2)).

**Requisito:** tener **Docker Desktop** instalado y **abierto** (esperar a que indique "Engine running"). Se puede comprobar con:

```bash
docker info
```

Desde la raíz del repositorio:

```bash
docker compose up -d minio minio-init
```

- La primera vez descarga las imágenes y puede tardar unos minutos.
- `minio-init` crea los buckets y termina solo: en `docker compose ps -a` aparecerá como `Exited (0)`, y es lo correcto.

Verificar en `http://localhost:9001` (usuario `minioadmin`, contraseña `miniopassword`) que existen los buckets `eventos-public` y `eventos-private`.

| Servicio              | URL                     | Para qué sirve                                      |
| --------------------- | ----------------------- | --------------------------------------------------- |
| **MinIO (API S3)**    | `http://localhost:9000` | Donde se conecta el backend para guardar archivos   |
| **MinIO (consola)**   | `http://localhost:9001` | Interfaz web para ver los buckets y archivos        |

> **Opcional — PostgreSQL en Docker:** `docker-compose.yml` incluye también un servicio `postgres` (usuario/contraseña `postgres`, base `eventos`) en el puerto **5433**, para no chocar con un PostgreSQL instalado en el 5432. Se levanta con `docker compose up -d postgres`; en ese caso hay que poner `DB_PORT=5433` y `DB_PASSWORD=postgres` en `apps/backend/.env`. Si se sigue usando el PostgreSQL instalado en el sistema, este servicio no hace falta.

Para apagar o limpiar, ver [Comandos frecuentes](#7-comandos-frecuentes).

### 5. Aplicar las migraciones

```bash
bun run db:migrate
```

Crea o actualiza las tablas de la base de datos con las migraciones de `apps/backend/src/database/migrations`. Si no hay migraciones pendientes, TypeORM lo indica y no hace cambios. Para crear una migración nueva después de modificar una entidad (desde `apps/backend`):

```bash
cd apps/backend
bun run migration:generate src/database/migrations/NombreDelCambio
```

### 6. Levantar backend y frontend en modo desarrollo

**Opción A (recomendada): ambos servicios a la vez, en una sola terminal:**

```bash
bun run dev
```

Bun ejecuta en paralelo el script `dev` de cada aplicación y muestra la salida de ambas con el nombre del paquete como prefijo. Para detenerlos, `Ctrl+C`.

**Opción B: cada servicio en su propia terminal:**

```bash
bun run dev:backend
bun run dev:frontend
```

| Servicio                   | URL                           | Comportamiento en desarrollo                             |
| -------------------------- | ----------------------------- | -------------------------------------------------------- |
| **Backend (NestJS)** | `http://localhost:3000/api` | Se reinicia solo al guardar cambios (`bun --watch`)    |
| **Frontend (Vite)**  | `http://localhost:5173`     | Recarga instantánea (HMR); reenvía `/api` al backend |

### 7. Verificar que todo funciona

- En la terminal del backend debe aparecer `Nest application successfully started`.
- En la terminal del frontend debe aparecer `VITE ... ready` con la URL local.
- Abrir `http://localhost:5173` en el navegador: debe cargar la aplicación React.
- Abrir `http://localhost:3000/api`: una respuesta `404 Cannot GET /api` es correcta mientras no exista un controlador en esa ruta; confirma que el backend responde.
- Para comprobar tipos de TypeScript en el Frontend sin emitir archivos:
  ```bash
  bunx tsc -p apps/frontend/tsconfig.json --noEmit
  ```

---

## 7. Comandos frecuentes

| Comando                                              | Qué hace                                                                                                                 |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `bun install`                                      | Instala las dependencias de todos los paquetes (ejecutar en la raíz)                                                     |
| `bun run dev`                                      | Levanta backend y frontend en modo desarrollo                                                                             |
| `bun run dev:backend`                              | Levanta solo el backend                                                                                                   |
| `bun run dev:frontend`                             | Levanta solo el frontend                                                                                                  |
| `bun run build`                                    | Compila el backend y el frontend                                                                                          |
| `bunx tsc -p apps/frontend/tsconfig.json --noEmit` | Comprueba TypeScript en el frontend                                                                                       |
| `bun run db:migrate`                               | Aplica las migraciones pendientes                                                                                         |
| `bun run db:revert`                                | Revierte la última migración aplicada                                                                                   |
| `bun add <paquete>`                                | Agrega una dependencia; ejecutarlo dentro de `apps/backend`, `apps/frontend` o `packages/shared` según corresponda |
| `bun --bun run nest g resource <nombre>`           | Genera un módulo CRUD de Nest (ejecutar desde `apps/backend`)                                                          |
| `docker compose up -d minio minio-init` | Levanta el almacenamiento de archivos local (MinIO) y crea los buckets |
| `docker compose ps` | Muestra el estado de los contenedores de Docker |
| `docker compose stop` | Apaga los contenedores sin borrar los datos |
| `docker compose down` | Quita los contenedores (los archivos guardados se conservan en el volumen) |
| `docker compose down -v` | Quita los contenedores **y borra** todos los archivos guardados |

---

## 8. Problemas comunes

- **`ECONNREFUSED 127.0.0.1:5432` o `Unable to connect to the database`:** PostgreSQL no está activo o el puerto es otro. Repetir el paso 2 y revisar `DB_PORT`. El backend reintenta conectarse automáticamente.
- **`password authentication failed`:** La contraseña de `DB_PASSWORD` no coincide con la del usuario de PostgreSQL.
- **`database "eventos" does not exist`:** Falta crear la base de datos (paso 2) o el nombre en `DB_NAME` es distinto.
- **`EADDRINUSE` / puerto ocupado:** Otro proceso usa el `3000` o el `5173`. Cerrarlo o cambiar `PORT` en `.env` (backend) o `server.port` en `vite.config.ts` (frontend).
- **`node: command not found` al ejecutar una herramienta:** Ese comando intenta usar Node.js. Ejecutarlo con `bun --bun` o `bunx --bun` en lugar de instalar Node.
- **`docker compose` falla con `error during connect ... dockerDesktopLinuxEngine`:** Docker Desktop no está abierto o no terminó de arrancar. Abrirlo, esperar a que indique "Engine running" y confirmar con `docker info`.
- **`pull access denied for minio/minio` o `minio/mc`:** MinIO ya no publica imágenes en Docker Hub ni en quay.io. El proyecto usa `cgr.dev/chainguard/minio` y `amazon/aws-cli` (ya configuradas en `docker-compose.yml`); no cambiarlas por `minio/*`.
- **`port is already allocated` (9000, 9001 o 5433):** Otro programa usa ese puerto. Cerrarlo o cambiar el puerto de la izquierda en `docker-compose.yml` (si se cambia el 9000, actualizar también `S3_ENDPOINT` y `S3_PUBLIC_URL`).
- **`NoSuchBucket` al subir un archivo:** Los buckets no se crearon. Ejecutar `docker compose up minio-init` y revisar su salida.
- **`ECONNREFUSED 127.0.0.1:9000` al subir un archivo:** MinIO no está corriendo. Revisar con `docker compose ps` y levantarlo con `docker compose up -d minio minio-init`.
- **`AccessDenied` al abrir la URL de un documento privado:** La URL firmada expiró (dura 5 minutos por defecto) o se intentó abrir sin firma. Generar una nueva con `privateUrl(key)`.
- **Errores de dependencias tras un `git pull`:** Ejecutar `bun install` en la raíz.
