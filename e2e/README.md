# Suite de Pruebas End-to-End (E2E) — EventOS

Documentación oficial para configurar, ejecutar y dar mantenimiento a las **18 suites automatizadas End-to-End (97 casos de prueba)** de EventOS construidas con **Selenium WebDriver + TypeScript + Bun**.

---

## 1. Inicio Rápido (Quick Start)

Cualquier integrante del equipo que clone el repositorio puede ejecutar las pruebas siguiendo estos **4 pasos**:

### Paso 1: Requisitos previos
Asegúrate de contar con:
- **Bun** (`>= 1.1.x`)
- **Google Chrome** instalado en el sistema (Selenium Manager descarga `chromedriver` automáticamente según tu versión de Chrome)
- **PostgreSQL** (`>= 15`) corriendo localmente (puerto `5432`) o mediante **Docker Compose** (puerto `5433`)

### Paso 2: Instalar dependencias e inicializar la base de datos
Desde la raíz del repositorio:

```bash
# 1. Instalar dependencias del monorepo
bun install

# 2. (Opcional) Si usas Docker para PostgreSQL y MinIO:
docker compose up -d

# 3. Inicializar esquema y cargar semillas base (usuarios, recintos, asientos, eventos)
bun run db:init
bun run db:seed
```

> **Portabilidad automática de Base de Datos (`e2e/utils/testEnv.ts`):**
> No necesitas modificar los archivos de prueba si tu PostgreSQL corre en Docker (`5433`, usuario/contraseña `postgres`) o en instalación local (`5432`, contraseña `admin` o `postgres`). El conector de pruebas detecta automáticamente tu `.env` y realiza *fallback* entre ambos entornos.

### Paso 3: Levantar Backend y Frontend
En dos terminales separadas (o con `bun run dev`):

```bash
# Terminal 1 — Backend NestJS en http://localhost:3000
bun run dev:backend

# Terminal 2 — Frontend React + Vite en http://localhost:5173
bun run dev:frontend
```

### Paso 4: Ejecutar las pruebas E2E
En una tercera terminal desde la raíz del proyecto:

```bash
# Ejecutar TODAS las 20 suites (124 casos de prueba) en modo headless (recomendado para CI o verificación completa)
bun run test:e2e

# Ejecutar TODAS las 20 suites abriendo la ventana del navegador Chrome
bun run test:e2e:headed

# Ejecutar únicamente las suites que coincidan con un filtro (ej. "logistics", "admin", "tickets", "security", "full-workflow")
bun run e2e/runAllSuites.ts logistics
```

---

## 2. Catálogo de Módulos y Comandos Individuales

Cada módulo del sistema cuenta con su propio comando en `package.json`. Puedes agregar `HEADLESS=true` antes de cualquier comando individual si deseas ejecutarlo sin interfaz gráfica.

