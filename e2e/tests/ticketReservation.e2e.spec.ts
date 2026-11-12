import assert from "node:assert/strict";
import { Builder, WebDriver } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";
import { LoginPage } from "../pages/LoginPage";
import { TicketReservationPage } from "../pages/TicketReservationPage";
import { connectTestDb } from "../utils/testEnv";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000/api";

interface TestContext {
  attendeeId: number;
  attendeeEmail: string;
  auditorioEventId: number;
  auditorioEventName: string;
  noAuditorioEventId: number;
  noAuditorioEventName: string;
  freeEventId: number;
  freeEventName: string;
  createdEventIds: number[];
  createdFechaIds: number[];
  createdSubEventoIds: number[];
}

async function setupTestData(): Promise<TestContext> {
  const bcrypt = await import("../../apps/backend/node_modules/bcrypt");
  const client = await connectTestDb();

  const timestamp = Date.now();
  const attendeeEmail = `asistente.e2e.${timestamp}@alumno.ipn.mx`;
  const passwordHash = await bcrypt.default.hash("Password123!", 10);

  // 1. Crear usuario asistente de pruebas
  const resUser = await client.query(
    `INSERT INTO usuario (nombre, "apellidoPa", "apellidoMa", correo, contrasena, estatus, "esVerificado", "tipoCuenta", "esJefeAcademia")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING "idUsuario";`,
    [
      "Carlos",
      "Asistente",
      "E2E",
      attendeeEmail,
      passwordHash,
      true,
      "Verificado",
      "Asistente",
      false,
    ],
  );
  const attendeeId = resUser.rows[0].idUsuario;

  // 2. Obtener un organizador existente
  const resOrg = await client.query(
    `SELECT "idUsuario" FROM usuario WHERE "tipoCuenta" IN ('Usuario Interno', 'Subdirección', 'Administrador') LIMIT 1;`,
  );
  const organizerId = resOrg.rows.length > 0 ? resOrg.rows[0].idUsuario : attendeeId;

  // Fecha futura: mañana
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const createdEventIds: number[] = [];
  const createdFechaIds: number[] = [];
  const createdSubEventoIds: number[] = [];

  // 3. Crear Evento 1: Auditorio (con butacas numeradas y acceso QR)
  const auditorioEventName = `Auditorio E2E ${timestamp}`;
  const resEv1 = await client.query(
    `INSERT INTO evento (nombre, descripcion, poster, justificacion, "esUrgente", "idAlcance", "idEstadoEvento", "idOrganizador")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING "idEvento";`,
    [
      auditorioEventName,
      "Evento especial en el Auditorio Principal con selección de butaca para pruebas automatizadas.",
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600",
      "Validación de flujo E2E para selección de asientos en auditorio.",
      false,
      1, // Público
      2, // Aceptado
      organizerId,
    ],
  );
  const auditorioEventId = resEv1.rows[0].idEvento;
  createdEventIds.push(auditorioEventId);

  const resF1 = await client.query(
    `INSERT INTO fecha (fecha, "horaInicio", "horaFin") VALUES ($1, $2, $3) RETURNING "idFecha";`,
    [tomorrow, "10:00:00", "12:00:00"],
  );
  const f1Id = resF1.rows[0].idFecha;
  createdFechaIds.push(f1Id);

  const resSub1 = await client.query(
    `INSERT INTO "subEvento" ("accesoQR", estado, nombre, descripcion, "idEvento", "idRecinto", "idFecha")
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING "idSubEvento";`,
    [
      true,
      "Aceptado",
      `Conferencia Auditorio ${timestamp}`,
      "Actividad con butacas numeradas en Auditorio Principal.",
      auditorioEventId,
      1, // Auditorio Principal
      f1Id,
    ],
  );
  createdSubEventoIds.push(resSub1.rows[0].idSubEvento);

  // 4. Crear Evento 2: No Auditorio / Sala 14 (sin butacas numeradas, asignación automática de lugar y acceso QR)
  const noAuditorioEventName = `Taller Sala 14 E2E ${timestamp}`;
  const resEv2 = await client.query(
    `INSERT INTO evento (nombre, descripcion, poster, justificacion, "esUrgente", "idAlcance", "idEstadoEvento", "idOrganizador")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING "idEvento";`,
    [
      noAuditorioEventName,
      "Taller interactivo en Sala 14 con asignación automática de lugares.",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600",
      "Validación de flujo E2E para asignación automática sin selección de butaca.",
      false,
      1, // Público
      2, // Aceptado
      organizerId,
    ],
  );
  const noAuditorioEventId = resEv2.rows[0].idEvento;
  createdEventIds.push(noAuditorioEventId);

  const resF2 = await client.query(
    `INSERT INTO fecha (fecha, "horaInicio", "horaFin") VALUES ($1, $2, $3) RETURNING "idFecha";`,
    [tomorrow, "13:00:00", "15:00:00"],
  );
  const f2Id = resF2.rows[0].idFecha;
  createdFechaIds.push(f2Id);

  const resSub2 = await client.query(
    `INSERT INTO "subEvento" ("accesoQR", estado, nombre, descripcion, "idEvento", "idRecinto", "idFecha")
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING "idSubEvento";`,
    [
      true,
      "Aceptado",
      `Taller Sala 14 ${timestamp}`,
      "Actividad en espacio sin butacas individuales numeradas.",
      noAuditorioEventId,
      4, // Sala 14
      f2Id,
    ],
  );
  createdSubEventoIds.push(resSub2.rows[0].idSubEvento);

  // 5. Crear Evento 3: Entrada Libre (accesoQR = false, termina en UI05 sin reservación)
  const freeEventName = `Feria Entrada Libre E2E ${timestamp}`;
  const resEv3 = await client.query(
    `INSERT INTO evento (nombre, descripcion, poster, justificacion, "esUrgente", "idAlcance", "idEstadoEvento", "idOrganizador")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING "idEvento";`,
    [
      freeEventName,
      "Exposición de divulgación con acceso libre hasta completar aforo.",
      "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600",
      "Validación de flujo E2E para eventos informativos de acceso libre.",
      false,
      1, // Público
      2, // Aceptado
      organizerId,
    ],
  );
  const freeEventId = resEv3.rows[0].idEvento;
  createdEventIds.push(freeEventId);

  const resF3 = await client.query(
    `INSERT INTO fecha (fecha, "horaInicio", "horaFin") VALUES ($1, $2, $3) RETURNING "idFecha";`,
    [tomorrow, "16:00:00", "18:00:00"],
  );
  const f3Id = resF3.rows[0].idFecha;
  createdFechaIds.push(f3Id);

  const resSub3 = await client.query(
    `INSERT INTO "subEvento" ("accesoQR", estado, nombre, descripcion, "idEvento", "idRecinto", "idFecha")
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING "idSubEvento";`,
    [
      false, // Entrada libre (sin boleto QR)
      "Aceptado",
      `Muestra Abierta ${timestamp}`,
      "Actividad de libre acceso sin reserva previa.",
      freeEventId,
      4, // Sala 14
      f3Id,
    ],
  );
  createdSubEventoIds.push(resSub3.rows[0].idSubEvento);

  await client.end();

  return {
    attendeeId,
    attendeeEmail,
    auditorioEventId,
    auditorioEventName,
    noAuditorioEventId,
    noAuditorioEventName,
    freeEventId,
    freeEventName,
    createdEventIds,
    createdFechaIds,
    createdSubEventoIds,
  };
}

