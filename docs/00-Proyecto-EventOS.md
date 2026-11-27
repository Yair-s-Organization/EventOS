---
proyecto: "EventOS"
materia: "Análisis y Diseño de Sistemas"
profesor: "Idalia Maldonado Castillo"
equipo: "Sinergia Ágil"
grupo: "5CM3"
semestre: "2026-1"
version: "2.1"
repositorio: "/home/gameshark/Documents/EventOS"
tags:
  - proyecto
  - escuela
  - ads
  - eventos
---

# Proyecto EventOS — Hub de Documentación v2.1 (Sinergia Ágil)

> [!NOTE] Información General
> - **Materia:** Análisis y Diseño de Sistemas (Semestre `2026-1` — Grupo `5CM3`)
> - **Profesora:** Idalia Maldonado Castillo
> - **Equipo:** Sinergia Ágil (12 integrantes divididos en Subequipos A, B y C)
> - **Versión:** `2.1` (Actualizada al cierre de Sprint 10 — Noviembre de 2026)

---

## Índice Modular de Documentación

1. **[Requerimientos y Reglas de Negocio](./01-Requerimientos-y-Reglas-de-Negocio.md)**
   - `RF-01` a `RF-28` (Requerimientos Funcionales)
   - `RNF-01` a `RNF-27` (Requerimientos No Funcionales)
   - `RN-01` a `RN-45` (Reglas de Negocio críticas del dominio ESCOM/IPN, aforos oficiales sin sobrecupo, invitaciones por subevento y matrices de transición)
2. **[Actores, Diagramas y Catálogos Oficiales](./02-Actores-y-Catalogos.md)**
   - Perfiles de los Actores (*Asistente, Organizador, Subdirección de Servicios Educativos, Personal de Logística, Administrador*)
   - Diagramas de Casos de Uso por actor
   - Catálogo normativo de 32 Pantallas oficiales (`UI01`–`UI32`), Mensajes de Error (`MSG-E-01`–`MSG-E-55`), Mensajes Informativos (`MSG-I-01`–`MSG-I-26`), Mensajes de Pantalla (`MSG-P-01`–`MSG-P-07`), plantillas de correo y Notas de Consolidación
3. **[Índice de Casos de Uso (`CU-01` – `CU-39`)](./03-Casos-de-Uso/00-Indice-Casos-de-Uso.md)**
   - 39 fichas individuales con resumen, tabla de atributos (Autor, Actor, Propósito, Entradas, Salidas, Precondiciones, Postcondiciones, Errores, Tipo) y trayectorias principal y alternativas paso a paso.
4. **[Diseño de Interfaces de Usuario (Guía de Estilo, Wireframes y Mockups)](./04-Diseno-UI.md)**
   - Guía de estilo oficial (`Merriweather`, paleta `#5F1B36` / `#1B585F` y tokens semánticos), correspondencia `Catálogo Oficial (UI01–UI32)` ↔ `Figma` / rutas en hosting y galería de **Wireframes**, **Mockups** y tooltips informativos.
5. **[Planeación y Sprints (Scrum)](./05-Planeacion-y-Sprints.md)**
   - División en Subequipos (`A`, `B`, `C`) y seguimiento de `Sprint 1` a `Sprint 10`.

---

## 1. Introducción

La gestión de eventos académicos dentro de instituciones educativas, como congresos, ferias de proyectos, hackathones y talleres, suele representar un reto logístico considerable cuando no existe un sistema que centralice su organización. En el caso de la **Escuela Superior de Cómputo (ESCOM)** del **Instituto Politécnico Nacional (IPN)**, la solicitud, aprobación y control de acceso a este tipo de eventos se realiza actualmente de forma manual, lo que dificulta verificar la disponibilidad de espacios como el **Auditorio Principal (242)**, **Sala 14 (100)** y los **Laboratorios de cómputo 2104–2107 (36 equipos para alumnos + 1 estación de docente)**, y puede derivar en conflictos de horario entre eventos y actividades académicas regulares.

Ante esta situación, el equipo **Sinergia Ágil** propone el desarrollo de **EventOS**, una plataforma web que permite automatizar y centralizar este proceso, cubriendo desde la solicitud del evento hasta la validación de acceso de los asistentes bajo la metodología ágil **Scrum**.

### 1.1. Descripción General del Proyecto (Versión 2.1)
Plataforma web que permite a ESCOM gestionar de forma integral sus eventos académicos, congresos, ferias de proyectos, hackathones y talleres realizados en el Auditorio Principal, Sala 14 y los laboratorios de cómputo de la escuela, cubriendo todo el ciclo de vida: desde la solicitud del evento hasta el control de acceso mediante código QR.

