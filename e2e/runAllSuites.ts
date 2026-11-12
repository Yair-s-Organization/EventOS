import { spawnSync } from "node:child_process";
import path from "node:path";

interface SuiteEntry {
  id: string;
  module: string;
  file: string;
  description: string;
}

const SUITES: SuiteEntry[] = [
  {
    id: "auth",
    module: "Autenticación",
    file: "e2e/tests/auth.e2e.spec.ts",
    description: "Inicio de sesión, credenciales inválidas y bloqueo por intentos (CU01)",
  },
  {
    id: "register",
    module: "Registro de Usuarios",
    file: "e2e/tests/registerAcceptance.e2e.spec.ts",
    description: "Validaciones de formulario de registro y dominios de correo (CU11)",
  },
  {
    id: "email-verification",
    module: "Confirmación de Correo",
    file: "e2e/tests/emailVerification.e2e.spec.ts",
    description: "Activación de cuenta por token de correo y bloqueo de no confirmados",
  },
  {
    id: "register-login",
    module: "Flujo Registro + Login",
    file: "e2e/tests/registerAndLogin.e2e.spec.ts",
    description: "Flujo continuo de registro, confirmación y primer inicio de sesión",
  },
  {
    id: "password-reset",
    module: "Recuperación de Contraseña",
    file: "e2e/tests/passwordReset.e2e.spec.ts",
    description: "Solicitud de enlace, validación de token JWT y cambio de contraseña",
  },
  {
    id: "account-verification",
    module: "Verificación de Identidad",
    file: "e2e/tests/accountVerification.e2e.spec.ts",
    description: "Acreditación con PDF por perfil y dictaminación por Subdirección",
  },
  {
    id: "ticket-reservation",
    module: "Reserva de Boletos (UI04-UI07)",
    file: "e2e/tests/ticketReservation.e2e.spec.ts",
    description: "Reserva en Auditorio (butaca manual), Sala General y Entrada Libre",
  },
  {
    id: "tickets",
    module: "Mis Boletos y QR (UI08)",
    file: "e2e/tests/ticketsModule.e2e.spec.ts",
    description: "Consulta de QR, cancelación de boleto/reserva, filtros y seguridad IDOR",
  },
  {
    id: "organizer-events",
    module: "Mis Eventos (Organizador)",
    file: "e2e/tests/organizerEvents.e2e.spec.ts",
    description: "Listado, filtros, administración, edición de evento y cancelación",
  },
  {
    id: "subdireccion-login",
    module: "Menú Subdirección",
    file: "e2e/tests/subdireccionLogin.e2e.spec.ts",
    description: "Inicio de sesión y panel principal del rol Subdirección",
  },
  {
    id: "subdireccion-solicitud",
    module: "Solicitud de Eventos",
    file: "e2e/tests/subdireccionSolicitudEvento.e2e.spec.ts",
    description: "Formulario de solicitud de evento, requerimientos de laboratorio y póster",
  },
  {
    id: "event-lifecycle",
    module: "Ciclo de Vida de Eventos",
    file: "e2e/tests/eventLifecycle.e2e.spec.ts",
    description: "Flujo multi-actor: Solicitud -> Dictamen Subdirección -> Cartelera pública",
  },
  {
    id: "logistics",
    module: "Logística y Control de Acceso",
    file: "e2e/tests/logisticsAccessControl.e2e.spec.ts",
    description: "Eventos asignados, control de aforo en vivo y escaneo de boletos QR",
  },
  {
    id: "admin-bitacora",
    module: "Admin: Bitácora Histórica",
    file: "e2e/tests/adminBitacora.e2e.spec.ts",
    description: "Menú de administrador, bitácora histórica y búsqueda con debounce",
  },
  {
    id: "admin-espacios",
    module: "Admin: Espacios y Equipos",
    file: "e2e/tests/adminEspaciosEquipos.e2e.spec.ts",
    description: "Gestión de recintos e inventario de equipamiento por laboratorio",
  },
  {
    id: "admin-jefes",
    module: "Admin: Jefes de Departamento",
    file: "e2e/tests/adminJefeDepartamento.e2e.spec.ts",
    description: "Asignación y revocación de permisos de Jefe de Departamento",
  },
  {
    id: "admin-usuarios",
    module: "Admin: Gestión de Usuarios",
    file: "e2e/tests/adminGestionUsuarios.e2e.spec.ts",
    description: "Listado, filtrado e inhabilitación de cuentas del sistema",
  },
  {
    id: "admin-perfil",
    module: "Perfil de Usuario",
    file: "e2e/tests/adminPerfil.e2e.spec.ts",
    description: "Visualización de perfil, retorno al menú y cierre de sesión",
  },
  {
    id: "security",
    module: "Seguridad y Resiliencia DoS",
    file: "e2e/tests/securityResilience.e2e.spec.ts",
    description: "Peticiones sin Content-Type, payloads gigantes (413), Type Confusion, Mass Assignment, SQLi/XSS y JWT",
  },
  {
    id: "full-workflow",
    module: "Flujo Multi-Actor + Adversarial/DoS",
    file: "e2e/tests/fullAdversarialWorkflow.e2e.spec.ts",
    description: "Flujo completo 6 etapas (Organizador -> Subdirección -> No Verificado -> Reservas QR/Correo -> Modificación Logística) + DoS",
  },
];