async function cleanupTestData(ctx: TestContext): Promise<void> {
  const client = await connectTestDb();

  try {

    if (ctx.createdSubEventoIds.length > 0) {
      // Eliminar asistentes y boletos creados
      const resBoleto = await client.query(
        `SELECT "idBoleto" FROM "asistenteEvento" WHERE "idSubEvento" = ANY($1::int[]) AND "idBoleto" IS NOT NULL;`,
        [ctx.createdSubEventoIds],
      );
      const boletoIds = resBoleto.rows.map((r: any) => r.idBoleto);

      await client.query(
        `DELETE FROM "asistenteEvento" WHERE "idSubEvento" = ANY($1::int[]) OR "idUsuario" = $2;`,
        [ctx.createdSubEventoIds, ctx.attendeeId],
      );

      if (boletoIds.length > 0) {
        await client.query(`DELETE FROM boleto WHERE "idBoleto" = ANY($1::int[]);`, [boletoIds]);
      }

      await client.query(
        `DELETE FROM "subEvento" WHERE "idSubEvento" = ANY($1::int[]);`,
        [ctx.createdSubEventoIds],
      );
    }

    if (ctx.createdEventIds.length > 0) {
      await client.query(`DELETE FROM evento WHERE "idEvento" = ANY($1::int[]);`, [ctx.createdEventIds]);
    }

    if (ctx.createdFechaIds.length > 0) {
      await client.query(`DELETE FROM fecha WHERE "idFecha" = ANY($1::int[]);`, [ctx.createdFechaIds]);
    }

    if (ctx.attendeeId) {
      await client.query(`DELETE FROM usuario WHERE "idUsuario" = $1;`, [ctx.attendeeId]);
    }
  } catch (error) {
    console.warn("Advertencia en limpieza de datos:", error);
  } finally {
    await client.end();
  }
}

