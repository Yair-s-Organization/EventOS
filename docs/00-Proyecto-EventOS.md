---
proyecto: "EventOS"
materia: "Análisis y Diseño de Sistemas"
profesor: "Idalia Maldonado Castillo"
equipo: "Sinergia Ágil"
grupo: "5CM3"
semestre: 5
repositorio: "/home/gameshark/Documents/EventOS"
tags:
  - proyecto
  - escuela
  - ads
  - eventos
---

# 🚀 Proyecto EventOS — Hub de Documentación (Sinergia Ágil)

> [!NOTE] Información General
> - **Materia:** [[00-Análisis y Diseño de Sistemas]] (5.º Semestre — Grupo `5CM3`)
> - **Profesora:** Idalia Maldonado Castillo
> - **Equipo:** Sinergia Ágil (12 integrantes divididos en Subequipos A, B y C)
> - **Repositorio Local:** `/home/gameshark/Documents/EventOS` (Symlink local: `.docs-ads/`)

---

## 🧭 Índice Modular de Documentación

1. 📋 **[[01-Requerimientos-y-Reglas-de-Negocio|Requerimientos y Reglas de Negocio]]**
   - `RF-01` a `RF-28` (Requerimientos Funcionales)
   - `RNF-01` a `RNF-27` (Requerimientos No Funcionales)
   - `RN-01` a `RN-45` (Reglas de Negocio críticas del dominio ESCOM/IPN)
2. 👥 **[[02-Actores-y-Catalogos|Actores, Diagramas y Catálogos Oficiales]]**
   - Perfiles de los 5 Actores (*Asistente, Organizador, Subdirección de Servicios Educativos, Personal de Logística, Administrador*)
   - Diagramas de Casos de Uso por actor
   - Catálogo de Pantallas (`UI0`, `UI01` – `UI32`), Mensajes de Error (`MSG-E-01` – `MSG-E-49`), Mensajes Informativos (`MSG-I-01` – `MSG-I-23`) y Mensajes de Pantalla (`MSG-P-01` – `MSG-P-07`)
3. 🗂️ **[[00-Indice-Casos-de-Uso|Índice de Casos de Uso (CU01 – CU37)]]**
   - 37 fichas individuales con precondiciones, postcondiciones, entradas, salidas, errores y trayectorias paso a paso (👤 Actor / ⚙️ Sistema).
4. 🎨 **[[04-Diseno-UI|Diseño de Interfaces de Usuario (Mockups UI)]]**
   - Diseños visuales de las pantallas principales de EventOS.
5. 📅 **[[05-Planeacion-y-Sprints|Planeación y Sprints (Scrum)]]**
   - División en Subequipos (`A`, `B`, `C`) y seguimiento de `Sprint 1` a `Sprint 10`.

---

## 1. Introducción

La gestión de eventos académicos dentro de instituciones educativas, como congresos, ferias de proyectos, hackathones y talleres, suele representar un reto logístico considerable cuando no existe un sistema que centralice su organización. En el caso de la **Escuela Superior de Cómputo (ESCOM)** del **Instituto Politécnico Nacional (IPN)**, la solicitud, aprobación y control de acceso a este tipo de eventos se realiza actualmente de forma manual, lo que dificulta verificar la disponibilidad de espacios como el **Auditorio**, **Sala 14** y los **Laboratorios de cómputo**, y puede derivar en conflictos de horario entre eventos y actividades académicas regulares.

Ante esta situación, el equipo **Sinergia Ágil** propone el desarrollo de **EventOS**, una plataforma web que permite automatizar y centralizar este proceso, cubriendo desde la solicitud del evento hasta la validación de acceso de los asistentes bajo la metodología ágil **Scrum**.

### 1.1. Descripción General del Proyecto
Plataforma web que permite a ESCOM gestionar de forma integral sus eventos académicos, congresos, ferias de proyectos, hackathones y talleres realizados en el Auditorio, Sala 14 y los laboratorios de cómputo de la escuela, cubriendo todo el ciclo de vida: desde la solicitud del evento hasta el control de acceso mediante código QR.

- **Solicitud de Eventos y Subeventos (`CU09`, `CU20`):** El interesado (Estudiante, Empresa o Externo verificado, o personal de Subdirección) solicita la creación de un evento indicando recinto y uno o más bloques de fecha y horario (subeventos de una misma solicitud). El personal de **Subdirección de Servicios Educativos** evalúa la solicitud (`CU04`, `CU05`) y decide si se autoriza según disponibilidad e impacto académico (las solicitudes de Subdirección se aprueban automáticamente conforme a `RN-13`).
- **Reserva, Boletos Directos y Acceso QR (`CU14`–`CU19`, `CU24`, `CU31`):** Los asistentes consultan la cartelera (`CU13`), reservan su lugar (incluyendo butaca específica o equipo de cómputo en laboratorio según `RN-03` y `RN-16`) y visualizan en la plataforma su boleto digital con código QR de un solo uso (`RN-11`), validado por el **Personal de Logística** (`CU24`). Las notificaciones de cancelación o reprogramación y los boletos directos se gestionan internamente dentro de la aplicación, sin depender de envíos por correo electrónico.
- **Administración y Verificación (`CU33`–`CU37`):** El **Administrador** gestiona el estado de las cuentas de usuario (`CU33`), el estado de verificación de Alumnos, Profesores y Empresas (`CU37`), el estado operativo y aforo de los espacios físicos (`CU34`), el inventario de equipos de cómputo de los laboratorios (`CU35`) y la bitácora histórica inmutable exportable en PDF (`CU36`).

### 1.2. Objetivo General
Desarrollar una plataforma web que facilite la gestión de eventos académicos en las instalaciones de ESCOM, agilizando su solicitud, aprobación y control de acceso.

---

## 2. Arquitectura Técnica del Monorepo (`EventOS`)

| Capa / Paquete | Ruta en Repo | Tecnologías Clave |
| :--- | :--- | :--- |
| **Runtime & Gestor** | Raíz (`/`) | `Bun` (Bun Workspaces Monorepo) |
| **Tipos Compartidos** | `packages/shared` | TypeScript (`enums`, `interfaces`, tipos de dominio `@eventos/shared`) |
| **Backend API** | `apps/backend` | `NestJS` + `TypeORM` + `PostgreSQL` + `MinIO / Cloudflare R2` (S3) |
| **Frontend Web** | `apps/frontend` | `React` + `Vite` + `TypeScript` |
| **Infraestructura Local** | `docker-compose.yml` | Contenedor `MinIO` (almacenamiento de imágenes/PDFs) + `PostgreSQL` |

---

## 3. Consulta Dinámica de Casos de Uso (Dataview)

```dataview
TABLE caso_de_uso AS "Código", nombre AS "Nombre", actor AS "Actor(es)"
FROM "01-Semestres/05-Quinto Semestre/Análisis y Diseño de Sistemas/Proyecto-EventOS/03-Casos-de-Uso"
WHERE caso_de_uso != null
SORT caso_de_uso ASC
```