| # | Módulo / Flujo | Script NPM / Bun | Archivo de Suite | Casos |
| :- | :--- | :--- | :--- | :-: |
| 1 | **Autenticación y Seguridad (`CU01`)** | `bun run test:e2e:auth` | `e2e/tests/auth.e2e.spec.ts` | 9 |
| 2 | **Registro de Usuarios (`CU11`)** | `bun run test:e2e:register` | `e2e/tests/registerAcceptance.e2e.spec.ts` | 7 |
| 3 | **Confirmación de Correo Electrónico** | `bun run test:e2e:email-verification` | `e2e/tests/emailVerification.e2e.spec.ts` | 7 |
| 4 | **Flujo Integral Registro + Login** | `bun run test:e2e:register-login` | `e2e/tests/registerAndLogin.e2e.spec.ts` | 1 |
| 5 | **Recuperación de Contraseña** | `bun run test:e2e:password-reset` | `e2e/tests/passwordReset.e2e.spec.ts` | 10 |
| 6 | **Verificación de Identidad y Dictamen** | `bun run test:e2e:account-verification` | `e2e/tests/accountVerification.e2e.spec.ts` | 6 |
| 7 | **Reserva de Boletos (`UI04`–`UI07`)** | `bun run test:e2e:ticket-reservation` | `e2e/tests/ticketReservation.e2e.spec.ts` | 3 |
| 8 | **Mis Boletos, QR y Cancelación (`UI08`)** | `bun run test:e2e:tickets-module` | `e2e/tests/ticketsModule.e2e.spec.ts` | 10 |
| 9 | **Gestión de Eventos del Organizador** | `bun run test:e2e:organizer-events` | `e2e/tests/organizerEvents.e2e.spec.ts` | 5 |
| 10 | **Acceso y Panel de Subdirección** | `bun run test:e2e:subdireccion-login` | `e2e/tests/subdireccionLogin.e2e.spec.ts` | 1 |
| 11 | **Solicitud de Eventos y Laboratorios** | `bun run test:e2e:subdireccion-solicitud` | `e2e/tests/subdireccionSolicitudEvento.e2e.spec.ts` | 7 |
| 12 | **Ciclo de Vida Completo de Eventos** | `bun run test:e2e:event-lifecycle` | `e2e/tests/eventLifecycle.e2e.spec.ts` | 6 |
| 13 | **Logística, Aforo y Escáner QR (`UI18`)** | `bun run test:e2e:logistics` | `e2e/tests/logisticsAccessControl.e2e.spec.ts` | 6 |
| 14 | **Admin: Menú y Bitácora Histórica** | `bun run test:e2e:admin-bitacora` | `e2e/tests/adminBitacora.e2e.spec.ts` | 4 |
| 15 | **Admin: Espacios e Inventario de Equipos** | `bun run test:e2e:admin-espacios` | `e2e/tests/adminEspaciosEquipos.e2e.spec.ts` | 4 |
| 16 | **Admin: Jefes de Departamento** | `bun run test:e2e:admin-jefes` | `e2e/tests/adminJefeDepartamento.e2e.spec.ts` | 4 |
| 17 | **Admin: Gestión de Cuentas de Usuario** | `bun run test:e2e:admin-usuarios` | `e2e/tests/adminGestionUsuarios.e2e.spec.ts` | 4 |
| 18 | **Perfil de Usuario y Sesión** | `bun run test:e2e:admin-perfil` | `e2e/tests/adminPerfil.e2e.spec.ts` | 3 |
| 19 | **Seguridad, Payloads y Resiliencia DoS** | `bun run test:e2e:security` | `e2e/tests/securityResilience.e2e.spec.ts` | 9 |
| 20 | **Flujo Multi-Actor + Adversarial/DoS (6 Etapas)** | `bun run test:e2e:full-workflow` | `e2e/tests/fullAdversarialWorkflow.e2e.spec.ts` | 18 |
| **Total** | **100% de los módulos + Flujo Adversarial** | **`bun run test:e2e`** | **20 suites automatizadas** | **124** |

---

## 3. Arquitectura del Directorio `e2e/`

La suite sigue el patrón **Page Object Model (POM)** y aislamiento de datos de prueba (cada suite que inserta datos transaccionales los limpia automáticamente en un bloque `finally`):

```text
e2e/
├── README.md                                  # Esta guía de ejecución y referencia
├── runAllSuites.ts                            # Orquestador maestro de las 18 suites con reporte resumen
├── utils/
│   └── testEnv.ts                             # Carga automática de .env, conexión DB con fallback y WebDriver
├── fixtures/
│   ├── poster.jpg                             # Póster válido 2048x1152 px para solicitud de eventos
│   └── comprobante.pdf                        # Documento PDF válido para verificación de identidad
├── pages/                                     # Page Objects reutilizables
│   ├── EventRequestPage.ts                    # Formulario multi-sección de Solicitud de Evento
│   ├── LoginPage.ts                           # Inicio de sesión con bypass controlado de CAPTCHA para QA
│   ├── MyTicketsPage.ts                       # Módulo UI08 Mis Boletos, filtros y boleto digital QR
│   ├── PasswordResetPage.ts                   # Solicitud y restablecimiento de contraseña
│   ├── RegisterPage.ts                        # Formulario de registro y modal de confirmación
│   ├── SubdireccionMenuPage.ts                # Panel principal de Subdirección
│   └── TicketReservationPage.ts               # Cartelera (UI04), Detalles (UI05), Mapa Butacas (UI06) y Resumen (UI07)
└── tests/                                     # 18 especificaciones E2E por módulo
```

