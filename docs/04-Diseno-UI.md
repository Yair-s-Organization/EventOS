---
proyecto: "EventOS"
materia: "Análisis y Diseño de Sistemas"
version: "2.1"
figma_file: "16hWE2vpbC6m8HG15tL2V1"
tags:
  - apunte
  - escuela
  - ads
  - eventos
  - diseno-ui
  - wireframes
  - mockups
---

# Diseño de Interfaces de Usuario (Guía de Estilo, Wireframes y Mockups) — EventOS

> [!NOTE] Fuente Oficial de Diseño (Figma)
> - **Archivo Figma:** [DISEÑO-ADS (`16hWE2vpbC6m8HG15tL2V1`)](https://www.figma.com/design/16hWE2vpbC6m8HG15tL2V1/DISE%C3%91O-ADS)
> - **Lienzos incluidos:** `GUIAS DE ESTILO`, `WIREFRAME` (baja/media fidelidad) y `MOCKUPS` (alta fidelidad Desktop `1512×982` y Móvil `430×932`).
> - **Navegación:** [Hub del Proyecto](./00-Proyecto-EventOS.md) | [Catálogo de Pantallas (`UI01`–`UI32`)](./02-Actores-y-Catalogos.md#3-catalogo-oficial-de-pantallas-ui01--ui32) | [Casos de Uso (`CU-01`–`CU-39`)](./03-Casos-de-Uso/00-Indice-Casos-de-Uso.md)

---

## 1. Guía de Estilo y Sistema de Diseño (`GUIAS DE ESTILO`)

![Guía de Estilo General EventOS](./assets/figma/style-guide-general.png)

### 1.1. Escala Tipográfica (`Merriweather`)
Toda la interfaz utiliza la familia tipográfica **Merriweather**, respetando la jerarquía semántica y de accesibilidad (un único `H1` por pantalla):

| Nivel / Token | Fuente y Peso | Tamaño | Reglas de Uso en Interfaz |
| :--- | :--- | :---: | :--- |
| **`H1` — Títulos Principales** | `Merriweather Bold` | `36 px` | Exclusivo para el título principal de cada pantalla y el logotipo tipográfico `"Event-Os"` en el `Navbar`. Solo debe existir un `H1` por vista. |
| **`H2` — Subtítulos de Sección** | `Merriweather SemiBold` | `24 px` | Encabezados de bloques o secciones internas con énfasis visual (ej. secciones dentro de *Detalles del evento* o paneles de métricas). |
| **`H3` — Tarjetas y Formularios** | `Merriweather Medium` | `20 px` | Títulos principales dentro de tarjetas de eventos/recintos, etiquetas de campos en formularios (`Nombre:`, `Ocupación:`) y avisos de estado vacío (`Sin eventos asignados`). |
| **`Cuerpo` — Texto General** | `Merriweather Regular` | `16 px` | Descripciones extensas, trayectoria de ponentes, justificaciones de beneficio politécnico, celdas de tablas y controles de filtrado. |
| **`Botones` — Acciones** | `Merriweather Bold` | `16 px` | Texto interno de botones primarios, secundarios y semánticos. |
| **`Nota` — Metadatos** | `Merriweather Regular` | `12 px` | Textos auxiliares, leyendas de ayuda, contadores y metadatos secundarios. |

### 1.2. Paleta de Colores Institucional y Semántica

| Token / Rol | Hex | Uso en Componentes |
| :--- | :---: | :--- |
| **Primario Institucional (Guinda IPN)** | `#5F1B36` | `BtnPrimario` (acciones principales como *Reservar lugar*, *Siguiente*), barra de navegación y acentos principales. |
| **Secundario Institucional (Azul Petróleo ESCOM)** | `#1B585F` | Bordes de `InputText` y `Selector` (`2 px` sólido interior, `border-radius: 6 px`), texto de énfasis secundario e iconos. |
| **Superficie Cálida (Guinda Claro)** | `#EDD5D6` | Fondos suaves de tarjetas destacadas, cabeceras de tabla y contenedores secundarios. |
| **Superficie Fría (Petróleo Claro)** | `#B7D6D9` | Badges informativos, resaltados secundarios y estados seleccionados en mapas/tablas. |
| **Superficie Neutra** | `#E9E9E9` | Fondos de página, divisores y contenedores inactivos. |
| **Base / Relleno de Controles** | `#FFFFFF` | Fondo de formularios, modales y relleno de campos `InputText`. |
| **Semántico — Éxito (`BtnExito`)** | `#338315` | Aprobar solicitud en Subdirección, confirmar guardado exitoso y pantalla móvil `"Acceso Válido"` en escáner QR. |
| **Semántico — Error / Destructivo (`BtnError`)** | `#AD3343` | Cancelar evento/asistencia, rechazar solicitud, eliminar registros y pantalla `"Acceso Denegado"` (QR inválido o duplicado). |
| **Semántico — Advertencia (`BtnAdvertencia`)** | `#CDCD36` | Indicadores de recinto/equipo en `"Mantenimiento"` y modales de precaución antes de descartar cambios. |

### 1.3. Resoluciones y Lineamientos de Componentes
- **Desktop:** Lienzo base `1512 × 982 px` (MacBook Pro 14"), extensible verticalmente (`1205 px` – `2005 px`) en formularios multi-actividad y paneles extensos.
- **Móvil Responsivo:** Lienzo `430 × 932 px` (priorizado para consulta de reservas `UI08`, boleto digital `UI09`, eventos asignados `UI18` y escáner QR `UI19`).
- **Iconografía:** Librería NextIcons (`https://www.nexticons.com/icons`) y Bootstrap Icons (`bi:*`).

---

## 2. Correspondencia entre Catálogo Oficial (`v2.1`) y Lienzos de Figma y Aplicación

El Catálogo Oficial de EventOS consta de **32 pantallas oficiales (`UI01` a `UI32`)** en correspondencia con Figma, las rutas de React y los 39 Casos de Uso del sistema:

| ID Oficial (`v2.1`) | Nombre Oficial (`v2.1`) | Etiqueta / Alcance en Figma y Aplicación | Wireframe | Mockup |
| :---: | :--- | :--- | :---: | :---: |
| `UI01` | Pantalla de Inicio de Sesión | `UI01 Pantalla de Inicio de Sesión` *(incluye `/recuperar-contrasena`)* | Sí | Sí |
| `UI02` | Pantalla de Registro de Usuario | `UI02 Pantalla de Registro de Usuario` *(incluye `/confirmar-registro` y activación logística `/activar-logistica`)* | Sí | Sí |
| `UI03` | Menú Principal del Asistente | `UI03 Menú principal del asistente` | Sí | Sí |
| `UI04` | Cartelera de Eventos | `UI04 Cartelera de Eventos (En todos sus casos)` | Sí | Sí |
| `UI05` | Detalles del Evento (+ subvista `UI05.1`) | `UI05 Detalles del evento` y `UI05.1 Detalles del subevento` *(+ enlace privado `/eventos/privado/:tokenSubEvento`)* | Sí | Sí |
| `UI06` | Mapa de Asientos y Disponibilidad del Recinto | `UI06 Mapa de Asientos y Disponibilidad del recinto` *(retención temporal 5 min)* | Sí | Sí |
| `UI07` | Formulario de Solicitud de Evento | `UI07 Formulario de Solicitud de Evento` (único/multi-actividad, cupo configurable `RN-07` y tooltips) | Sí | Sí |
| `UI08` | Consultar sus Eventos (Reservas del Asistente o Mis Boletos) | `UI08 Consultar sus Eventos (Reservas del asistente)` (Desktop y Móvil) | Sí | Sí |
| `UI09` | Boleto Digital y Código QR | `UI09 Boleto Digital y Código QR` (Auditorio, Sala 14, Laboratorios y Móvil) | Sí | Sí |
| `UI10` | Visualización de Verificación de Usuario por Subdirección (Solicitudes de Verificación de Cuentas) | Bandeja `/subdireccion/verificaciones` (`CU-38`) | — | Sí |
| `UI11` | Panel de Solicitudes Pendientes | `UI11 Panel de Solicitudes Pendientes (Subdirección)` | Sí | Sí |
| `UI12` | Detalles del Evento para Evaluación | `UI12 Detalles de Evento para evaluación (Subdirección)` *(+ modal cambios y comparador)* | Sí | Sí |
| `UI13` | Panel de Eventos Aprobados | `UI13 Panel de Eventos Aprobados (Subdirección)` | Sí | Sí |
| `UI14` | Panel Consultar Mis Eventos | `UI14 Panel Consultar Mis Eventos (Organizador)` | Sí | Sí |
| `UI15` | Administración y Detalles del Evento (Único y Multi-actividad) | `UI15 Administración y Detalles de mi evento` (Único y Multi-actividad) | — | Sí |
| `UI16` | Formulario de Modificación de Evento | `UI16 Formulario de Modificación` (Único y Multi-actividad; incluye ponentes, requerimientos lab, invitados privados y cupo) | Sí | Sí |
| `UI17` | Control de Acceso | Gestión de acceso por subevento para Logística (`/control-acceso/:idSubEvento`) | — | Sí |
| `UI18` | Panel de Eventos Asignados *(Logística)* | `UI18 Panel de Eventos Asignados (Logística)` (Desktop y Móvil) | Sí | Sí |
| `UI19` | Pantalla de Escáner QR | `UI19 Pantalla de Escáner QR` + `Acceso Válido` / `Acceso Denegado` | Sí | Sí |
| `UI20` | Bitácora Histórica de Eventos / del Sistema | `UI20 Bitácora histórica de eventos / del sistema` *(exportación CSV)* | Sí | Sí |
| `UI21` | Gestión de Cuentas de Usuario | `UI21 Gestión de cuentas de usuario` | Sí | Sí |
| `UI22` | Panel de Gestión de Espacios Físicos | `UI22 Panel de Gestión de Espacios Físicos` (`242` / `100` / `36+1`) | Sí | Sí |
| `UI23` | Gestión de Equipos de Laboratorio | `UI23 Gestión de equipos de laboratorio` | Sí | Sí |
| `UI24` | Asignar Jefes de Departamento | `Asignar Jefes de departamento` *(antes `UI34`, solo `@ipn.mx`)* | — | Sí |
| `UI25` | Menú Principal de Subdirección | `UI25 Menú principal de Subdirección` | — | Sí |
| `UI26` | Menú Principal de Administración | `UI26 Menú Principal de Administración` | — | Sí |
| `UI27` | Agregar Personal de Logística | `UI27 Agregar personal de logística` (+ modal registrar usuario con token 48 h) | Sí | Sí |
| `UI28` | Perfil de Usuario | `UI28 Perfil` | Sí | Sí |
| `UI29` | Restablecer Contraseña | Pantalla de restablecimiento de contraseña (`CU-39`, antes `UI35`) | — | — |
| `UI30` | Reservar Lugar (Resumen de la Reservación) | Confirmación de reserva sin mapa (`Registro simple` / `QR Admisión general`) | — | — |
| `UI31` | Visualización de Verificación de Usuario por Subdirección (Detalle de Solicitud) | Detalle `/subdireccion/verificaciones/:id` *(PDF por URL firmada R2, antes listado+detalle)* | — | Sí |
| `UI32` | Solicitud de Verificación de Cuenta | `UI32 Verificación` (Estudiante, Profesor, Empresa, Externo; PDF `<= 5 MB` en R2) | Sí | Sí |

---

## 3. Pantallas Universales (`Todos los Actores`)

### 3.1. `UI01` — Pantalla de Inicio de Sesión (`CU-01`, solicitud `CU-39`)
Autenticación con correo, contraseña, sesión única JWT (`RNF-09`), validación anti-bots y enlace hacia recuperación de contraseña (`/recuperar-contrasena`).

**Wireframe (`UI01`):**
![Wireframe UI01 Inicio de Sesión](./assets/figma/wireframes/wf-ui01-login.png)

**Mockup de Alta Fidelidad (`UI01`):**
![Mockup UI01 Inicio de Sesión](./assets/figma/mockups/mk-ui01-login.png)

---

### 3.2. `UI04` — Cartelera de Eventos (`CU-04`)
Exploración pública y filtrada por fecha, recinto, categoría o ponente, diferenciando sesión sin cuenta y sesión de asistente.

**Wireframe (`UI04`):**
![Wireframe UI04 Cartelera de Eventos](./assets/figma/wireframes/wf-ui04-cartelera.png)

**Mockup — Vista Pública sin Cuenta (`UI04`):**
![Mockup UI04 Cartelera Pública](./assets/figma/mockups/mk-ui04-cartelera-publica.png)

**Mockup — Vista Autenticada para Asistente (`UI04`):**
![Mockup UI04 Cartelera Asistente](./assets/figma/mockups/mk-ui04-cartelera-asistente.png)

---

### 3.3. `UI05` y `UI05.1` — Detalles del Evento y Detalles del Subevento (`CU-05`)
Soporta eventos de una sola sesión, eventos en laboratorios (acceso sin mapa de butacas), eventos compuestos por múltiples actividades (`UI05.1`) y entrada directa por enlace compartible privado (`/eventos/privado/:tokenSubEvento`).

**Wireframe — Evento General y Multi-actividad (`UI05`):**
![Wireframe UI05 Detalles del Evento](./assets/figma/wireframes/wf-ui05-detalles-evento.png)

![Wireframe UI05 Evento con Varias Actividades](./assets/figma/wireframes/wf-ui05-multiactividad.png)

**Mockups — Evento General, Laboratorio, Multi-actividad y Subevento (`UI05` / `UI05.1`):**
![Mockup UI05 Detalles del Evento](./assets/figma/mockups/mk-ui05-detalles-evento.png)

![Mockup UI05 Evento en Laboratorio](./assets/figma/mockups/mk-ui05-laboratorio.png)

![Mockup UI05 Evento con Varias Actividades](./assets/figma/mockups/mk-ui05-multiactividad.png)

![Mockup UI05.1 Detalles del Subevento](./assets/figma/mockups/mk-ui05-1-subevento.png)

---

### 3.4. `UI28` — Visualizar Perfil de Usuario (`CU-02`)
*(Etiquetada como `UI28 Perfil` en Figma).* Muestra los datos de la cuenta, rol institucional/externo y acceso al estado de verificación de identidad.

**Wireframe (`UI28`):**
![Wireframe UI28 Perfil de Usuario](./assets/figma/wireframes/wf-ui27-perfil.png)

**Mockup (`UI28`):**
![Mockup UI28 Perfil de Usuario](./assets/figma/mockups/mk-ui27-perfil.png)

---

### 3.5. `UI29` — Restablecer Contraseña (`CU-39`)
*(Antes `UI35`).* Permite a cualquier usuario restablecer su contraseña de acceso tras recibir un enlace con token temporal de seguridad enviado desde `/recuperar-contrasena` (`UI01`). Solicita la nueva contraseña, su confirmación y valida las reglas de complejidad, notificando el éxito con `MSG-I-08` y retornando a `UI01`.

---

## 4. Pantallas del Actor Asistente

### 4.1. `UI02` — Pantalla de Registro de Usuario (`CU-13`, `CU-12`, `CU-32`)
Incluye el registro de nueva cuenta, confirmación de correo (`/confirmar-registro`) y la activación de credenciales de Personal de Logística mediante enlace temporal de 48 horas (`/activar-logistica`, consolidado en `UI02`).

**Wireframe (`UI02`):**
![Wireframe UI02 Registro de Usuario](./assets/figma/wireframes/wf-ui02-registro.png)

**Mockup (`UI02`):**
![Mockup UI02 Registro de Usuario](./assets/figma/mockups/mk-ui02-registro.png)

**Subflujo de Activación por Token para Logística (`/activar-logistica`, antes `UI24`):**
![Wireframe Activación por Token](./assets/figma/wireframes/wf-ui23-activacion-token.png)

![Mockup Activación por Token](./assets/figma/mockups/mk-ui23-activacion-token.png)

---

### 4.2. `UI03` — Menú Principal del Asistente (`CU-03`, `CU-04`, `CU-18`)
Resumen de próximos eventos agendados y accesos directos a cartelera, reservas y solicitud de eventos.

**Wireframe (`UI03`):**
![Wireframe UI03 Menú Principal Asistente](./assets/figma/wireframes/wf-ui03-menu-asistente.png)

**Mockup (`UI03`):**
![Mockup UI03 Menú Principal Asistente](./assets/figma/mockups/mk-ui03-menu-asistente.png)

---

### 4.3. `UI06` — Mapa de Asientos y Disponibilidad del Recinto (`CU-15`, `CU-16`)
Selección interactiva de butaca en Auditorio (`242` asientos fijos) con **retención temporal de 5 minutos** (`retencionAsiento`) antes de confirmar la reserva (`MSG-I-16`).

**Wireframe (`UI06`):**
![Wireframe UI06 Mapa de Asientos](./assets/figma/wireframes/wf-ui06-mapa-asientos.png)

**Mockups — Selección de Asiento y Confirmación (`UI06`):**
![Mockup UI06 Mapa de Asientos](./assets/figma/mockups/mk-ui06-mapa-asientos.png)

![Mockup UI06 Reserva Confirmada](./assets/figma/mockups/mk-ui06-reserva-confirmada.png)

---

### 4.4. `UI07` — Formulario de Solicitud de Evento (`CU-21`, `CU-11`)
Incluye carga de póster en bucket público de Cloudflare R2 (`2048×1152`), captura de beneficio politécnico, tarjetas de subevento/actividad con **cupo máximo configurable sin sobrecupo** (`RN-07`), *tooltips* contextuales de ayuda (`InfoTooltip` / `ModalidadAccesoHelp`), selección de requerimientos técnicos de laboratorio (`CU-28`), motivo de urgencia obligatorio en antelación menor a 7 días para Asistente (omitido en Subdirección conforme a `RN-13` y `RN-14`) y candado por falta de verificación de identidad (`MSG-E-54` -> `UI32`).

**Wireframe (`UI07`):**
![Wireframe UI07 Solicitar Evento](./assets/figma/wireframes/wf-ui07-solicitar-evento.png)

**Mockup — Formulario General del Solicitante (`UI07`):**
![Mockup UI07 Solicitar Evento](./assets/figma/mockups/mk-ui07-solicitar-evento.png)

**Mockup — Adición de Tarjetas de Subevento (`UI07`):**
![Mockup UI07 Subeventos](./assets/figma/mockups/mk-ui07-subeventos.png)

**Mockup — Bloqueo por Falta de Verificación de Identidad (`UI07` / `MSG-E-54` -> `UI32`):**
![Mockup UI07 Bloqueo por Verificación](./assets/figma/mockups/mk-ui07-bloqueo-verificacion.png)

**Mockup — Variante Subdirección y Jefes de Academia (`UI07` / `CU-11`):**
![Mockup UI07 Subdirección](./assets/figma/mockups/mk-ui07-subdireccion.png)

---

### 4.5. `UI08` — Consultar sus Eventos (Reservas del Asistente o Mis Boletos) (`CU-18`, `CU-19`, `CU-14`)
Visualización de reservas activas (`Activo` / `Ingresado`) e historial de participación (`CU-14`), acceso al boleto digital y cancelación de asistencia en Desktop y Móvil.

**Wireframe (`UI08`):**
![Wireframe UI08 Consultar Mis Eventos](./assets/figma/wireframes/wf-ui08-mis-eventos.png)

**Mockup Desktop (`UI08`):**
![Mockup UI08 Consultar Mis Eventos Desktop](./assets/figma/mockups/mk-ui08-mis-eventos.png)

**Mockup Móvil (`UI08`):**
![Mockup UI08 Consultar Mis Eventos Móvil](./assets/figma/mockups/mk-ui08-mis-eventos-movil.png)

*(Wireframes históricos de consulta de participación previa `CU-14`, consolidados en `UI08` sin pantalla independiente):*
![Wireframe Historial Asistente](./assets/figma/wireframes/wf-ui10-bitacora-asistente.png)

![Wireframe Filtros de Historial](./assets/figma/wireframes/wf-ui10-bitacora-filtros.png)

---

### 4.6. `UI09` — Boleto Digital y Código QR (`CU-17`, `CU-20`)
Boleto digital firmado criptográficamente en variantes Auditorio, Sala 14, Laboratorios y vista Móvil.

**Wireframe (`UI09`):**
![Wireframe UI09 Boleto Digital QR](./assets/figma/wireframes/wf-ui09-boleto-qr.png)

**Mockups — Auditorio, Sala 14, Laboratorio y Móvil (`UI09`):**
![Mockup UI09 Boleto Auditorio](./assets/figma/mockups/mk-ui09-boleto-qr.png)

![Mockup UI09 Boleto Laboratorio](./assets/figma/mockups/mk-ui09-boleto-laboratorio.png)

![Mockup UI09 Boleto Móvil](./assets/figma/mockups/mk-ui09-boleto-movil.png)

---

### 4.7. `UI30` — Reservar Lugar — Resumen de la Reservación (`CU-15`, `CU-16`)
Pantalla de confirmación nominal para subeventos bajo modalidad *Registro simple sin QR* o *QR Admisión general* (Auditorio, Sala 14 y Laboratorios), mostrando disponibilidad efectiva (`min(cupoMaximo, aforoActualRecinto)`) antes de confirmar la inscripción.

---

### 4.8. `UI32` — Solicitud de Verificación de Cuenta / Identidad (`CU-21`, `CU-38`)
*(Etiquetada como `UI32 Verificacion` en Figma).* Acreditación trimestral adjuntando comprobante probatorio en PDF (máx. `5 MB`, almacenado en bucket privado de Cloudflare R2) según tipo de perfil (*Estudiante*, *Profesor*, *Empresa* o *Externo*).

**Wireframe (`UI32`):**
![Wireframe UI32 Verificación de Identidad](./assets/figma/wireframes/wf-ui24-verificacion-identidad.png)

**Mockup — Perfil Estudiante (`UI32`):**
![Mockup UI32 Verificación Estudiante](./assets/figma/mockups/mk-ui24-verificacion-estudiante.png)

**Mockup — Perfil Empresa (`UI32`):**
![Mockup UI32 Verificación Empresa](./assets/figma/mockups/mk-ui24-verificacion-empresa.png)

---

## 5. Pantallas de Subdirección de Servicios Educativos

### 5.1. `UI25` — Menú Principal de Subdirección (`CU-06`, `CU-08`, `CU-11`, `CU-38`)
*(Etiquetada como `UI25 Menú principal del subdirección` en Figma).* Presenta indicadores rápidos (*Solicitudes pendientes*, *Eventos del mes*, *Cuentas por verificar*), la agenda del día por recinto y solicitudes recientes.

**Mockup (`UI25`):**
![Mockup UI25 Menú Principal Subdirección](./assets/figma/mockups/mk-ui36-menu-subdireccion.png)

---

### 5.2. `UI10` — Visualización de Verificación de Usuario por Subdirección (Solicitudes de Verificación de Cuentas) (`CU-38`)
Bandeja compartida con el Administrador (`/subdireccion/verificaciones`) para listar las solicitudes pendientes de validación de identidad (*Alumno*, *Profesor*, *Empresa*) antes de abrir su expediente individual (`UI31`).

**Mockup — Listado de Solicitudes de Verificación (`UI10`):**
![Mockup UI10 Listado de Verificación](./assets/figma/mockups/mk-ui30-verificacion-listado.png)

---

### 5.3. `UI11` — Panel de Solicitudes Pendientes (`CU-06`)

**Wireframe (`UI11`):**
![Wireframe UI11 Solicitudes Pendientes](./assets/figma/wireframes/wf-ui11-solicitudes-pendientes.png)

**Mockup (`UI11`):**
![Mockup UI11 Solicitudes Pendientes](./assets/figma/mockups/mk-ui11-solicitudes-pendientes.png)

---

### 5.4. `UI12` — Detalles del Evento para Evaluación y Dictamen (`CU-07`)
Revisión integral del evento y sus subeventos (incluyendo tooltips de modalidad/cupo, comparador de modificaciones logísticas e indicador de urgencia) para aprobar (`MSG-P-03`), rechazar (`MSG-P-04`) o solicitar cambios a través de su modal de dictamen integrado como subcomponente operativo.

**Wireframe (`UI12`):**
![Wireframe UI12 Evaluación de Evento](./assets/figma/wireframes/wf-ui12-evaluacion-evento.png)

**Mockups — Vista de Evaluación y Modal de Dictamen (`UI12`):**
![Mockup UI12 Evaluación de Evento](./assets/figma/mockups/mk-ui12-evaluacion-evento.png)

![Mockup UI12 Modal de Dictamen](./assets/figma/mockups/mk-ui12-modal-dictamen.png)

---

### 5.5. `UI13` — Panel de Eventos Aprobados (`CU-08`, `CU-09`)

**Wireframe (`UI13`):**
![Wireframe UI13 Eventos Aprobados](./assets/figma/wireframes/wf-ui13-eventos-aprobados.png)

**Mockup (`UI13`):**
![Mockup UI13 Eventos Aprobados](./assets/figma/mockups/mk-ui13-eventos-aprobados.png)

---

### 5.6. `UI31` — Visualización de Verificación de Usuario por Subdirección (Detalle de Solicitud) (`CU-38`)
*(Ruta `/subdireccion/verificaciones/:id`, compartida entre Subdirección y Administrador).* Permite inspeccionar los datos del solicitante y visualizar su constancia PDF almacenada en Cloudflare R2 privado mediante una URL firmada temporal (`600 s`) para emitir el dictamen correspondiente.

**Mockup — Evaluación de Expediente y Documento Probatorio (`UI31`):**
![Mockup UI31 Detalle de Verificación](./assets/figma/mockups/mk-ui30-verificacion-detalle.png)

---

## 6. Pantallas del Actor Organizador

### 6.1. `UI14` — Panel Consultar Mis Eventos (`CU-24`)

**Wireframe (`UI14`):**
![Wireframe UI14 Mis Eventos Organizador](./assets/figma/wireframes/wf-ui14-mis-eventos-org.png)

**Mockup (`UI14`):**
![Mockup UI14 Mis Eventos Organizador](./assets/figma/mockups/mk-ui14-mis-eventos-org.png)

---

### 6.2. `UI15` — Administración y Detalles del Evento (Único y Multi-actividad) (`CU-24`, `CU-26`, `CU-28`, `CU-29`)
Vista consolidada del organizador con datos logísticos por subevento, cupo configurable (`min(cupoMaximo, aforoRecinto)`), beneficio politécnico, ponentes, personal de logística (`X/10`), modal de equipos de laboratorio (`CU-28`) y acceso al padrón de invitados por subevento en eventos privados.

**Mockup — Evento Único (`UI15`):**
![Mockup UI15 Administración de Evento](./assets/figma/mockups/mk-ui15-admin-evento.png)

**Mockup — Evento Multi-actividad (`UI15`):**
![Mockup UI15 Evento Multi-actividad](./assets/figma/mockups/mk-ui15-admin-multiactividad.png)

**Mockup — Evento Privado con Lista de Invitados (`UI15`):**
![Mockup UI15 Evento Privado](./assets/figma/mockups/mk-ui15-admin-privado.png)

---

### 6.3. `UI16` — Formulario de Modificación de Evento (Único y Multi-actividad) (`CU-25`, `CU-27`, `CU-10`, `CU-28`, `CU-30`)
Permite editar parámetros menores (guardado directo: `"Cambios realizados con éxito"`) y parámetros logísticos mayores (solicitud de revisión: `"Cambios solicitados con éxito"`), ajustar `cupoMaximo` sin sobrecupo (`RN-07`), consultar *tooltips* (`InfoTooltip`/`ModalidadAccesoHelp`), gestionar actividades/subeventos, requerimientos técnicos de laboratorio (`CU-28`), ponentes (`CU-10`) y administrar invitados privados **por subevento** (alta individual, carga masiva por lotes/CSV con reporte de resultados, enlace compartible `/eventos/privado/:tokenSubEvento` y *cooldown* de 8 horas, `RN-05`, `RN-29`).

**Wireframe (`UI16`):**
![Wireframe UI16 Modificar Evento](./assets/figma/wireframes/wf-ui16-modificar-evento.png)

**Mockup — Edición de Evento Único (`UI16`):**
![Mockup UI16 Modificar Evento](./assets/figma/mockups/mk-ui16-modificar-evento.png)

**Mockup — Edición de Evento Multi-actividad (`UI16`):**
![Mockup UI16 Modificar Multi-actividad](./assets/figma/mockups/mk-ui16-modificar-multiactividad.png)

**Mockup — Edición de Evento Privado e Invitaciones con Cooldown de 8h (`UI16`):**
![Mockup UI16 Modificar Evento Privado](./assets/figma/mockups/mk-ui16-modificar-privado.png)

**Subcomponente Integrado — Requerimientos Técnicos de Laboratorio (`CU-28`, dentro de `UI07`/`UI15`/`UI16`):**
![Mockup Modal Requerimientos Técnicos Laboratorio](./assets/figma/mockups/mk-organizador-requerimientos-lab.png)

---

### 6.4. `UI27` — Agregar Personal de Logística (`CU-12`, `CU-31`, `CU-32`)
*(Etiquetada bajo el flujo `UI27` en Figma).* Búsqueda por correo o selección de usuario con tope estricto de 10 integrantes (`MSG-E-50`) y modal de registro con invitación por token de 48 horas (`/activar-logistica` en `UI02`) cuando el colaborador aún no existe en la plataforma.

**Wireframe (`UI27`):**
![Wireframe UI27 Agregar Personal de Logística](./assets/figma/wireframes/wf-ui26-agregar-logistica.png)

**Mockup — Asignación de Personal de Logística (`UI27`):**
![Mockup UI27 Agregar Personal de Logística](./assets/figma/mockups/mk-ui26-agregar-logistica.png)

**Mockup — Modal para Registrar Nuevo Personal de Logística (`UI27`):**
![Mockup UI27 Modal Registrar Personal de Logística](./assets/figma/mockups/mk-ui32-modal-registrar-logistica.png)

---

## 7. Pantallas del Personal de Logística

### 7.1. `UI18` — Panel de Eventos Asignados (`CU-22`)
*(Etiquetada como `UI18 Panel de Eventos Asignados (Logística)` en Figma).* Disponible en versión Desktop y Móvil para el personal de logística.

**Wireframe (`UI18`):**
![Wireframe UI18 Eventos Asignados Logística](./assets/figma/wireframes/wf-ui17-eventos-logistica.png)

**Mockup Desktop (`UI18`):**
![Mockup UI18 Eventos Asignados Desktop](./assets/figma/mockups/mk-ui17-eventos-logistica.png)

**Mockup Móvil (`UI18`):**
![Mockup UI18 Eventos Asignados Móvil](./assets/figma/mockups/mk-ui17-eventos-logistica-movil.png)

---

### 7.2. `UI17` — Control de Acceso (`/control-acceso/:idSubEvento`) (`CU-22`, `CU-23`)
Panel operativo por subevento donde el personal de logística consulta el padrón de asistentes inscritos/confirmados y accede al módulo de escaneo QR o validación de ingreso según la modalidad del subevento.

---

### 7.3. `UI19` — Pantalla de Escáner QR y Validación de Acceso (`CU-23`)
*(Etiquetada como `UI19 Pantalla de Escáner QR` en Figma).* Lectura de cámara en navegador y retroalimentación cromática inmediata (`Acceso Válido` `MSG-I-19` vs. `Acceso Denegado` `MSG-E-22` / `MSG-E-23`).

**Wireframe (`UI19`):**
![Wireframe UI19 Escáner QR](./assets/figma/wireframes/wf-ui18-escaner-qr.png)

**Mockup Desktop (`UI19`):**
![Mockup UI19 Escáner QR Desktop](./assets/figma/mockups/mk-ui18-escaner-qr.png)

**Mockups Móviles — Escáner, Acceso Válido y Acceso Denegado (`UI19`):**
![Mockup UI19 Escáner Móvil](./assets/figma/mockups/mk-ui18-escaner-movil.png)

![Mockup UI19 Acceso Válido](./assets/figma/mockups/mk-ui18-acceso-valido.png)

![Mockup UI19 Acceso Denegado](./assets/figma/mockups/mk-ui18-acceso-denegado.png)

---

## 8. Pantallas del Actor Administrador

### 8.1. `UI20` — Bitácora Histórica del Sistema (`CU-37`)
*(Etiquetada como `UI20 Bitácora histórica` en Figma).* Consulta cronológica inmutable con filtrado y exportación en formato **CSV (`.csv`)**. *(El segundo mockup muestra la referencia visual previa del botón de exportación).*

**Wireframe (`UI20`):**
![Wireframe UI20 Bitácora Histórica](./assets/figma/wireframes/wf-ui19-bitacora-historica.png)

**Mockups — Consulta y Referencia Visual de Exportación (`UI20`):**
![Mockup UI20 Bitácora Histórica](./assets/figma/mockups/mk-ui19-bitacora-historica.png)

![Mockup Referencia Exportación Bitácora](./assets/figma/mockups/mk-ui19-exportar-pdf.png)

---

### 8.2. `UI21` — Gestión de Cuentas de Usuario (`CU-34`)
*(Etiquetada como `UI21 Gestión de cuentas` en Figma).* Directorio de usuarios con filtros y cambio de estatus mediante borrado lógico (`Activo` / `Inactivo`, `MSG-P-05`).

**Wireframe (`UI21`):**
![Wireframe UI21 Gestión de Cuentas](./assets/figma/wireframes/wf-ui20-gestion-cuentas.png)

**Mockups — Listado y Confirmación de Inhabilitación (`UI21`):**
![Mockup UI21 Gestión de Cuentas](./assets/figma/mockups/mk-ui20-gestion-cuentas.png)

![Mockup UI21 Inhabilitación de Cuenta](./assets/figma/mockups/mk-ui20-inhabilitar-cuenta.png)

---

### 8.3. `UI22` — Panel de Gestión de Espacios Físicos (`CU-35`)
*(Etiquetada como `UI22 Panel de Gestión de Espacios Físicos` en Figma).* Control de aforo oficial (`Auditorio: 242`, `Sala 14: 100`, `Laboratorios: 36 equipos de alumno + 1 docente`) y estado operativo (`Activo`, `Mantenimiento`, `Inactivo`).

**Wireframe (`UI22`):**
![Wireframe UI22 Gestión de Espacios Físicos](./assets/figma/wireframes/wf-ui21-espacios-fisicos.png)

**Mockup (`UI22`):**
![Mockup UI22 Gestión de Espacios Físicos](./assets/figma/mockups/mk-ui21-espacios-fisicos.png)

---

### 8.4. `UI23` — Gestión de Equipos de Laboratorio (`CU-36`)
*(Etiquetada como `UI23 Gestión de equipos de laboratorio` en Figma).* Administración individual de cómputo funcional, en mantenimiento o inactivo por laboratorio (`2104`–`2107`).

**Wireframe (`UI23`):**
![Wireframe UI23 Gestión de Equipos de Laboratorio](./assets/figma/wireframes/wf-ui22-equipos-laboratorio.png)

**Mockup (`UI23`):**
![Mockup UI23 Gestión de Equipos de Laboratorio](./assets/figma/mockups/mk-ui22-equipos-laboratorio.png)

---

### 8.5. `UI24` — Asignar Jefes de Departamento (`CU-33`)
*(Antes `UI34` en borradores previos; `Asignar Jefes de departamento` en Figma).* Búsqueda por correo institucional **`@ipn.mx`** (excluyendo `@alumno.ipn.mx`) o nombre para asignar o revocar jefaturas activas.

**Mockup (`UI24`):**
![Mockup UI24 Asignar Jefes de Departamento](./assets/figma/mockups/mk-ui34-jefes-area.png)

---

### 8.6. `UI26` — Menú Principal de Administración
*(Etiquetada como `UI25 menú Administrador` en Figma).* Panel central con acceso directo a Gestión de Cuentas (`UI21`), Solicitudes de Verificación (`UI10`/`UI31`), Gestión de Espacios Físicos (`UI22`), Gestión de Equipos (`UI23`), Bitácora Histórica (`UI20`) y Asignar Jefes de Departamento (`UI24`).

**Mockup (`UI26`):**
![Mockup UI26 Menú Principal Administrador](./assets/figma/mockups/mk-ui25-menu-admin.png)