function runSuites(): void {
  const filterArg = process.argv[2]?.toLowerCase().trim();
  const headless = process.env.HEADLESS ?? "true";
  const rootDir = path.resolve(import.meta.dir, "..");

  const selectedSuites = filterArg
    ? SUITES.filter(
        (s) =>
          s.id.includes(filterArg) ||
          s.module.toLowerCase().includes(filterArg) ||
          s.file.toLowerCase().includes(filterArg),
      )
    : SUITES;

  if (selectedSuites.length === 0) {
    console.error(`No se encontraron suites que coincidan con el filtro: "${filterArg}"`);
    process.exit(1);
  }

  console.log("================================================================================");
  console.log(`  EventOS — Ejecución Estandarizada de Suites E2E (${selectedSuites.length} suites)`);
  console.log(`  Modo Headless: ${headless}`);
  console.log("================================================================================\n");

  const results: Array<{
    suite: SuiteEntry;
    passed: boolean;
    durationSec: string;
  }> = [];

  for (let i = 0; i < selectedSuites.length; i++) {
    const suite = selectedSuites[i];
    console.log(
      `\n[${i + 1}/${selectedSuites.length}] ▶ ${suite.module} (${suite.file})`,
    );
    console.log(`    ${suite.description}`);
    console.log("--------------------------------------------------------------------------------");

    const start = Date.now();
    const child = spawnSync("bun", [suite.file], {
      cwd: rootDir,
      stdio: "inherit",
      env: {
        ...process.env,
        HEADLESS: headless,
      },
    });
    const durationSec = ((Date.now() - start) / 1000).toFixed(1);
    const passed = child.status === 0;

    results.push({ suite, passed, durationSec });

    if (passed) {
      console.log(`✔ [${suite.id}] PASÓ en ${durationSec}s`);
    } else {
      console.error(`✖ [${suite.id}] FALLÓ tras ${durationSec}s (código ${child.status})`);
    }
  }

  console.log("\n================================================================================");
  console.log("  RESUMEN DE EJECUCIÓN E2E");
  console.log("================================================================================");
  for (const r of results) {
    const icon = r.passed ? "PASS" : "FAIL";
    console.log(
      `  [${icon}] ${r.suite.id.padEnd(22)} | ${r.suite.module.padEnd(32)} | ${r.durationSec.padStart(5)}s`,
    );
  }
  console.log("--------------------------------------------------------------------------------");

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.length - passedCount;
  console.log(
    `  Total: ${results.length} suites | Exitosas: ${passedCount} | Fallidas: ${failedCount}`,
  );
  console.log("================================================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runSuites();