---

## 4. Detalle de Cobertura por Módulo

### 4.1 Autenticación, Registro y Cuenta
- **`auth.e2e.spec.ts` (`TC-01` a `TC-09`)**: Campos vacíos, formato de correo inválido, contraseña < 8 caracteres, credenciales inexistentes, contraseña incorrecta, bloqueo temporal al 3er intento fallido, persistencia del bloqueo con contraseña correcta, login exitoso y navegación a registro.
- **`registerAcceptance.e2e.spec.ts` (`TC-REG-01` a `TC-REG-07`)**: Modal de campos incompletos, nombres con números/símbolos, correo mal formado, contraseña débil, confirmación desigual, correo duplicado y registro exitoso con dominio `@ipn.mx`, `@alumno.ipn.mx` o externo.
- **`emailVerification.e2e.spec.ts` (`TC-VERIF-01` a `TC-VERIF-07`)**: Emisión de token de confirmación al registrar, bloqueo de login (`401`) antes de confirmar correo, rechazo de tokens vacíos o corruptos, activación en `/confirmar-registro?token=...`, idempotencia al reutilizar el enlace y login post-confirmación.
- **`passwordReset.e2e.spec.ts` (`TC-RESET-01` a `TC-RESET-10`)**: Navegación desde `/login`, validación de correo vacío e inválido, respuesta neutral ante correos no registrados (anti-enumeración), generación de token JWT de 15 min, bloqueo de pantalla sin token o con token corrupto, validación de complejidad de nueva contraseña, actualización exitosa e invalidación de la contraseña anterior.
- **`accountVerification.e2e.spec.ts` (`TC-VER-01` a `TC-VER-06`)**: Estado inicial `"Sin verificar"` en `/perfil`, validación de archivo PDF obligatorio en `/verificacion`, campos dinámicos según `Tipo de perfil` (`Estudiante`, `Profesor`, `Empresa`, `Externo`), validación de formato de boleta en backend, envío de solicitud con PDF, rechazo con motivo por Subdirección y aprobación final verificando el cambio de insignia a `"Verificado"`.

### 4.2 Asistentes, Cartelera y Boletos (`UI04` a `UI08`)
- **`ticketReservation.e2e.spec.ts`**:
  1. **Flujo Auditorio (`UI04 -> UI05 -> UI06 -> UI07`)**: Selección de evento en cartelera, clic en reservar, selección manual de asiento disponible en el mapa interactivo del Auditorio Principal, confirmación, generación de código QR y vista de boleto digital.
  2. **Flujo Recinto General (`UI04 -> UI05 -> UI07`)**: Reserva en Sala 14 con asignación automática de lugar sin pasar por mapa de butacas.
  3. **Flujo Entrada Libre (`UI04 -> UI05`)**: Verificación de etiqueta `"Entrada libre"` y ausencia de botones de reserva.
- **`ticketsModule.e2e.spec.ts` (`TC-01` a `TC-10`)**: Listado en `/asistente/boletos`, consulta de QR en `/asistente/boletos/:idBoleto`, descarga de PDF, cancelación de boleto de Auditorio con liberación de butaca en BD, cancelación de reservación general, bloqueo de doble cancelación (`409`), protección de boletos ya escaneados (`Ingresado`), bloqueo IDOR entre usuarios (`404`), filtros combinados y estado vacío.

### 4.3 Organizador, Subdirección y Ciclo de Vida de Eventos
- **`organizerEvents.e2e.spec.ts` (`TC-ORG-01` a `TC-ORG-05`)**: Listado de tarjetas en `/organizador/mis-eventos`, filtrado por nombre y espacio (`#selectRecinto`), consulta de detalles en `/organizador/administrar-evento/:idEvento`, edición de nombre y descripción en `/organizador/editar-evento/:idEvento`, y cancelación de evento con justificación obligatoria.
- **`subdireccionLogin.e2e.spec.ts` y `subdireccionSolicitudEvento.e2e.spec.ts` (`TC-SOL-01` a `TC-SOL-07`)**: Autenticación de Subdirección, navegación a `/solicitud-evento`, validación de campos obligatorios, modal de requerimientos técnicos de laboratorio (`"Ver detalles del laboratorio"`), límites de caracteres, validación de póster (`2048x1152` px) y creación de solicitud.
- **`eventLifecycle.e2e.spec.ts` (Fases 1 a 6)**: Registro de organizador -> Acreditación -> Creación de solicitud de evento con póster y ponente -> Revisión y aprobación por Subdirección en `/detalles-solicitud/:id` -> Verificación inmediata del evento publicado en `/cartelera`.