- **Cartelera y Detalles Universales (`CU-04`, `CU-05`):** Cualquier usuario o visitante puede explorar la cartelera pública (`UI04`) y visualizar los detalles de un evento (`UI05` y subvista `UI05.1`), diferenciando acciones según su rol y sesión (reservación con `returnUrl` y `MSG-I-24`, enlace privado compartible por token `/eventos/privado/:tokenSubEvento`, o acceso al control de acceso y escáner QR `UI17` / `UI19` para Personal de Logística).
- **Solicitud de Eventos, Candado de Identidad, Tooltips y Evaluación (`CU-06`, `CU-07`, `CU-11`, `CU-21`):** El interesado con identidad verificada (`MSG-E-54` -> `UI32`) o el personal de Subdirección solicita la creación de un evento indicando recinto, cupo máximo configurable cuando la modalidad lo permite (`<= aforo físico`), ayudas contextuales (`InfoTooltip`), póster almacenado en bucket público de Cloudflare R2 / MinIO y uno o más bloques de fecha y horario (`UI07`). El personal de **Subdirección de Servicios Educativos** evalúa la solicitud (`UI11`, `UI12`, modal de rechazo/solicitud de cambios en `UI12`) y dictamina su autorización según disponibilidad e impacto académico (las solicitudes de Subdirección se aprueban automáticamente conforme a `RN-13`).
- **Reserva, Modalidades de Acceso, Cupo Fijo Sin Sobrecupo e Invitaciones por Subevento (`CU-15`–`CU-20`, `CU-23`, `CU-25`, `CU-27`, `CU-30`):** Los asistentes reservan su lugar conforme a la modalidad del subevento (*Acceso libre*, *Registro simple sin QR*, *QR Admisión general* con resumen en `UI30`, o *QR con mapa de butacas en Auditorio* en `UI06` con retención temporal de asiento por 5 minutos), visualizan su boleto digital con código QR de un solo uso cuando aplica (`UI09`), y son validados por el **Personal de Logística** (`UI17`, `UI18`, `UI19`). Todos los recintos operan con **0% de sobrecupo sobre el límite físico** (`RN-07`), soportando cupo máximo configurable menor o igual al recinto por subevento; los eventos privados operan a nivel de `subEvento` con carga masiva por lotes/CSV y enlace compartible. Ante cambios de recinto, modalidad o reducción de cupo, se aplica la Matriz de Cambios de Recinto y el Flujo FIFO con notificaciones por correo.
- **Administración, Jefes de Área y Restablecimiento (`CU-33`–`CU-39`):** El **Administrador** registra jefes de área con correo `@ipn.mx` excluyendo `@alumno.ipn.mx` (`CU-33` en `UI24`), gestiona el estado de las cuentas de usuario (`CU-34` en `UI21`), el estado operativo y aforo de los espacios físicos (`CU-35` en `UI22`), el inventario de equipos de cómputo de los laboratorios (`CU-36` en `UI23`) y la bitácora histórica inmutable exportable en CSV (`CU-37` en `UI20`). Tanto Subdirección como el Administrador evalúan y auditan el estado de verificación de Alumnos, Profesores y Empresas (`UI10` listado y `UI31` detalle con expediente PDF firmado temporalmente en bucket privado, `CU-38`), y cualquier usuario con cuenta activa puede solicitar recuperación (`UI01`) y restablecer su contraseña olvidada (`CU-39` en `UI29`).

### 1.2. Objetivo General
Desarrollar una plataforma web que facilite la gestión de eventos académicos en las instalaciones de ESCOM, agilizando su solicitud, aprobación y control de acceso.

---

## 2. Arquitectura Técnica del Monorepo (`EventOS`)

| Capa / Paquete | Ruta en Repo | Tecnologías Clave |
| :--- | :--- | :--- |
| **Runtime & Gestor** | Raíz (`/`) | `Bun` (Bun Workspaces Monorepo) |
| **Tipos Compartidos** | `packages/shared` | TypeScript (`enums`, `interfaces`, tipos de dominio `@eventos/shared`) |
| **Backend API** | `apps/backend` | `NestJS` + `TypeORM` + `PostgreSQL 18` + `Helmet` + `JWT (sesión única)` + `MinIO / Cloudflare R2` (S3 público/privado) |
| **Frontend Web** | `apps/frontend` | `React` + `Vite` + `TypeScript` |
| **Infraestructura Local** | `docker-compose.yml` | Contenedor `MinIO` (almacenamiento de pósteres públicos y constancias privadas) + `PostgreSQL` |

