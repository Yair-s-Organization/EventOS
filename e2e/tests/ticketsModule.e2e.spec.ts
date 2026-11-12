import assert from "node:assert/strict";
import { Builder, By, WebDriver, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";
import { LoginPage } from "../pages/LoginPage";
import { MyTicketsPage } from "../pages/MyTicketsPage";
import { connectTestDb } from "../utils/testEnv";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000/api";

interface TestContext {
  userAId: number;
  userAEmail: string;
  userBId: number;
  userBEmail: string;
  auditorioEventId: number;
  auditorioEventName: string;
  auditorioSubEventoId: number;
  asientoA5Id: number;
  boletoAuditorioId: number;
  generalEventId: number;
  generalEventName: string;
  generalSubEventoId: number;
  boletoGeneralId: number;
  usedEventId: number;
  usedEventName: string;
  usedSubEventoId: number;
  boletoUsedId: number;
  createdEventIds: number[];
  createdFechaIds: number[];
  createdSubEventoIds: number[];
  createdBoletoIds: number[];
  createdUserIds: number[];
}

async function clearSession(driver: WebDriver): Promise<void> {
  await driver.executeScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
}

async function setupTicketsTestData(): Promise<TestContext> {
  const bcrypt = await import("../../apps/backend/node_modules/bcrypt");
  const client = await connectTestDb();

  const timestamp = Date.now();
  const passwordHash = await bcrypt.default.hash("Password123!", 10);

  // 1. Crear Usuario A (dueño de los boletos) y Usuario B (usuario ajeno para pruebas de aislamiento/IDOR)
  const userAEmail = `asistente.tickets.${timestamp}@alumno.ipn.mx`;
  const resUserA = await client.query(
    `INSERT INTO usuario (nombre, "apellidoPa", "apellidoMa", correo, contrasena, estatus, "esVerificado", "tipoCuenta", "esJefeAcademia")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING "idUsuario";`,
    ["Esteban", "Dueño", "Tickets", userAEmail, passwordHash, true, "Verificado", "Asistente", false],
  );
  const userAId = resUserA.rows[0].idUsuario;

  const userBEmail = `intruso.tickets.${timestamp}@alumno.ipn.mx`;
  const resUserB = await client.query(
    `INSERT INTO usuario (nombre, "apellidoPa", "apellidoMa", correo, contrasena, estatus, "esVerificado", "tipoCuenta", "esJefeAcademia")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING "idUsuario";`,
    ["Intruso", "Ajeno", "Pruebas", userBEmail, passwordHash, true, "Verificado", "Asistente", false],
  );
  const userBId = resUserB.rows[0].idUsuario;

  const createdUserIds = [userAId, userBId];
  const createdEventIds: number[] = [];
  const createdFechaIds: number[] = [];
  const createdSubEventoIds: number[] = [];
  const createdBoletoIds: number[] = [];

  // Obtener organizador
  const resOrg = await client.query(
    `SELECT "idUsuario" FROM usuario WHERE "tipoCuenta" IN ('Usuario Interno', 'Subdirección', 'Administrador') LIMIT 1;`,
  );
  const organizerId = resOrg.rows.length > 0 ? resOrg.rows[0].idUsuario : userAId;

  // Fecha futura: dentro de 2 días
  const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  // Obtener asiento A5 de Auditorio Principal (idRecinto: 1)
  const resAsiento = await client.query(
    `SELECT "idAsiento" FROM asiento WHERE "idRecinto" = 1 AND fila = 'A' AND numero = 5 LIMIT 1;`,
  );
  assert.ok(resAsiento.rows.length > 0, "Debe existir el asiento A5 en Auditorio Principal");
  const asientoA5Id = resAsiento.rows[0].idAsiento;

  // ---------------------------------------------------------------------------
  // Evento 1: Auditorio (Con butaca A5 numerada)
  // ---------------------------------------------------------------------------
  const auditorioEventName = `Auditorio UI08 ${timestamp}`;
  const resEv1 = await client.query(
    `INSERT INTO evento (nombre, descripcion, poster, justificacion, "esUrgente", "idAlcance", "idEstadoEvento", "idOrganizador")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING "idEvento";`,
    [auditorioEventName, "Evento con asiento asignado en auditorio para pruebas de cancelación.", "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600", "Validación UI08", false, 1, 2, organizerId],
  );
  const auditorioEventId = resEv1.rows[0].idEvento;
  createdEventIds.push(auditorioEventId);

  const resF1 = await client.query(
    `INSERT INTO fecha (fecha, "horaInicio", "horaFin") VALUES ($1, $2, $3) RETURNING "idFecha";`,
    [futureDate, "10:00:00", "12:00:00"],
  );
  const f1Id = resF1.rows[0].idFecha;
  createdFechaIds.push(f1Id);

  const resSub1 = await client.query(
    `INSERT INTO "subEvento" ("accesoQR", estado, nombre, descripcion, "idEvento", "idRecinto", "idFecha")
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING "idSubEvento";`,
    [true, "Aceptado", `Magistral Auditorio ${timestamp}`, "SubEvento Auditorio", auditorioEventId, 1, f1Id],
  );
  const auditorioSubEventoId = resSub1.rows[0].idSubEvento;
  createdSubEventoIds.push(auditorioSubEventoId);

  const resBol1 = await client.query(
    `INSERT INTO boleto ("tokenQR", "idEstadoBoleto", "idAsiento") VALUES ($1, $2, $3) RETURNING "idBoleto";`,
    [`qr_auditorio_${timestamp}`, 1, asientoA5Id], // 1 = VALIDO
  );
  const boletoAuditorioId = resBol1.rows[0].idBoleto;
  createdBoletoIds.push(boletoAuditorioId);

  await client.query(
    `INSERT INTO "asistenteEvento" ("idUsuario", "idSubEvento", "idBoleto") VALUES ($1, $2, $3);`,
    [userAId, auditorioSubEventoId, boletoAuditorioId],
  );

  // ---------------------------------------------------------------------------
  // Evento 2: Sala 14 (Asignación automática general)
  // ---------------------------------------------------------------------------
  const generalEventName = `Taller Sala 14 UI08 ${timestamp}`;
  const resEv2 = await client.query(
    `INSERT INTO evento (nombre, descripcion, poster, justificacion, "esUrgente", "idAlcance", "idEstadoEvento", "idOrganizador")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING "idEvento";`,
    [generalEventName, "Evento general sin butaca para pruebas de cancelación de reservación.", "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600", "Validación UI08", false, 1, 2, organizerId],
  );
  const generalEventId = resEv2.rows[0].idEvento;
  createdEventIds.push(generalEventId);

  const resF2 = await client.query(
    `INSERT INTO fecha (fecha, "horaInicio", "horaFin") VALUES ($1, $2, $3) RETURNING "idFecha";`,
    [futureDate, "13:00:00", "15:00:00"],
  );
  const f2Id = resF2.rows[0].idFecha;
  createdFechaIds.push(f2Id);

  const resSub2 = await client.query(
    `INSERT INTO "subEvento" ("accesoQR", estado, nombre, descripcion, "idEvento", "idRecinto", "idFecha")
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING "idSubEvento";`,
    [true, "Aceptado", `Taller Automatización ${timestamp}`, "SubEvento Sala 14", generalEventId, 4, f2Id],
  );
  const generalSubEventoId = resSub2.rows[0].idSubEvento;
  createdSubEventoIds.push(generalSubEventoId);

  const resBol2 = await client.query(
    `INSERT INTO boleto ("tokenQR", "idEstadoBoleto", "idAsiento") VALUES ($1, $2, $3) RETURNING "idBoleto";`,
    [`qr_general_${timestamp}`, 1, null], // 1 = VALIDO
  );
  const boletoGeneralId = resBol2.rows[0].idBoleto;
  createdBoletoIds.push(boletoGeneralId);

  await client.query(
    `INSERT INTO "asistenteEvento" ("idUsuario", "idSubEvento", "idBoleto") VALUES ($1, $2, $3);`,
    [userAId, generalSubEventoId, boletoGeneralId],
  );

  // ---------------------------------------------------------------------------
  // Evento 3: Boleto Ya Utilizado / Escaneado (EstadoBoleto.UTILIZADO = 2)
  // ---------------------------------------------------------------------------
  const usedEventName = `Seminario Ingresado UI08 ${timestamp}`;
  const resEv3 = await client.query(
    `INSERT INTO evento (nombre, descripcion, poster, justificacion, "esUrgente", "idAlcance", "idEstadoEvento", "idOrganizador")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING "idEvento";`,
    [usedEventName, "Evento con boleto ya escaneado para probar imposibilidad de cancelar.", "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600", "Validación UI08", false, 1, 2, organizerId],
  );
  const usedEventId = resEv3.rows[0].idEvento;
  createdEventIds.push(usedEventId);

  const resF3 = await client.query(
    `INSERT INTO fecha (fecha, "horaInicio", "horaFin") VALUES ($1, $2, $3) RETURNING "idFecha";`,
    [futureDate, "16:00:00", "18:00:00"],
  );
  const f3Id = resF3.rows[0].idFecha;
  createdFechaIds.push(f3Id);

  const resSub3 = await client.query(
    `INSERT INTO "subEvento" ("accesoQR", estado, nombre, descripcion, "idEvento", "idRecinto", "idFecha")
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING "idSubEvento";`,
    [true, "Aceptado", `Seminario Concluido ${timestamp}`, "SubEvento Utilizado", usedEventId, 4, f3Id],
  );
  const usedSubEventoId = resSub3.rows[0].idSubEvento;
  createdSubEventoIds.push(usedSubEventoId);

  const resBol3 = await client.query(
    `INSERT INTO boleto ("tokenQR", "idEstadoBoleto", "idAsiento") VALUES ($1, $2, $3) RETURNING "idBoleto";`,
    [`qr_used_${timestamp}`, 2, null], // 2 = UTILIZADO / INGRESADO
  );
  const boletoUsedId = resBol3.rows[0].idBoleto;
  createdBoletoIds.push(boletoUsedId);

  await client.query(
    `INSERT INTO "asistenteEvento" ("idUsuario", "idSubEvento", "idBoleto") VALUES ($1, $2, $3);`,
    [userAId, usedSubEventoId, boletoUsedId],
  );

  await client.end();

  return {
    userAId,
    userAEmail,
    userBId,
    userBEmail,
    auditorioEventId,
    auditorioEventName,
    auditorioSubEventoId,
    asientoA5Id,
    boletoAuditorioId,
    generalEventId,
    generalEventName,
    generalSubEventoId,
    boletoGeneralId,
    usedEventId,
    usedEventName,
    usedSubEventoId,
    boletoUsedId,
    createdEventIds,
    createdFechaIds,
    createdSubEventoIds,
    createdBoletoIds,
    createdUserIds,
  };
}

async function cleanupTicketsTestData(ctx: TestContext): Promise<void> {
  const client = await connectTestDb();

  try {

    if (ctx.createdSubEventoIds.length > 0 || ctx.createdUserIds.length > 0) {
      await client.query(
        `DELETE FROM "asistenteEvento" WHERE "idSubEvento" = ANY($1::int[]) OR "idUsuario" = ANY($2::int[]);`,
        [ctx.createdSubEventoIds, ctx.createdUserIds],
      );
    }

    if (ctx.createdBoletoIds.length > 0) {
      await client.query(`DELETE FROM boleto WHERE "idBoleto" = ANY($1::int[]);`, [ctx.createdBoletoIds]);
    }

    if (ctx.createdSubEventoIds.length > 0) {
      await client.query(`DELETE FROM "subEvento" WHERE "idSubEvento" = ANY($1::int[]);`, [ctx.createdSubEventoIds]);
    }

    if (ctx.createdEventIds.length > 0) {
      await client.query(`DELETE FROM evento WHERE "idEvento" = ANY($1::int[]);`, [ctx.createdEventIds]);
    }

    if (ctx.createdFechaIds.length > 0) {
      await client.query(`DELETE FROM fecha WHERE "idFecha" = ANY($1::int[]);`, [ctx.createdFechaIds]);
    }

    if (ctx.createdUserIds.length > 0) {
      await client.query(`DELETE FROM usuario WHERE "idUsuario" = ANY($1::int[]);`, [ctx.createdUserIds]);
    }
  } catch (error) {
    console.warn("Advertencia al limpiar datos de prueba:", error);
  } finally {
    await client.end();
  }
}

async function runTicketsModuleSuite(): Promise<void> {
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
  const myTicketsPage = new MyTicketsPage(driver);

  let ctx: TestContext | null = null;

  try {
    console.log("=== INICIANDO SUITE DE PRUEBAS: MÓDULO DE BOLETOS (UI08) ===");
    console.log("Configurando usuarios y boletos con diferentes estados en la base de datos...");
    ctx = await setupTicketsTestData();

    // -------------------------------------------------------------------------
    // TC-TICKETS-01: Happy Path - Visualización de boletos activos y QR en UI08
    // -------------------------------------------------------------------------
    console.log("\nTC-TICKETS-01: Visualización de boletos activos y consulta de QR...");
    await loginPage.login(ctx.userAEmail, "Password123!");
    await driver.sleep(1500);

    await myTicketsPage.open();
    const auditorioCard = await myTicketsPage.getTicketCard(ctx.auditorioEventName);
    const auditorioStatus = await myTicketsPage.getCardStatus(auditorioCard);
    assert.equal(auditorioStatus, "Activo", "El boleto del auditorio debe figurar como Activo.");

    const hasCancelBtn = await myTicketsPage.hasCancelButton(auditorioCard);
    assert.equal(hasCancelBtn, true, "El boleto activo debe presentar la opción de cancelar asistencia.");

    console.log("  Consultando código QR digital (UI Boleto Digital)...");
    await myTicketsPage.clickVerQr(auditorioCard);
    await myTicketsPage.waitForDigitalTicket();

    const isQrUsable = await myTicketsPage.isQrActive();
    assert.equal(isQrUsable, true, "El boleto activo debe mostrar la imagen del código QR legible.");

    const hasPdf = await myTicketsPage.hasPdfOptions();
    assert.equal(hasPdf, true, "El boleto activo debe habilitar las opciones de PDF.");

    await myTicketsPage.clickDigitalTicketBack();
    console.log("  ✓ TC-TICKETS-01 superado.");

    // -------------------------------------------------------------------------
    // TC-TICKETS-02: Abortar cancelación de asistencia (Descartar modal)
    // -------------------------------------------------------------------------
    console.log("\nTC-TICKETS-02: Abortar cancelación de reservación en el diálogo...");
    const generalCard = await myTicketsPage.getTicketCard(ctx.generalEventName);
    await myTicketsPage.clickCancelTicket(generalCard);

    const isModalOpen = await myTicketsPage.waitForCancelDialog();
    assert.equal(isModalOpen, true, "El modal de confirmación debe presentarse.");

    await myTicketsPage.cancelDialogDismiss();
    await driver.sleep(500);

    const generalCardAfterDismiss = await myTicketsPage.getTicketCard(ctx.generalEventName);
    const statusAfterDismiss = await myTicketsPage.getCardStatus(generalCardAfterDismiss);
    assert.equal(statusAfterDismiss, "Activo", "La reservación debe permanecer Activa si se descarta el diálogo.");
    console.log("  ✓ TC-TICKETS-02 superado.");

    // -------------------------------------------------------------------------
    // TC-TICKETS-03: Cancelación exitosa de reservación
    // -------------------------------------------------------------------------
    console.log("\nTC-TICKETS-03: Cancelación efectiva de reservación...");
    await myTicketsPage.clickCancelTicket(generalCardAfterDismiss);
    await myTicketsPage.waitForCancelDialog();
    await myTicketsPage.cancelDialogConfirm();

    const isSuccess = await myTicketsPage.waitForSuccessCancellation();
    assert.equal(isSuccess, true, "Debe desplegarse el mensaje de éxito de cancelación.");

    const generalCardCancelled = await myTicketsPage.waitForTicketStatus(ctx.generalEventName, "Cancelado");
    const cancelledStatus = await myTicketsPage.getCardStatus(generalCardCancelled);
    assert.equal(cancelledStatus, "Cancelado", "El boleto cancelado debe exhibir el estado 'Cancelado'.");

    const hasCancelAfter = await myTicketsPage.hasCancelButton(generalCardCancelled);
    assert.equal(hasCancelAfter, false, "Un boleto cancelado NO debe mostrar botón para volver a cancelarse.");

    const hasDetailsBtn = await myTicketsPage.hasVerDetallesButton(generalCardCancelled);
    assert.equal(hasDetailsBtn, true, "El botón 'Ver QR' debe transformarse en 'Ver detalles'.");
    console.log("  ✓ TC-TICKETS-03 superado.");

    // -------------------------------------------------------------------------
    // TC-TICKETS-04: Inconsistencia/Seguridad en boleto cancelado (QR deshabilitado)
    // -------------------------------------------------------------------------
    console.log("\nTC-TICKETS-04: Verificación de QR deshabilitado en boleto cancelado...");
    await myTicketsPage.clickVerDetalles(generalCardCancelled);
    await myTicketsPage.waitForDigitalTicket();

    const isQrNotice = await myTicketsPage.isQrDisabledNoticeVisible();
    assert.equal(isQrNotice, true, "El boleto cancelado debe advertir que el QR no está habilitado para el ingreso.");

    const isQrVisibleCancelled = await myTicketsPage.isQrActive();
    assert.equal(isQrVisibleCancelled, false, "El código QR no debe mostrarse como activo.");

    await myTicketsPage.clickDigitalTicketBack();
    console.log("  ✓ TC-TICKETS-04 superado.");

    // -------------------------------------------------------------------------
    // TC-TICKETS-05: Inconsistencia de Regla de Negocio - Liberación de Lugar (Seat Recovery)
    // -------------------------------------------------------------------------
    console.log("\nTC-TICKETS-05: Regla de negocio - Liberación inmediata de butaca al cancelar...");
    // 1. Verificar vía API que A5 está ocupado
    const dispPre = await fetch(`${API_BASE_URL}/reservations/disponibilidad/${ctx.auditorioSubEventoId}`);
    const dataDispPre = await dispPre.json();
    const asientoPre = (dataDispPre.asientos || []).find((a: any) => a.idAsiento === ctx.asientoA5Id);
    assert.equal(asientoPre?.ocupado, true, "El asiento A5 debe figurar como OCUPADO antes de cancelar.");

    // 2. Cancelar el boleto de auditorio en la UI
    const auditorioCardToCancel = await myTicketsPage.getTicketCard(ctx.auditorioEventName);
    await myTicketsPage.clickCancelTicket(auditorioCardToCancel);
    await myTicketsPage.waitForCancelDialog();
    await myTicketsPage.cancelDialogConfirm();
    await myTicketsPage.waitForSuccessCancellation();

    // 3. Verificar que A5 quedó liberado (ocupado: false)
    const dispPost = await fetch(`${API_BASE_URL}/reservations/disponibilidad/${ctx.auditorioSubEventoId}`);
    const dataDispPost = await dispPost.json();
    const asientoPost = (dataDispPost.asientos || []).find((a: any) => a.idAsiento === ctx.asientoA5Id);
    assert.equal(asientoPost?.ocupado, false, "El asiento A5 debe figurar como LIBRE (ocupado: false) tras la cancelación.");
    console.log("  ✓ TC-TICKETS-05 superado (Butaca A5 recuperada y disponible).");

    // -------------------------------------------------------------------------
    // TC-TICKETS-06: Inconsistencia de Integridad - Doble cancelación rechazada
    // -------------------------------------------------------------------------
    console.log("\nTC-TICKETS-06: Inconsistencia de integridad - Rechazo a doble cancelación vía API...");
    // Obtener token del usuario A almacenado en localStorage
    const tokenUserA: string = await driver.executeScript(() => localStorage.getItem("token") || "");
    const resDobleCancel = await fetch(`${API_BASE_URL}/reservations/${ctx.boletoGeneralId}/cancelar`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${tokenUserA}`,
        "Content-Type": "application/json",
      },
    });
    assert.equal(resDobleCancel.status, 409, "Doble cancelación debe retornar 409 Conflict.");
    const bodyDobleCancel = await resDobleCancel.json();
    assert.ok(
      bodyDobleCancel.message?.includes("ya se encontraba cancelada"),
      `Mensaje esperado de conflicto. Obtenido: ${JSON.stringify(bodyDobleCancel)}`,
    );
    console.log("  ✓ TC-TICKETS-06 superado (409 Conflict recibido correctamente).");

    // -------------------------------------------------------------------------
    // TC-TICKETS-07: Inconsistencia de Seguridad - Aislamiento de Usuario (IDOR)
    // -------------------------------------------------------------------------
    console.log("\nTC-TICKETS-07: Inconsistencia de seguridad - Aislamiento entre usuarios (IDOR)...");
    await clearSession(driver);
    await loginPage.login(ctx.userBEmail, "Password123!");
    await driver.sleep(1500);

    const tokenUserB: string = await driver.executeScript(() => localStorage.getItem("token") || "");

    // 1. Intento de cancelación no autorizada del boleto ajeno
    const resIdorCancel = await fetch(`${API_BASE_URL}/reservations/${ctx.boletoAuditorioId}/cancelar`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${tokenUserB}`,
        "Content-Type": "application/json",
      },
    });
    assert.equal(resIdorCancel.status, 404, "Usuario no autorizado debe recibir 404/Not Found para boleto ajeno.");

    // 2. Intento de visualización directa del boleto ajeno en UI
    await myTicketsPage.openDigitalTicket(ctx.boletoAuditorioId);
    const alertElement = await driver.wait(until.elementLocated(By.xpath("//*[@role='alert']")), 6000);
    const alertText = await alertElement.getText();
    assert.ok(
      alertText.length > 0,
      "La UI debe desplegar alerta de error ante el intento de ver un boleto de otro usuario.",
    );
    console.log("  ✓ TC-TICKETS-07 superado (Acceso indebido bloqueado y aislado).");

    // -------------------------------------------------------------------------
    // TC-TICKETS-08: Inconsistencia de Estado - Imposibilidad de cancelar boleto utilizado
    // -------------------------------------------------------------------------
    console.log("\nTC-TICKETS-08: Inconsistencia de estado - Boleto escaneado/ingresado no cancelable...");
    await clearSession(driver);
    await loginPage.login(ctx.userAEmail, "Password123!");
    await driver.sleep(1500);

    await myTicketsPage.open();
    const usedCard = await myTicketsPage.getTicketCard(ctx.usedEventName);
    const usedStatus = await myTicketsPage.getCardStatus(usedCard);
    assert.equal(usedStatus, "Ingresado", "El boleto escaneado debe ostentar el estado 'Ingresado'.");

    const hasCancelOnUsed = await myTicketsPage.hasCancelButton(usedCard);
    assert.equal(hasCancelOnUsed, false, "Un boleto ya ingresado NO debe presentar botón para cancelar asistencia.");

    const tokenUserARelogin: string = await driver.executeScript(() => localStorage.getItem("token") || "");
    const resCancelUsed = await fetch(`${API_BASE_URL}/reservations/${ctx.boletoUsedId}/cancelar`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${tokenUserARelogin}`,
        "Content-Type": "application/json",
      },
    });
    assert.equal(resCancelUsed.status, 409, "Cancelar boleto ya ingresado debe retornar 409 Conflict.");
    const bodyCancelUsed = await resCancelUsed.json();
    assert.ok(
      bodyCancelUsed.message?.includes("ya fue escaneado"),
      `Mensaje esperado de boleto escaneado. Obtenido: ${JSON.stringify(bodyCancelUsed)}`,
    );
    console.log("  ✓ TC-TICKETS-08 superado (Cancelación prevenida en boletos utilizados).");

    // -------------------------------------------------------------------------
    // TC-TICKETS-09: Inconsistencia de Identificador - Boleto inexistente (404 UI)
    // -------------------------------------------------------------------------
    console.log("\nTC-TICKETS-09: Inconsistencia de identificador - Acceso a ID inexistente...");
    await myTicketsPage.openDigitalTicket(999999);
    const notFoundAlert = await driver.wait(until.elementLocated(By.xpath("//*[@role='alert']")), 6000);
    const notFoundText = await notFoundAlert.getText();
    assert.ok(
      notFoundText.includes("No tienes acceso") ||
        notFoundText.includes("no existe") ||
        notFoundText.includes("No fue posible") ||
        notFoundText.includes("no válido") ||
        notFoundText.includes("404"),
      `La UI debe manejar elegantemente el 404. Obtenido: ${notFoundText}`,
    );
    console.log("  ✓ TC-TICKETS-09 superado (Error 404 controlado en UI sin crash).");

    // -------------------------------------------------------------------------
    // TC-TICKETS-10: Filtros y Búsqueda en UI08
    // -------------------------------------------------------------------------
    console.log("\nTC-TICKETS-10: Filtrado por estado y búsqueda con manejo de estado vacío...");
    await myTicketsPage.open();

    // 1. Búsqueda sin coincidencias
    await myTicketsPage.search("EventoInexistente99999XYZ");
    const isNoFound = await myTicketsPage.isNoTicketsFound();
    assert.equal(isNoFound, true, "Debe mostrar el mensaje de que no se encontraron registros.");

    // 2. Limpiar filtros
    await myTicketsPage.clickClearFilters();
    const isRestored = await myTicketsPage.hasCancelButton(await myTicketsPage.getTicketCard(ctx.auditorioEventName)).catch(() => false);
    // Verificar que volvieron las tarjetas
    const cardsAfterClear = await driver.findElements(By.css("article"));
    assert.ok(cardsAfterClear.length >= 2, "Limpiar filtros debe restaurar la lista de boletos.");

    // 3. Filtrar por estado Cancelado
    await myTicketsPage.filterByStatus("cancelled");
    const cancelledCards = await driver.findElements(By.css("article"));
    for (const card of cancelledCards) {
      const st = await myTicketsPage.getCardStatus(card);
      assert.equal(st, "Cancelado", "Con filtro 'Cancelado' todos los boletos deben ser cancelados.");
    }

    console.log("  ✓ TC-TICKETS-10 superado (Filtros y estados vacíos validados).");

    console.log("\n============================================================");
    console.log(">>> TODAS LAS PRUEBAS DEL MÓDULO DE BOLETOS PASARON (10/10) <<<");
    console.log("============================================================\n");
  } catch (err) {
    console.error("FATAL ERROR en runTicketsModuleSuite:", err);
    throw err;
  } finally {
    if (ctx) {
      console.log("Limpiando datos de prueba...");
      await cleanupTicketsTestData(ctx);
    }
    await driver.quit();
  }
}

if (import.meta.main) {
  runTicketsModuleSuite().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