### 4.4 Logística y Control de Acceso QR (`UI18`)
- **`logisticsAccessControl.e2e.spec.ts` (`TC-LOG-01` a `TC-LOG-06`)**: Visualización de subeventos asignados en `/panel-eventos-asignados`, filtros de búsqueda y limpieza de filtros, panel `/control-acceso/:idSubEvento` con indicador de aforo inicial (`0/N`), vista de cámara `/escanear-boleto/:idSubEvento`, bloqueo `403` a usuarios no asignados a logística del evento, error `404` ante QR inexistente, registro de entrada con QR válido (`1/N` y fila en tabla de asistentes) y bloqueo `409 Conflict` ante intento de reingreso con el mismo boleto.

### 4.5 Administración del Sistema
- **`adminBitacora.e2e.spec.ts` (`TC-BIT-01` a `TC-BIT-04`)**: Tarjetas del `/menu-admin`, tabla de `/admin/bitacora`, búsqueda en tiempo real con debounce y estado sin coincidencias.
- **`adminEspaciosEquipos.e2e.spec.ts` (`TC-ESP-01` a `TC-ESP-04`)**: Tabla de `/gestion-espacios`, bloqueo del botón `"Equipos"` en Auditorio/Sala 14, navegación a `/gestion-equipos/:id` en laboratorios y conmutación de disponibilidad (`Disponible` / `No disponible`).
- **`adminJefeDepartamento.e2e.spec.ts` (`TC-JEF-01` a `TC-JEF-04`)**: Pestañas `"Asignar Jefe"` y `"Revocar Jefe"` en `/admin/jefe-departamento`, búsqueda por correo institucional y ciclo completo de asignación y revocación con modales de confirmación.
- **`adminGestionUsuarios.e2e.spec.ts` (`TC-USU-01` a `TC-USU-04`)**: Listado en `/admin/gestion-usuarios`, protección de la cuenta del propio Administrador en sesión, búsqueda por correo y baja lógica (`Inhabilitado`) de cuentas de usuario.
- **`adminPerfil.e2e.spec.ts` (`TC-PER-01` a `TC-PER-03`)**: Acceso desde el icono de barra de navegación a `/perfil`, validación de datos de cuenta y cierre de sesión.

### 4.6 Seguridad, Resiliencia DoS y Flujo Multi-Actor Adversarial
- **`securityResilience.e2e.spec.ts` (`TC-SEC-01` a `TC-SEC-09`)**: Peticiones malformadas sin `Content-Type` o con JSON truncado (`400`), ataques DoS de payloads gigantes de `100,000` caracteres (`413 Payload Too Large` vía `body-parser` a `10kb`), Type Confusion (objetos/arreglos en campos string), Mass Assignment (`esVerificado`, `tipoCuenta`, `idUsuario`), inyección SQL/XSS en parámetros y cuerpos, y tokens JWT manipulados.
- **`fullAdversarialWorkflow.e2e.spec.ts` (6 Etapas + 12 Vectores de Ataque)**:
  1. **Etapa 1**: `organizador@ipn.mx` solicita en UI un Evento Público con 2 subeventos (Auditorio + Laboratorio/Sala) y solicita eventos Interno y Privado, mientras se validan ataques DoS JSON (`413`), DoS Multipart FormData (`400/413`), sin `Content-Type` (`400`) y traslape de horarios (`409`).
  2. **Etapa 2**: `subdireccion@ipn.mx` aprueba el Evento Público e Interno y rechaza el Privado con motivo obligatorio, bloqueando auto-aprobación del organizador (`403`), DoS en `/rechazar` (`413`), motivo vacío (`400`) y re-aprobación de evento rechazado (`409`).
  3. **Etapa 3**: Cuenta interna diferente pero **No verificada** intenta solicitar un evento y es bloqueada tanto en UI (modal `"Verificación necesaria"`) como por API (`403 Forbidden`).
  4. **Etapa 4**: El asistente navega la Cartelera, consulta detalles del evento, reserva la Actividad 1 en Auditorio (selección de butaca, QR, PDF y correo) y la Actividad 2 en Laboratorio/Sala (asignación automática, QR, PDF y correo), bloqueando DoS (`413`), sin `Content-Type` (`400`), reserva sin asiento en Auditorio (`400`), doble reservación (`409`) e IDOR (`403/404`).
  5. **Etapa 5**: `organizador@ipn.mx` realiza una modificación normal de datos generales (aplicación inmediata) y una modificación de logística (cambio de horario + justificación -> `"Solicitud en revisión"`), bloqueando ediciones de terceros (`403`) y DoS (`413`).
  6. **Etapa 6**: Se comprueba segregación de roles (`admin@ipn.mx` recibe `403` al intentar dictaminar en `/solicitudes/:id/aprobar`) y `subdireccion@ipn.mx` aprueba el cambio logístico en `/detalles-solicitud/:id`, verificando la actualización del horario en base de datos.