async function runTicketReservationSuite(): Promise<void> {
  const options = new chrome.Options();
  options.addArguments("--window-size=1366,900");
  if (process.env.HEADLESS === "true") {
    options.addArguments(
      "--headless=new",
      "--no-sandbox",
      "--disable-dev-shm-usage",
    );
  }

  const driver: WebDriver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  const loginPage = new LoginPage(driver);
  const reservationPage = new TicketReservationPage(driver);

  let ctx: TestContext | null = null;

  try {
    console.log("=== INICIANDO SUITE: MÓDULO DE RESERVA DE BOLETOS ===");
    console.log("Configurando datos de prueba en la base de datos...");
    ctx = await setupTestData();
    console.log(`Usuario asistente creado: ${ctx.attendeeEmail}`);
    console.log(`Evento Auditorio: ${ctx.auditorioEventName} (ID: ${ctx.auditorioEventId})`);
    console.log(`Evento No Auditorio: ${ctx.noAuditorioEventName} (ID: ${ctx.noAuditorioEventId})`);
    console.log(`Evento Entrada Libre: ${ctx.freeEventName} (ID: ${ctx.freeEventId})`);

    // Iniciar sesión como asistente para realizar las reservas
    console.log("\nIniciando sesión con cuenta de asistente...");
    await loginPage.login(ctx.attendeeEmail, "Password123!");
    await driver.sleep(1500);

    // =========================================================================
    // CASO 1: FLUJO AUDITORIO (UI04 -> UI05 -> UI06 con mapa -> QR y Resumen)
    // =========================================================================
    console.log("\n--- CASO 1: Reserva en Auditorio con selección de asiento ---");
    console.log("Paso 1: Navegando a la Cartelera (UI04)...");
    await reservationPage.openCatalog();

    console.log(`Paso 2: Localizando evento de auditorio '${ctx.auditorioEventName}' y abriendo detalles...`);
    await reservationPage.selectEventByTitle(ctx.auditorioEventName);

    console.log("Paso 3: Verificando pantalla de Detalles del Evento (UI05)...");
    await reservationPage.waitForEventDetails(ctx.auditorioEventName);
    const hasAuditorioReserveBtn = await reservationPage.hasReserveButton();
    assert.equal(hasAuditorioReserveBtn, true, "El evento de auditorio debe mostrar el botón 'Reservar lugar'.");

    console.log("Paso 4: Presionando 'Reservar lugar' para ir a UI06...");
    await reservationPage.clickReserve();

    console.log("Paso 5: Verificando pantalla de reserva UI06 y presencia del mapa de asientos...");
    await reservationPage.waitForReservationPage();
    const isMapVisible = await reservationPage.isSeatMapVisible();
    assert.equal(isMapVisible, true, "El Auditorio Principal debe mostrar el mapa de asientos interactivo.");

    console.log("Paso 6: Seleccionando un asiento disponible en el plano...");
    const selectedSeat = await reservationPage.selectAvailableSeat();
    assert.ok(selectedSeat.length > 0, "Debe seleccionarse un asiento válido.");
    console.log(`  Asiento seleccionado: ${selectedSeat}`);

    const seatDisplayText = await reservationPage.getSelectedSeatDisplay();
    assert.ok(
      seatDisplayText.includes(selectedSeat),
      `El resumen debe mostrar el asiento seleccionado '${selectedSeat}'. Actual: '${seatDisplayText}'`,
    );

    console.log("Paso 7: Confirmando reservación del asiento seleccionado...");
    await reservationPage.clickReserveSeat();
    await reservationPage.confirmReservationInModal();

    console.log("Paso 8: Verificando diálogo de éxito y generación de boleto con código QR...");
    const isSuccessOpen = await reservationPage.waitForSuccessDialog();
    assert.equal(isSuccessOpen, true, "Debe desplegarse el modal de confirmación con el boleto.");

    const isQrVisible = await reservationPage.isSuccessQrGenerated();
    assert.equal(isQrVisible, true, "El modal de éxito debe renderizar la imagen del código QR.");

    const ticketId = await reservationPage.getTicketIdFromSuccessDialog();
    assert.ok(ticketId !== null && ticketId > 0, "Debe mostrarse el identificador del boleto generado.");
    console.log(`  Boleto generado con éxito: #${ticketId}`);

    console.log("Paso 9: Navegando a la pantalla de resumen del boleto digital...");
    await reservationPage.navigateToDigitalTicket(ticketId!);
    const isTicketActive = await reservationPage.waitForDigitalTicket(ctx.auditorioEventName);
    assert.equal(isTicketActive, true, "La pantalla de resumen del boleto digital debe mostrar estado Activo y QR.");
    console.log("  ✓ Caso 1 superado con éxito.");

    // =========================================================================
    // CASO 2: FLUJO NO AUDITORIO / ASIGNACIÓN AUTOMÁTICA
    // =========================================================================
    console.log("\n--- CASO 2: Reserva fuera de Auditorio con asignación automática ---");
    console.log("Paso 1: Volviendo a la Cartelera (UI04)...");
    await reservationPage.openCatalog();

    console.log(`Paso 2: Localizando evento sin butacas '${ctx.noAuditorioEventName}' y abriendo detalles...`);
    await reservationPage.selectEventByTitle(ctx.noAuditorioEventName);

    console.log("Paso 3: Verificando detalles del evento (UI05) y presionando reservar...");
    await reservationPage.waitForEventDetails(ctx.noAuditorioEventName);
    await reservationPage.clickReserve();

    console.log("Paso 4: Verificando pantalla de reserva UI06 en modo automático...");
    await reservationPage.waitForReservationPage();
    const isAutomaticPanel = await reservationPage.isAutomaticReservationNoticeVisible();
    assert.equal(isAutomaticPanel, true, "Debe mostrar el aviso de asignación automática sin selección de asiento.");

    const isMapHidden = await reservationPage.isSeatMapVisible();
    assert.equal(isMapHidden, false, "El evento fuera de auditorio no debe mostrar mapa de asientos numerados.");

    console.log("Paso 5: Presionando 'Reservar lugar' y confirmando reservación...");
    await reservationPage.clickAutomaticReserve();
    await reservationPage.confirmReservationInModal();

    console.log("Paso 6: Verificando diálogo de éxito y código QR del lugar asignado automáticamente...");
    const isAutoSuccessOpen = await reservationPage.waitForSuccessDialog();
    assert.equal(isAutoSuccessOpen, true, "Debe desplegarse el modal de éxito para la asignación automática.");

    const isAutoQrVisible = await reservationPage.isSuccessQrGenerated();
    assert.equal(isAutoQrVisible, true, "Debe generarse el código QR para el boleto general.");

    const autoTicketId = await reservationPage.getTicketIdFromSuccessDialog();
    assert.ok(autoTicketId !== null && autoTicketId > 0, "Debe generarse un boleto con ID.");
    console.log(`  Boleto general generado con éxito: #${autoTicketId}`);

    console.log("Paso 7: Navegando al resumen del boleto digital de asignación automática...");
    await reservationPage.navigateToDigitalTicket(autoTicketId!);
    const isAutoTicketActive = await reservationPage.waitForDigitalTicket(ctx.noAuditorioEventName);
    assert.equal(isAutoTicketActive, true, "El boleto general debe figurar como Activo con código QR.");
    console.log("  ✓ Caso 2 superado con éxito.");

    // =========================================================================
    // CASO 3: FLUJO ENTRADA LIBRE (Termina en UI05 sin opción de reservar)
    // =========================================================================
    console.log("\n--- CASO 3: Evento con Entrada Libre ---");
    console.log("Paso 1: Navegando a la Cartelera (UI04)...");
    await reservationPage.openCatalog();

    console.log(`Paso 2: Localizando evento con entrada libre '${ctx.freeEventName}'...`);
    await reservationPage.selectEventByTitle(ctx.freeEventName);

    console.log("Paso 3: Verificando pantalla de detalles (UI05)...");
    await reservationPage.waitForEventDetails(ctx.freeEventName);

    console.log("Paso 4: Validando insignias y aviso de entrada libre...");
    const isFree = await reservationPage.isFreeAdmission();
    assert.equal(isFree, true, "Debe exhibir la etiqueta 'Entrada libre' y el aviso de acceso por orden de llegada.");

    console.log("Paso 5: Verificando que NO exista botón de reservar...");
    const hasFreeReserveBtn = await reservationPage.hasReserveButton();
    assert.equal(hasFreeReserveBtn, false, "Los eventos de entrada libre no deben permitir reservar lugar (concluye en UI05).");
    console.log("  ✓ Caso 3 superado con éxito.");

    console.log("\n============================================================");
    console.log(">>> TODAS LAS PRUEBAS DE RESERVA DE BOLETOS PASARON (3/3) <<<");
    console.log("============================================================\n");
  } catch (err) {
    console.error("FATAL ERROR en runTicketReservationSuite:", err);
    throw err;
  } finally {
    if (ctx) {
      console.log("Limpiando datos de prueba...");
      await cleanupTestData(ctx);
    }
    await driver.quit();
  }
}

if (import.meta.main) {
  runTicketReservationSuite().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