---

## 5. Aislamiento en Producción (`bun run build` / Render)

Las suites de pruebas están diseñadas para **no afectar ni incluirse jamás en el despliegue a producción**:
1. **Exclusión del artefacto compilado**: La carpeta `e2e/` vive en la raíz del monorepo fuera de `apps/backend/src` y `apps/frontend/src`. Al ejecutar `bun run build`, ni `apps/backend/dist` ni `apps/frontend/dist` empaquetan archivos de pruebas ni `selenium-webdriver`.
2. **Desactivación automática de banderas de QA en Producción**:
   - En el Frontend (`useLoginForm.ts` y `useRegistro.ts`), el bypass de CAPTCHA para QA está protegido con `!import.meta.env.PROD`, por lo que al compilar con `vite build` queda inactivo al 100%.
   - En el Backend (`auth.service.ts` y `storage.service.ts`), los helpers de confirmación para pruebas verifican `process.env.NODE_ENV !== 'production'`.

---

## 6. Variables de Entorno Opcionales

No es necesario configurar ninguna variable adicional para correr las pruebas localmente. Si deseas personalizar el entorno de ejecución, puedes exportar:

| Variable | Valor por defecto | Descripción |
| :--- | :--- | :--- |
| `HEADLESS` | `true` (en `test:e2e`) | `true` ejecuta Chrome en segundo plano; `false` abre la ventana del navegador |
| `E2E_BASE_URL` | `http://localhost:5173` | URL base del servidor Frontend |
| `API_BASE_URL` | `http://localhost:3000/api` | URL base de la API Backend |
| `DB_HOST` | `localhost` | Host de PostgreSQL |
| `DB_PORT` | Auto (`5432` o `5433`) | Puerto de PostgreSQL (auto-detectado si se omite) |
| `DB_USER` | `postgres` | Usuario de PostgreSQL |
| `DB_PASSWORD` | Auto (`admin` o `postgres`) | Contraseña de PostgreSQL (auto-detectada si se omite) |
| `DB_NAME` | `eventos` | Nombre de la base de datos |

---

## 6. Solución de Problemas Comunes (Troubleshooting)

1. **`ERR_CONNECTION_REFUSED` en `localhost:5173` o `localhost:3000`**
   - Verifica que tanto el backend (`bun run dev:backend`) como el frontend (`bun run dev:frontend`) estén encendidos antes de lanzar `bun run test:e2e`.
2. **Fallo de inicio de sesión con cuentas base (`admin@ipn.mx` o `subdireccion@ipn.mx`)**
   - Ejecuta `bun run db:seed` para restaurar los usuarios semilla y recintos base.
3. **Bloqueo temporal por intentos fallidos en pruebas manuales previas**
   - Si bloqueaste manualmente una cuenta semilla antes de correr la suite, reinicia el proceso de `bun run dev:backend` para limpiar la memoria de bloqueos temporales o ejecuta `bun run db:seed`.
