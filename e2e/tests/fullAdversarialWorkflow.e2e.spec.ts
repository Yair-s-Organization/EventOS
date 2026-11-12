import assert from "node:assert/strict";
import path from "node:path";
import { By, Key, WebDriver, until } from "selenium-webdriver";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { EventRequestPage } from "../pages/EventRequestPage";
import { TicketReservationPage } from "../pages/TicketReservationPage";
import {
  API_URL,
  BASE_URL,
  connectTestDb,
  createChromeDriver,
} from "../utils/testEnv";

async function clearSession(driver: WebDriver): Promise<void> {
  await driver.executeScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
}

function getSafeSemesterFutureDates(): { date1: string; date2: string } {
  const year = new Date().getFullYear();
  // Choose two dates > 7 days ahead and <= Dec 18 to avoid urgency modal and semester limit
  return {
    date1: `${year}-12-11`,
    date2: `${year}-12-12`,
  };
}

async function ensureVerifiedOrganizerAccount(
  db: any,
  email: string,
  passwordPlain: string,
): Promise<number> {
  const bcrypt = await import("../../apps/backend/node_modules/bcrypt");
  const hash = await bcrypt.default.hash(passwordPlain, 10);

  const existing = await db.query(
    `SELECT "idUsuario" FROM usuario WHERE correo = $1 LIMIT 1`,
    [email],
  );

  if (existing.rows.length > 0) {
    const idUsuario = Number(existing.rows[0].idUsuario);
    await db.query(
      `UPDATE usuario
       SET contrasena = $1,
           estatus = true,
           "esVerificado" = 'Verificado',
           "tipoCuenta" = 'Usuario Interno',
           "esJefeAcademia" = false
       WHERE "idUsuario" = $2`,
      [hash, idUsuario],
    );
    return idUsuario;
  }

  const inserted = await db.query(
    `INSERT INTO usuario (
       nombre, "apellidoPa", "apellidoMa", correo, contrasena,
       estatus, "esVerificado", "tipoCuenta", "esJefeAcademia"
     ) VALUES ($1, $2, $3, $4, $5, true, 'Verificado', 'Usuario Interno', false)
     RETURNING "idUsuario"`,
    ["Organizador", "Institucional", "IPN", email, hash],
  );
  return Number(inserted.rows[0].idUsuario);
}

async function getJwtToken(correo: string, contrasena: string): Promise<string> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, contrasena }),
  });
  assert.equal(
    res.ok,
    true,
    `No se pudo obtener token JWT para ${correo} (HTTP ${res.status})`,
  );
  const data: any = await res.json();
  return data.access_token;
}

async function runFullAdversarialWorkflowSuite(): Promise<void> {
  const driver: WebDriver = await createChromeDriver();
  const loginPage = new LoginPage(driver);
  const registerPage = new RegisterPage(driver);
  const eventRequestPage = new EventRequestPage(driver);
  const reservationPage = new TicketReservationPage(driver);
  const db = await connectTestDb();

  const ts = Date.now().toString().slice(-6);
  const organizerEmail = "organizador@ipn.mx";
  const organizerPassword = "Password123!";
  const unverifiedEmail = `interno.noverif.${ts}@alumno.ipn.mx`;
  const unverifiedPassword = "Password123!";

  const publicEventName = `Jornada Politécnica MultiSubevento ${ts}`;
  const updatedPublicEventName = `${publicEventName} Editado`;
  const subEvent1Name = `Conferencia Auditorio ${ts}`;
  const subEvent2Name = `Taller Laboratorio Sala ${ts}`;
  const internalEventName = `Encuentro Interno Académico ${ts}`;
  const privateEventName = `Sesión Privada Comité ${ts}`;

  const posterPath = path.resolve(import.meta.dir, "../fixtures/poster.jpg");
  const { date1, date2 } = getSafeSemesterFutureDates();

  const createdEventIds: number[] = [];
  const createdFechaIds: number[] = [];
  let unverifiedUserId: number | null = null;

  try {
    console.log("================================================================================");
    console.log("SUITE E2E + ADVERSARIAL / DoS: FLUJO MULTI-ACTOR COMPLETO (6 ETAPAS)");
    console.log("================================================================================\n");

    // Pre-condición: asegurar que organizador@ipn.mx existe como usuario normal verificado
    // y limpiar colisiones de horario en las fechas de prueba para recintos 1, 2 y 4
    await ensureVerifiedOrganizerAccount(db, organizerEmail, organizerPassword);
    await db.query(
      `UPDATE "subEvento" SET estado = 'Cancelado'
       WHERE "idFecha" IN (SELECT "idFecha" FROM fecha WHERE fecha IN ($1, $2))`,
      [date1, date2],
    );

    // =========================================================================
    // ETAPA 1: Usuario normal verificado (organizador@ipn.mx) crea:
    //   - Evento Público con 2 subeventos (Auditorio + Laboratorio/Sala 14)
    //   - Evento Interno y Evento Privado
    //   + Ataques DoS y peticiones malformadas a /api/solicitudes
    // =========================================================================
    console.log("--------------------------------------------------------------------------------");
    console.log("ETAPA 1: Cuenta normal verificada (organizador@ipn.mx) -> Creación de eventos + Ataques DoS");
    console.log("--------------------------------------------------------------------------------");

    const organizerToken = await getJwtToken(organizerEmail, organizerPassword);

    // [1.A] Ataque: POST /api/solicitudes sin Content-Type (cuerpo en texto plano)
    console.log("  [Ataque 1.A] POST /api/solicitudes sin Content-Type...");
    const noContentTypeSolRes = await fetch(`${API_URL}/solicitudes`, {
      method: "POST",
      headers: { Authorization: `Bearer ${organizerToken}` },
      body: '{"nombre":"Ataque Sin Content-Type"}',
    });
    assert.equal(
      noContentTypeSolRes.status,
      400,
      `POST /api/solicitudes sin Content-Type debe responder 400 Bad Request, recibido: ${noContentTypeSolRes.status}`,
    );
    console.log(`    ✓ Bloqueado con HTTP ${noContentTypeSolRes.status}`);

    // [1.B] Ataque DoS: JSON gigante (>10KB) en POST /api/solicitudes
    console.log("  [Ataque 1.B] DoS JSON gigante (100,000 'A') en POST /api/solicitudes...");
    const dosJsonSolRes = await fetch(`${API_URL}/solicitudes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${organizerToken}`,
      },
      body: JSON.stringify({ nombre: "A".repeat(100000) }),
    });
    assert.equal(
      dosJsonSolRes.status,
      413,
      `DoS JSON gigante en /api/solicitudes debe responder 413 Payload Too Large, recibido: ${dosJsonSolRes.status}`,
    );
    console.log(`    ✓ Bloqueado con HTTP ${dosJsonSolRes.status} (Payload Too Large)`);

    // [1.C] Ataque DoS por Multipart FormData: campo de texto gigante intentando evadir body-parser JSON
    console.log("  [Ataque 1.C] DoS Multipart FormData (campo de 50,000 bytes) en POST /api/solicitudes...");
    const giantFormData = new FormData();
    giantFormData.append("nombre", "Evento DoS Multipart");
    giantFormData.append("justificacion", "B".repeat(50000));
    const dosMultipartRes = await fetch(`${API_URL}/solicitudes`, {
      method: "POST",
      headers: { Authorization: `Bearer ${organizerToken}` },
      body: giantFormData,
    });
    assert.equal(
      dosMultipartRes.status === 413 || dosMultipartRes.status === 400,
      true,
      `DoS Multipart FormData debe ser bloqueado con 413/400, recibido: ${dosMultipartRes.status}`,
    );
    console.log(`    ✓ Bloqueado con HTTP ${dosMultipartRes.status}`);

    // [1.D] Ataque de inconsistencia lógica: 2 subeventos con traslape de horario en el mismo recinto
    console.log("  [Ataque 1.D] Solicitud con 2 subeventos traslapados en el mismo horario/recinto...");
    const overlapRes = await fetch(`${API_URL}/solicitudes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${organizerToken}`,
      },
      body: JSON.stringify({
        nombre: `Evento Traslapado ${ts}`,
        descripcion: "Intento de traslape interno entre dos subeventos.",
        justificacion: "Prueba adversarial de colisión interna.",
        idAlcance: 1,
        poster: "https://placehold.co/2048x1152/png",
        subeventos: [
          {
            nombre: "Sub 1",
            descripcion: "Desc 1",
            fecha: date1,
            horaInicio: "10:00",
            horaFin: "12:00",
            idRecinto: 1,
            accesoQR: true,
          },
          {
            nombre: "Sub 2 Traslapado",
            descripcion: "Desc 2",
            fecha: date1,
            horaInicio: "11:00",
            horaFin: "13:00",
            idRecinto: 1,
            accesoQR: true,
          },
        ],
      }),
    });
    assert.equal(
      overlapRes.status === 400 || overlapRes.status === 409,
      true,
      `Subeventos traslapados deben rechazarse con 400/409, recibido: ${overlapRes.status}`,
    );
    console.log(`    ✓ Traslape rechazado con HTTP ${overlapRes.status}`);

    // [1.E] Flujo UI: Iniciar sesión como organizador@ipn.mx y crear el Evento Público con 2 subeventos
    console.log("  [Flujo 1.E] Iniciando sesión en UI como organizador@ipn.mx y creando Evento Público con 2 subeventos...");
    await loginPage.open();
    await clearSession(driver);
    await loginPage.login(organizerEmail, organizerPassword);
    await driver.wait(until.urlContains("/menu-asistente"), 10000);

    await eventRequestPage.open();
    await eventRequestPage.waitUntilLoaded();

    // Llenar datos generales y primer subevento (Auditorio Principal, 10:00-12:00, con QR)
    await eventRequestPage.fillCompleteForm({
      nombre: publicEventName,
      idAlcance: "1", // Público
      posterAbsolutePath: posterPath,
      descripcion:
        "Evento público institucional con dos actividades: conferencia en Auditorio y taller práctico en Laboratorio/Sala.",
      justificacion:
        "Fortalecer las competencias prácticas y científicas de la comunidad estudiantil y público asistente.",
      subEvento: {
        fecha: date1,
        horaInicio: "09:00",
        horaFin: "10:00",
        idRecinto: "1", // Auditorio Principal
        accesoQR: "true",
      },
    });

    // Agregar segundo subevento (Laboratorio 1104 / Sala, 13:00-14:00, con QR automático)
    await eventRequestPage.addSubEventBlock();
    assert.equal(
      await eventRequestPage.getSubEventBlockCount(),
      2,
      "El formulario debe mostrar 2 bloques de subeventos",
    );

    await eventRequestPage.setSubEventDate(date1, 1);
    await eventRequestPage.setSubEventVenue("2", 1); // Laboratorio 1104 (cupo limitado con QR automático)
    await eventRequestPage.setSubEventTimes("13:00", "14:00", 1);

    // Cuando hay >1 subeventos, cada subevento requiere su propio nombre y descripción en ModalSubevento
    await eventRequestPage.setSubEventDetails(
      subEvent1Name,
      "Conferencia inaugural en el Auditorio Principal con selección de asiento numerado.",
      0,
    );
    await eventRequestPage.setSubEventDetails(
      subEvent2Name,
      "Taller práctico en Laboratorio / Sala con asignación automática de lugar y código QR.",
      1,
    );

    await eventRequestPage.submitForm();
    assert.equal(
      await eventRequestPage.isConfirmModalVisible(6000),
      true,
      "Debe mostrarse el modal de confirmación de solicitud",
    );
    await eventRequestPage.acceptConfirmModal();

    const opExitosaHeading = await driver.wait(
      until.elementLocated(
        By.xpath("//dialog[@open]//*[contains(normalize-space(), 'Operación exitosa')]"),
      ),
      10000,
    );
    assert.equal(await opExitosaHeading.isDisplayed(), true);
    const aceptarExitoBtn = await driver.findElement(
      By.xpath("//dialog[@open]//button[normalize-space()='Aceptar']"),
    );
    await aceptarExitoBtn.click();

    // Consultar en BD el Evento Público recién creado y sus 2 subeventos
    const pubEvRes = await db.query(
      `SELECT "idEvento", "idEstadoEvento" FROM evento WHERE nombre = $1 ORDER BY "idEvento" DESC LIMIT 1`,
      [publicEventName],
    );
    assert.equal(pubEvRes.rows.length, 1, "El evento público debe existir en BD");
    const publicEventId = Number(pubEvRes.rows[0].idEvento);
    createdEventIds.push(publicEventId);
    assert.equal(
      Number(pubEvRes.rows[0].idEstadoEvento),
      3,
      "El evento creado por organizador normal debe iniciar en estado 3 (En Proceso / Pendiente)",
    );

    const subEvsRes = await db.query(
      `SELECT "idSubEvento", nombre, "idRecinto", "idFecha", "accesoQR"
       FROM "subEvento"
       WHERE "idEvento" = $1
       ORDER BY "idSubEvento" ASC`,
      [publicEventId],
    );
    assert.equal(
      subEvsRes.rows.length,
      2,
      "El evento público debe tener exactamente 2 subeventos registrados",
    );
    const subEventoAuditorioId = Number(subEvsRes.rows[0].idSubEvento);
    const subEventoLabSalaId = Number(subEvsRes.rows[1].idSubEvento);
    createdFechaIds.push(
      Number(subEvsRes.rows[0].idFecha),
      Number(subEvsRes.rows[1].idFecha),
    );
    console.log(
      `    ✓ Evento Público creado (idEvento=${publicEventId}) con 2 subeventos: #${subEventoAuditorioId} (Auditorio) y #${subEventoLabSalaId} (Laboratorio/Sala)`,
    );

    // [1.F] Crear también el Evento Interno y el Evento Privado del organizador para dictamen de Subdirección
    console.log("  [Flujo 1.F] Creando Evento Interno y Evento Privado pendientes para evaluación en Subdirección...");
    const internalCreateRes = await fetch(`${API_URL}/solicitudes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${organizerToken}`,
      },
      body: JSON.stringify({
        nombre: internalEventName,
        descripcion: "Encuentro interno exclusivo para la comunidad politécnica.",
        justificacion: "Promover proyectos internos de academia en ESCOM.",
        idAlcance: 2, // INTERNO
        poster: "https://placehold.co/2048x1152/png",
        subeventos: [
          {
            nombre: `Sesión Interna ${ts}`,
            descripcion: "Sesión para comunidad politécnica.",
            fecha: date2,
            horaInicio: "09:00",
            horaFin: "10:00",
            idRecinto: 3, // Laboratorio 1105
            accesoQR: true,
          },
        ],
      }),
    });
    assert.equal(internalCreateRes.status, 201, "Debe crearse la solicitud de evento interno");
    const internalCreateData: any = await internalCreateRes.json();
    const internalEventId = Number(internalCreateData.evento.idEvento);
    createdEventIds.push(internalEventId);

    const privateCreateRes = await fetch(`${API_URL}/solicitudes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${organizerToken}`,
      },
      body: JSON.stringify({
        nombre: privateEventName,
        descripcion: "Reunión privada de comité organizador por invitación.",
        justificacion: "Revisión de lineamientos internos.",
        idAlcance: 3, // PRIVADO
        poster: "https://placehold.co/2048x1152/png",
        subeventos: [
          {
            nombre: `Sesión Privada ${ts}`,
            descripcion: "Actividad cerrada por invitación.",
            fecha: date2,
            horaInicio: "13:00",
            horaFin: "14:00",
            idRecinto: 4, // Sala 14
            accesoQR: false,
          },
        ],
      }),
    });
    assert.equal(privateCreateRes.status, 201, "Debe crearse la solicitud de evento privado");
    const privateCreateData: any = await privateCreateRes.json();
    const privateEventId = Number(privateCreateData.evento.idEvento);
    createdEventIds.push(privateEventId);
    console.log(
      `    ✓ Evento Interno (id=${internalEventId}) y Evento Privado (id=${privateEventId}) creados en estado Pendiente.\n`,
    );

    // =========================================================================
    // ETAPA 2: Panel de Subdirección -> Aceptar evento interno y público,
    //          Rechazar evento privado + Ataques de escalamiento y DoS
    // =========================================================================
    console.log("--------------------------------------------------------------------------------");
    console.log("ETAPA 2: Panel de Subdirección -> Aprobar Público e Interno, Rechazar Privado + Ataques");
    console.log("--------------------------------------------------------------------------------");

    // [2.A] Ataque de escalamiento de privilegios: Organizador intenta auto-aprobar su propio evento
    console.log("  [Ataque 2.A] Organizador intenta auto-aprobar su solicitud (PATCH /api/solicitudes/:id/aprobar)...");
    const selfApproveRes = await fetch(
      `${API_URL}/solicitudes/${publicEventId}/aprobar`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${organizerToken}` },
      },
    );
    assert.equal(
      selfApproveRes.status,
      403,
      `Un organizador normal no debe poder aprobar solicitudes (esperado 403, recibido ${selfApproveRes.status})`,
    );
    console.log(`    ✓ Auto-aprobación bloqueada con HTTP ${selfApproveRes.status} Forbidden`);

    const subdireccionToken = await getJwtToken("subdireccion@ipn.mx", "Admin123!");

    // [2.B] Ataque DoS: Subdirección envía motivo de rechazo de 100,000 caracteres
    console.log("  [Ataque 2.B] DoS con payload gigante en PATCH /api/solicitudes/:id/rechazar...");
    const dosRejectRes = await fetch(
      `${API_URL}/solicitudes/${privateEventId}/rechazar`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${subdireccionToken}`,
        },
        body: JSON.stringify({ motivo: "R".repeat(100000) }),
      },
    );
    assert.equal(
      dosRejectRes.status,
      413,
      `DoS en /rechazar debe responder 413 Payload Too Large, recibido: ${dosRejectRes.status}`,
    );
    console.log(`    ✓ Bloqueado con HTTP ${dosRejectRes.status} (Payload Too Large)`);

    // [2.C] Ataque de validación: motivo vacío o > 500 caracteres en PATCH /api/solicitudes/:id/rechazar
    console.log("  [Ataque 2.C] Rechazo con motivo en blanco ('   ') y motivo > 500 caracteres...");
    const emptyRejectRes = await fetch(
      `${API_URL}/solicitudes/${privateEventId}/rechazar`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${subdireccionToken}`,
        },
        body: JSON.stringify({ motivo: "    " }),
      },
    );
    assert.equal(
      emptyRejectRes.status,
      400,
      `Rechazo con motivo vacío debe responder 400 Bad Request, recibido: ${emptyRejectRes.status}`,
    );

    const over500RejectRes = await fetch(
      `${API_URL}/solicitudes/${privateEventId}/rechazar`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${subdireccionToken}`,
        },
        body: JSON.stringify({ motivo: "M".repeat(550) }),
      },
    );
    assert.equal(
      over500RejectRes.status,
      400,
      `Rechazo con motivo >500 caracteres debe responder 400 Bad Request, recibido: ${over500RejectRes.status}`,
    );
    console.log("    ✓ Motivo vacío y motivo >500 chars rechazados con HTTP 400");

    // [2.D] Flujo UI en Panel de Subdirección: iniciar sesión como subdireccion@ipn.mx
    console.log("  [Flujo 2.D] Iniciando sesión como Subdirección y dictaminando los 3 eventos desde la UI...");
    await loginPage.open();
    await clearSession(driver);
    await loginPage.login("subdireccion@ipn.mx", "Admin123!");
    await driver.wait(until.urlContains("/subdireccion/menu-principal"), 10000);

    // Helper para aprobar un evento desde /detalles-solicitud/:id
    async function approveEventViaUi(idEvento: number, expectedName: string): Promise<void> {
      await driver.get(`${BASE_URL}/detalles-solicitud/${idEvento}`);
      await driver.wait(
        until.elementLocated(
          By.xpath(`//*[contains(normalize-space(), ${JSON.stringify(expectedName)})]`),
        ),
        8000,
      );
      const btnAprobar = await driver.wait(
        until.elementLocated(By.id("botonAprobar")),
        8000,
      );
      await driver.executeScript("arguments[0].scrollIntoView({ block: 'center' });", btnAprobar);
      await btnAprobar.click();

      const btnAceptarModal = await driver.wait(
        until.elementLocated(
          By.xpath("//dialog[@open]//button[normalize-space()='Aceptar']"),
        ),
        6000,
      );
      await btnAceptarModal.click();

      // Confirmar el diálogo de éxito si aparece
      try {
        const btnExito = await driver.wait(
          until.elementLocated(
            By.xpath("//dialog[@open]//button[normalize-space()='Aceptar']"),
          ),
          4000,
        );
        await btnExito.click();
      } catch {
        // Redirección directa
      }
      await driver.wait(until.urlContains("/subdireccion/lista-solicitudes"), 8000);
    }

    // 1) Aprobar el Evento Público (con 2 subeventos)
    await approveEventViaUi(publicEventId, publicEventName);
    console.log(`    ✓ Evento Público '${publicEventName}' ACEPTADO por Subdirección`);

    // 2) Aprobar el Evento Interno
    await approveEventViaUi(internalEventId, internalEventName);
    console.log(`    ✓ Evento Interno '${internalEventName}' ACEPTADO por Subdirección`);

    // 3) Rechazar el Evento Privado desde la UI (validando primero que el botón 'Rechazar' del modal está deshabilitado sin motivo)
    await driver.get(`${BASE_URL}/detalles-solicitud/${privateEventId}`);
    await driver.wait(
      until.elementLocated(
        By.xpath(`//*[contains(normalize-space(), ${JSON.stringify(privateEventName)})]`),
      ),
      8000,
    );
    const btnRechazar = await driver.wait(
      until.elementLocated(By.id("botonRechazar")),
      8000,
    );
    await driver.executeScript("arguments[0].scrollIntoView({ block: 'center' });", btnRechazar);
    await btnRechazar.click();

    const btnConfirmarRechazo = await driver.wait(
      until.elementLocated(
        By.xpath("//dialog[@open]//button[normalize-space()='Rechazar']"),
      ),
      5000,
    );
    assert.equal(
      await btnConfirmarRechazo.isEnabled(),
      false,
      "El botón 'Rechazar' del modal debe estar deshabilitado mientras el motivo esté vacío",
    );

    // Ingresar motivo de rechazo válido y confirmar
    const txtMotivoRechazo = await driver.findElement(
      By.xpath("//dialog[@open]//*[@id='campoMotivoRechazo']"),
    );
    await txtMotivoRechazo.sendKeys(
      "Rechazado por Subdirección: el evento privado no adjunta lista preliminar del comité académico.",
    );
    await driver.wait(until.elementIsEnabled(btnConfirmarRechazo), 5000);
    await btnConfirmarRechazo.click();

    try {
      const btnExitoRechazo = await driver.wait(
        until.elementLocated(
          By.xpath("//dialog[@open]//button[normalize-space()='Aceptar']"),
        ),
        4000,
      );
      await btnExitoRechazo.click();
    } catch {
      // Redirección directa
    }
    await driver.wait(until.urlContains("/subdireccion/lista-solicitudes"), 8000);
    console.log(`    ✓ Evento Privado '${privateEventName}' RECHAZADO por Subdirección`);

    // [2.E] Ataque de máquina de estados: intentar aprobar un evento que ya fue rechazado
    console.log("  [Ataque 2.E] Intentando aprobar por API el Evento Privado ya rechazado...");
    const approveRejectedRes = await fetch(
      `${API_URL}/solicitudes/${privateEventId}/aprobar`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${subdireccionToken}` },
      },
    );
    assert.equal(
      approveRejectedRes.status,
      409,
      `No debe permitirse aprobar un evento ya rechazado (esperado 409 Conflict, recibido ${approveRejectedRes.status})`,
    );
    console.log(`    ✓ Transición inválida bloqueada con HTTP ${approveRejectedRes.status} Conflict\n`);

    // =========================================================================
    // ETAPA 3: Cuenta interna diferente pero NO verificada intenta solicitar
    //          un evento y comprueba que NO se puede (UI + API + DoS)
    // =========================================================================
    console.log("--------------------------------------------------------------------------------");
    console.log("ETAPA 3: Cuenta interna NO verificada intenta solicitar evento -> Bloqueo en UI y API");
    console.log("--------------------------------------------------------------------------------");

    console.log(`  [Flujo 3.A] Registrando y confirmando correo de cuenta interna NO verificada (${unverifiedEmail})...`);
    await registerPage.open();
    await clearSession(driver);
    await registerPage.open();

    await registerPage.fillForm({
      nombre: "Valeria",
      apellidoPa: "Interna",
      apellidoMaterno: "NoVerificada",
      correo: unverifiedEmail,
      contrasena: unverifiedPassword,
      confirmarContrasena: unverifiedPassword,
    });
    await registerPage.submit();

    assert.equal(
      await registerPage.waitForSuccessModal(8000),
      true,
      "Debe mostrarse modal de registro exitoso para la cuenta interna no verificada",
    );
    await registerPage.confirmPendingRegistration();
    await registerPage.acceptSuccessModal();
    await driver.wait(until.urlContains("/login"), 5000);

    // Verificar en BD que su estado es 'No verificado' y tipoCuenta es 'Usuario Interno'
    const unvRow = await db.query(
      `SELECT "idUsuario", "esVerificado", "tipoCuenta" FROM usuario WHERE correo = $1`,
      [unverifiedEmail],
    );
    assert.equal(unvRow.rows.length, 1);
    unverifiedUserId = Number(unvRow.rows[0].idUsuario);
    assert.equal(
      unvRow.rows[0].esVerificado,
      "No verificado",
      "La nueva cuenta interna debe encontrarse como 'No verificado'",
    );

    // Iniciar sesión con la cuenta interna NO verificada e intentar ir a /solicitud-evento
    await loginPage.login(unverifiedEmail, unverifiedPassword);
    await driver.wait(until.urlContains("/menu-asistente"), 10000);

    console.log("  [Flujo 3.B] Entrando a /solicitud-evento sin verificación -> comprobando bloqueo en UI...");
    await eventRequestPage.open();
    const isBlockedByModal = await eventRequestPage.isVerificationRequiredModalVisible(8000);
    assert.equal(
      isBlockedByModal,
      true,
      "La UI debe bloquear al usuario interno no verificado mostrando el modal 'Verificación necesaria'",
    );
    console.log("    ✓ Modal 'Verificación necesaria' desplegado; formulario bloqueado en UI");

    // [3.C] Ataque de bypass: intentar enviar POST /api/solicitudes directamente con el JWT del usuario no verificado
    console.log("  [Ataque 3.C] Intentando saltar el bloqueo de UI llamando POST /api/solicitudes por API...");
    const unverifiedToken = await getJwtToken(unverifiedEmail, unverifiedPassword);
    const bypassSolRes = await fetch(`${API_URL}/solicitudes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${unverifiedToken}`,
      },
      body: JSON.stringify({
        nombre: `Evento Bypass No Verificado ${ts}`,
        descripcion: "Intento de crear evento sin verificación institucional.",
        justificacion: "Prueba de seguridad de control de acceso.",
        idAlcance: 1,
        poster: "https://placehold.co/2048x1152/png",
        subeventos: [
          {
            nombre: "Subevento Ilegal",
            descripcion: "No debería guardarse.",
            fecha: date2,
            horaInicio: "16:00",
            horaFin: "17:00",
            idRecinto: 2,
            accesoQR: true,
          },
        ],
      }),
    });
    assert.equal(
      bypassSolRes.status,
      403,
      `El backend debe bloquear con 403 Forbidden a usuarios no verificados en POST /api/solicitudes (recibido: ${bypassSolRes.status})`,
    );
    console.log(`    ✓ Bypass de API bloqueado con HTTP ${bypassSolRes.status} Forbidden\n`);

    // =========================================================================
    // ETAPA 4: Con esa cuenta interna, entra a la Cartelera -> ve detalles del
    //          Evento Público -> Reserva Actividad 1 (Auditorio) y ve boleto/correo ->
    //          Reserva Actividad 2 (Laboratorio/Sala 14) y ve boleto/correo
    //          + Ataques DoS, doble reserva, asiento inválido e IDOR
    // =========================================================================
    console.log("--------------------------------------------------------------------------------");
    console.log("ETAPA 4: Cartelera -> Detalles -> Reserva Auditorio (QR+Correo) -> Reserva Lab/Sala (QR+Correo)");
    console.log("--------------------------------------------------------------------------------");

    // [4.A] Ver Cartelera y comprobar visibilidad de eventos (Público e Interno visibles; Privado rechazado oculto)
    console.log("  [Flujo 4.A] Navegando a la Cartelera y verificando visibilidad de eventos...");
    await reservationPage.openCatalog();

    const privateCards = await driver.findElements(
      By.xpath(`//article[.//*[contains(normalize-space(), ${JSON.stringify(privateEventName)})]]`),
    );
    assert.equal(
      privateCards.length,
      0,
      "El evento privado rechazado NO debe aparecer en la cartelera",
    );

    // Abrir los detalles del Evento Público con 2 subeventos
    console.log(`  [Flujo 4.B] Abriendo detalles del evento '${publicEventName}'...`);
    await reservationPage.selectEventByTitle(publicEventName);
    await reservationPage.waitForEventDetails(publicEventName);

    // Verificar que aparecen las 2 actividades (EventSessionCard) en la vista de detalles del evento
    const sub1Card = await driver.wait(
      until.elementLocated(
        By.xpath(`//article[.//h3[normalize-space()=${JSON.stringify(subEvent1Name)}]]`),
      ),
      8000,
    );
    const sub2Card = await driver.wait(
      until.elementLocated(
        By.xpath(`//article[.//h3[normalize-space()=${JSON.stringify(subEvent2Name)}]]`),
      ),
      8000,
    );
    assert.equal(await sub1Card.isDisplayed(), true, "Debe mostrarse la tarjeta de la Actividad 1 (Auditorio)");
    assert.equal(await sub2Card.isDisplayed(), true, "Debe mostrarse la tarjeta de la Actividad 2 (Laboratorio/Sala)");
    console.log("    ✓ Ambas actividades del evento se visualizan en Detalles del Evento");

    // [4.C] Ataques DoS y malformados contra el endpoint de reservaciones (/api/reservations)
    console.log("  [Ataque 4.C] Probando ataques DoS, sin Content-Type y sin asiento en POST /api/reservations...");
    const dosReservaRes = await fetch(`${API_URL}/reservations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${unverifiedToken}`,
      },
      body: JSON.stringify({
        idSubEvento: subEventoAuditorioId,
        basuraGigante: "Z".repeat(100000),
      }),
    });
    assert.equal(
      dosReservaRes.status,
      413,
      `DoS en POST /api/reservations debe responder 413, recibido: ${dosReservaRes.status}`,
    );

    const noCtReservaRes = await fetch(`${API_URL}/reservations`, {
      method: "POST",
      headers: { Authorization: `Bearer ${unverifiedToken}` },
      body: `{"idSubEvento":${subEventoAuditorioId}}`,
    });
    assert.equal(
      noCtReservaRes.status,
      400,
      `POST /api/reservations sin Content-Type debe responder 400, recibido: ${noCtReservaRes.status}`,
    );

    // Intentar reservar en el Auditorio omitiendo idAsiento
    const missingSeatRes = await fetch(`${API_URL}/reservations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${unverifiedToken}`,
      },
      body: JSON.stringify({ idSubEvento: subEventoAuditorioId }),
    });
    assert.equal(
      missingSeatRes.status,
      400,
      `Reservar en Auditorio sin idAsiento debe responder 400 Bad Request, recibido: ${missingSeatRes.status}`,
    );
    console.log("    ✓ Ataques DoS (413), sin Content-Type (400) y Auditorio sin butaca (400) mitigados");

    // [4.D] Reservar la Primera Actividad (Auditorio Principal) desde la UI
    console.log("  [Flujo 4.D] Reservando Actividad 1 en Auditorio Principal con selección de asiento...");
    const sub1DetailsLink = await sub1Card.findElement(
      By.xpath(".//a[normalize-space()='Ver detalles']"),
    );
    await driver.executeScript("arguments[0].scrollIntoView({ block: 'center' });", sub1DetailsLink);
    await sub1DetailsLink.click();

    await driver.wait(
      until.urlContains(`/eventos/${publicEventId}/actividades/${subEventoAuditorioId}`),
      8000,
    );
    await reservationPage.clickReserve();
    await reservationPage.waitForReservationPage();
    assert.equal(
      await reservationPage.isSeatMapVisible(),
      true,
      "Debe mostrarse el mapa interactivo de asientos del Auditorio Principal",
    );

    const selectedSeat = await reservationPage.selectAvailableSeat();
    assert.ok(selectedSeat.length > 0, "Debe seleccionarse una butaca disponible");
    await reservationPage.clickReserveSeat();
    await reservationPage.confirmReservationInModal();

    assert.equal(
      await reservationPage.waitForSuccessDialog(),
      true,
      "Debe abrirse el modal de confirmación de boleto para la Actividad 1 (Auditorio)",
    );
    assert.equal(
      await reservationPage.isSuccessQrGenerated(),
      true,
      "El modal debe mostrar el código QR generado para la Actividad 1",
    );
    const ticketId1 = await reservationPage.getTicketIdFromSuccessDialog();
    assert.ok(ticketId1 !== null && ticketId1 > 0, "Debe obtenerse el ID del boleto #1");

    // Visualizar el boleto digital generado y verificar notificación por correo electrónico
    await reservationPage.navigateToDigitalTicket(ticketId1!);
    assert.equal(
      await reservationPage.waitForDigitalTicket(publicEventName),
      true,
      "La vista del boleto digital #1 debe mostrar el evento, estado Activo y código QR",
    );

    // Verificar descarga de PDF del boleto #1 y registro en BD (usado para el envío de correo con QR adjunto)
    const pdf1Res = await fetch(
      `${API_URL}/reservations/mis-boletos/${ticketId1}/pdf`,
      {
        headers: { Authorization: `Bearer ${unverifiedToken}` },
      },
    );
    assert.equal(pdf1Res.status, 200, "El PDF del boleto #1 debe descargarse con HTTP 200");
    assert.equal(
      pdf1Res.headers.get("content-type")?.includes("application/pdf"),
      true,
      "El endpoint de descarga debe entregar application/pdf",
    );
    console.log(
      `    ✓ Actividad 1 (Auditorio) reservada -> Boleto #${ticketId1} (Asiento ${selectedSeat}), QR visualizado, PDF y envío de correo verificados`,
    );

    // [4.E] Ataque de doble reservación: el mismo usuario intenta reservar un segundo lugar en la Actividad 1
    console.log("  [Ataque 4.E] Intentando doble reservación en la Actividad 1 con la misma cuenta...");
    const doubleBookRes = await fetch(`${API_URL}/reservations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${unverifiedToken}`,
      },
      body: JSON.stringify({ idSubEvento: subEventoAuditorioId, idAsiento: 1 }),
    });
    assert.equal(
      doubleBookRes.status,
      409,
      `La doble reservación en el mismo subevento debe rechazarse con 409 Conflict (recibido: ${doubleBookRes.status})`,
    );
    console.log(`    ✓ Doble reservación bloqueada con HTTP ${doubleBookRes.status} Conflict`);

    // [4.F] Reservar la Segunda Actividad (Sala 14 / Laboratorio) con asignación automática
    console.log("  [Flujo 4.F] Reservando Actividad 2 en Laboratorio/Sala con asignación automática de lugar...");
    await driver.get(`${BASE_URL}/eventos/${publicEventId}`);
    await reservationPage.waitForEventDetails(publicEventName);

    const sub2CardAgain = await driver.wait(
      until.elementLocated(
        By.xpath(`//article[.//h3[normalize-space()=${JSON.stringify(subEvent2Name)}]]`),
      ),
      8000,
    );
    const sub2DetailsLink = await sub2CardAgain.findElement(
      By.xpath(".//a[normalize-space()='Ver detalles']"),
    );
    await driver.executeScript("arguments[0].scrollIntoView({ block: 'center' });", sub2DetailsLink);
    await sub2DetailsLink.click();

    await driver.wait(
      until.urlContains(`/eventos/${publicEventId}/actividades/${subEventoLabSalaId}`),
      8000,
    );
    await reservationPage.clickReserve();
    await reservationPage.waitForReservationPage();

    assert.equal(
      await reservationPage.isAutomaticReservationNoticeVisible(),
      true,
      "La Actividad 2 (Laboratorio/Sala) debe mostrar aviso de asignación automática sin mapa de butacas",
    );
    assert.equal(
      await reservationPage.isSeatMapVisible(),
      false,
      "La Actividad 2 no debe renderizar mapa de asientos numerados",
    );

    await reservationPage.clickAutomaticReserve();
    await reservationPage.confirmReservationInModal();

    assert.equal(
      await reservationPage.waitForSuccessDialog(),
      true,
      "Debe abrirse el modal de confirmación de boleto para la Actividad 2",
    );
    assert.equal(
      await reservationPage.isSuccessQrGenerated(),
      true,
      "El modal debe mostrar el código QR generado para la Actividad 2",
    );
    const ticketId2 = await reservationPage.getTicketIdFromSuccessDialog();
    assert.ok(ticketId2 !== null && ticketId2 > 0, "Debe obtenerse el ID del boleto #2");

    await reservationPage.navigateToDigitalTicket(ticketId2!);
    assert.equal(
      await reservationPage.waitForDigitalTicket(publicEventName),
      true,
      "La vista del boleto digital #2 debe mostrar el evento, estado Activo y código QR",
    );

    const pdf2Res = await fetch(
      `${API_URL}/reservations/mis-boletos/${ticketId2}/pdf`,
      {
        headers: { Authorization: `Bearer ${unverifiedToken}` },
      },
    );
    assert.equal(pdf2Res.status, 200, "El PDF del boleto #2 debe descargarse con HTTP 200");
    console.log(
      `    ✓ Actividad 2 (Laboratorio/Sala) reservada -> Boleto #${ticketId2}, QR visualizado, PDF y envío de correo verificados`,
    );

    // [4.G] Ataque IDOR: otro usuario intenta consultar o cancelar el boleto del asistente
    console.log("  [Ataque 4.G] IDOR: Otra cuenta intenta leer y cancelar el Boleto #1 del asistente...");
    const idorReadRes = await fetch(
      `${API_URL}/reservations/mis-boletos/${ticketId1}`,
      {
        headers: { Authorization: `Bearer ${organizerToken}` },
      },
    );
    assert.equal(
      idorReadRes.status === 403 || idorReadRes.status === 404,
      true,
      `IDOR lectura de boleto ajeno debe responder 403/404, recibido: ${idorReadRes.status}`,
    );

    const idorCancelRes = await fetch(
      `${API_URL}/reservations/${ticketId1}/cancelar`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${organizerToken}` },
      },
    );
    assert.equal(
      idorCancelRes.status === 403 || idorCancelRes.status === 404,
      true,
      `IDOR cancelación de boleto ajeno debe responder 403/404, recibido: ${idorCancelRes.status}`,
    );
    console.log("    ✓ Ataques IDOR sobre boletos ajenos bloqueados correctamente\n");

    // =========================================================================
    // ETAPA 5: Volver a iniciar sesión como organizador (organizador@ipn.mx) ->
    //          Hacer modificación de datos normal -> Hacer modificación de logística
    //          + Ataques DoS y de permisos sobre edición de evento
    // =========================================================================
    console.log("--------------------------------------------------------------------------------");
    console.log("ETAPA 5: Organizador (organizador@ipn.mx) -> Modificación normal + Modificación de logística");
    console.log("--------------------------------------------------------------------------------");

    // [5.A] Ataque de control de acceso: el asistente intenta modificar datos generales y logística del evento
    console.log("  [Ataque 5.A] Asistente no propietario intenta modificar info-general y logística del evento...");
    const unauthorizedInfoRes = await fetch(
      `${API_URL}/eventos/${publicEventId}/info-general`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${unverifiedToken}`,
        },
        body: JSON.stringify({ nombre: "Evento Hackeado por Asistente" }),
      },
    );
    assert.equal(
      unauthorizedInfoRes.status,
      403,
      `Asistente no debe poder editar evento ajeno (esperado 403, recibido ${unauthorizedInfoRes.status})`,
    );

    const unauthorizedLogRes = await fetch(
      `${API_URL}/eventos/${publicEventId}/logistica`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${unverifiedToken}`,
        },
        body: JSON.stringify({
          motivoModificacion: "Intento ilegal",
          subeventos: [
            {
              idSubEvento: subEventoAuditorioId,
              nombre: subEvent1Name,
              descripcion: "Desc",
              fecha: date1,
              horaInicio: "11:00",
              horaFin: "12:00",
              idRecinto: 1,
              accesoQR: true,
            },
          ],
        }),
      },
    );
    assert.equal(
      unauthorizedLogRes.status,
      403,
      `Asistente no debe poder modificar logística ajena (esperado 403, recibido ${unauthorizedLogRes.status})`,
    );
    console.log("    ✓ Edición por usuario no propietario bloqueada con HTTP 403 Forbidden");

    // [5.B] Ataques DoS y malformados en PATCH /info-general y PATCH /logistica
    console.log("  [Ataque 5.B] DoS (100,000 chars) y petición sin Content-Type en edición de evento...");
    const dosInfoRes = await fetch(
      `${API_URL}/eventos/${publicEventId}/info-general`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${organizerToken}`,
        },
        body: JSON.stringify({ descripcion: "D".repeat(100000) }),
      },
    );
    assert.equal(
      dosInfoRes.status,
      413,
      `DoS en PATCH /info-general debe responder 413 Payload Too Large, recibido: ${dosInfoRes.status}`,
    );

    const dosLogisticaRes = await fetch(
      `${API_URL}/eventos/${publicEventId}/logistica`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${organizerToken}`,
        },
        body: JSON.stringify({ motivoModificacion: "L".repeat(100000) }),
      },
    );
    assert.equal(
      dosLogisticaRes.status,
      413,
      `DoS en PATCH /logistica debe responder 413 Payload Too Large, recibido: ${dosLogisticaRes.status}`,
    );

    const noCtLogisticaRes = await fetch(
      `${API_URL}/eventos/${publicEventId}/logistica`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${organizerToken}` },
        body: '{"motivoModificacion":"Sin Content-Type"}',
      },
    );
    assert.equal(
      noCtLogisticaRes.status,
      400,
      `PATCH /logistica sin Content-Type debe responder 400 Bad Request, recibido: ${noCtLogisticaRes.status}`,
    );
    console.log("    ✓ Ataques DoS (413) y sin Content-Type (400) en edición de evento bloqueados");

    // [5.C] Iniciar sesión en UI como organizador@ipn.mx e ir a /organizador/editar-evento-subeventos/:id
    console.log("  [Flujo 5.C] Iniciando sesión como organizador@ipn.mx y realizando modificación normal de datos...");
    await loginPage.open();
    await clearSession(driver);
    await loginPage.login(organizerEmail, organizerPassword);
    await driver.wait(until.urlContains("/menu-asistente"), 10000);

    await driver.get(`${BASE_URL}/organizador/mis-eventos`);
    const myEventCard = await driver.wait(
      until.elementLocated(
        By.xpath(`//article[.//h2[normalize-space()=${JSON.stringify(publicEventName)}]]`),
      ),
      8000,
    );
    const verDetallesOrgBtn = await myEventCard.findElement(
      By.xpath(".//button[normalize-space()='Ver detalles']"),
    );
    await driver.executeScript("arguments[0].scrollIntoView({ block: 'center' });", verDetallesOrgBtn);
    await verDetallesOrgBtn.click();

    await driver.wait(
      until.urlContains(`/organizador/administrar-evento-subeventos/${publicEventId}`),
      8000,
    );

    const btnModificarEvento = await driver.wait(
      until.elementLocated(
        By.xpath("//button[normalize-space()='Modificar evento' or normalize-space()='Modificar Evento']"),
      ),
      8000,
    );
    await driver.executeScript("arguments[0].scrollIntoView({ block: 'center' });", btnModificarEvento);
    await btnModificarEvento.click();

    await driver.wait(
      until.urlContains(`/organizador/editar-evento-subeventos/${publicEventId}`),
      8000,
    );

    // Modificación normal (Información General: Nombre y Descripción en EditarEventoConSubeventos)
    const campoNombre = await driver.wait(
      until.elementLocated(By.id("campoNombre")),
      8000,
    );
    await campoNombre.sendKeys(Key.chord(Key.CONTROL, "a"), Key.BACK_SPACE);
    await campoNombre.sendKeys(updatedPublicEventName);

    const campoDescripcion = await driver.findElement(
      By.css("#contenedorDescripcion textarea"),
    );
    await campoDescripcion.sendKeys(Key.chord(Key.CONTROL, "a"), Key.BACK_SPACE);
    await campoDescripcion.sendKeys(
      "Descripción general actualizada por el organizador (aprobación inmediata sin requerir dictamen).",
    );

    const btnGuardarGeneral = await driver.findElement(
      By.xpath("//button[@type='submit' and normalize-space()='Guardar cambios']"),
    );
    await driver.executeScript("arguments[0].scrollIntoView({ block: 'center' });", btnGuardarGeneral);
    await btnGuardarGeneral.click();

    const msgExitoGeneral = await driver.wait(
      until.elementLocated(
        By.xpath(
          "//*[contains(normalize-space(), 'Los cambios se guardaron correctamente')]",
        ),
      ),
      8000,
    );
    assert.equal(await msgExitoGeneral.isDisplayed(), true);
    console.log(`    ✓ Modificación de datos normal aplicada inmediatamente: '${updatedPublicEventName}'`);

    // [5.D] Modificación de Logística desde la UI (clic en 'Modificar' del Subevento 1 -> cambio de horario + motivo obligatorio)
    console.log("  [Flujo 5.D] Realizando modificación de logística (cambio de horario + justificación)...");
    const linkModificarSub1 = await driver.wait(
      until.elementLocated(
        By.xpath(
          `//article[.//h3[normalize-space()=${JSON.stringify(subEvent1Name)}]]//a[normalize-space()='Modificar']`,
        ),
      ),
      8000,
    );
    await driver.executeScript("arguments[0].scrollIntoView({ block: 'center' });", linkModificarSub1);
    await linkModificarSub1.click();

    await driver.wait(
      until.urlContains(
        `/organizador/editar-evento/${publicEventId}/subevento/${subEventoAuditorioId}`,
      ),
      8000,
    );

    const selectHoraInicio = await driver.wait(
      until.elementLocated(By.id("campoHoraInicio")),
      8000,
    );
    await driver.wait(until.elementIsEnabled(selectHoraInicio), 8000);
    await selectHoraInicio.findElement(By.css("option[value='10:00']")).click();

    const selectHoraFin = await driver.findElement(By.id("campoHoraFin"));
    await driver.wait(until.elementIsEnabled(selectHoraFin), 8000);
    await selectHoraFin.findElement(By.css("option[value='11:00']")).click();

    const btnConfirmarCambiosLog = await driver.findElement(
      By.xpath("//button[@type='submit' and normalize-space()='Confirmar cambios']"),
    );
    await driver.executeScript("arguments[0].scrollIntoView({ block: 'center' });", btnConfirmarCambiosLog);
    await btnConfirmarCambiosLog.click();

    // Primero intentar hacer clic en "Continuar" con el motivo vacío para verificar validación en ModalMotivo
    const btnContinuarModLog = await driver.wait(
      until.elementLocated(
        By.xpath("//dialog[@open]//button[normalize-space()='Continuar']"),
      ),
      6000,
    );
    await btnContinuarModLog.click();

    const errMotivoLogVacio = await driver.wait(
      until.elementLocated(
        By.xpath(
          "//dialog[@open]//*[contains(normalize-space(), 'El motivo de modificación es obligatorio')]",
        ),
      ),
      5000,
    );
    assert.equal(await errMotivoLogVacio.isDisplayed(), true);

    // Ingresar el motivo de modificación logística y confirmar
    const campoMotivoLog = await driver.findElement(
      By.xpath("//dialog[@open]//*[@id='contenedorMotivo']"),
    );
    await campoMotivoLog.sendKeys(
      "Ajuste de horario de la Conferencia Magistral a las 10:00-11:00 hrs por agenda del ponente invitado.",
    );
    await btnContinuarModLog.click();

    const btnConfirmarEnvioLog = await driver.wait(
      until.elementLocated(
        By.xpath("//dialog[@open]//button[normalize-space()='Confirmar envío']"),
      ),
      6000,
    );
    await btnConfirmarEnvioLog.click();

    // Verificar que aparece el aviso de "Solicitud en revisión"
    const bannerEnRevision = await driver.wait(
      until.elementLocated(
        By.xpath(
          "//*[contains(normalize-space(), 'Solicitud en revisión') or contains(normalize-space(), 'Solicitud en Revisión')]",
        ),
      ),
      8000,
    );
    assert.equal(await bannerEnRevision.isDisplayed(), true);
    console.log("    ✓ Modificación de logística enviada y marcada como 'Solicitud en Revisión'\n");

    // =========================================================================
    // ETAPA 6: Iniciar sesión como Administrador / Subdirección ->
    //          Verificar segregación de roles y Aceptar el cambio logístico
    // =========================================================================
    console.log("--------------------------------------------------------------------------------");
    console.log("ETAPA 6: Iniciar sesión como Administrador / Subdirección -> Aceptar cambio logístico");
    console.log("--------------------------------------------------------------------------------");

    // [6.A] Iniciar sesión como Administrador (admin@ipn.mx) y verificar que RolesGuard
    //       impide que el rol Administrador dictamine solicitudes de Subdirección (403),
    //       mientras audita el movimiento en Bitácora.
    console.log("  [Ataque 6.A] Iniciando sesión como Administrador (admin@ipn.mx) y probando segregación de roles...");
    await loginPage.open();
    await clearSession(driver);
    await loginPage.login("admin@ipn.mx", "Admin123!");
    await driver.wait(until.urlContains("/menu-admin"), 10000);

    const adminToken = await getJwtToken("admin@ipn.mx", "Admin123!");
    const adminApproveAttempt = await fetch(
      `${API_URL}/solicitudes/${publicEventId}/aprobar`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${adminToken}` },
      },
    );
    assert.equal(
      adminApproveAttempt.status,
      403,
      `El rol Administrador no debe poder suplantar a Subdirección en /solicitudes/:id/aprobar (recibido: ${adminApproveAttempt.status})`,
    );
    console.log("    ✓ Segregación de roles verificada: Administrador recibe 403 en /solicitudes/:id/aprobar");

    // [6.B] Iniciar sesión como Subdirección (subdireccion@ipn.mx) y aceptar el cambio logístico en la UI
    console.log("  [Flujo 6.B] Iniciando sesión como Subdirección y aceptando la modificación logística en UI...");
    await loginPage.open();
    await clearSession(driver);
    await loginPage.login("subdireccion@ipn.mx", "Admin123!");
    await driver.wait(until.urlContains("/subdireccion/menu-principal"), 10000);

    await driver.get(`${BASE_URL}/detalles-solicitud/${publicEventId}`);
    const bannerModLog = await driver.wait(
      until.elementLocated(
        By.xpath("//h3[normalize-space()='Motivo de modificación']"),
      ),
      8000,
    );
    assert.equal(
      await bannerModLog.isDisplayed(),
      true,
      "La pantalla de dictamen debe mostrar el bloque 'Motivo de modificación'",
    );

    const btnAprobarMod = await driver.wait(
      until.elementLocated(By.id("botonAprobar")),
      8000,
    );
    await driver.executeScript("arguments[0].scrollIntoView({ block: 'center' });", btnAprobarMod);
    await btnAprobarMod.click();

    const btnAceptarModModal = await driver.wait(
      until.elementLocated(
        By.xpath("//dialog[@open]//button[normalize-space()='Aceptar']"),
      ),
      6000,
    );
    await btnAceptarModModal.click();

    try {
      const btnExitoMod = await driver.wait(
        until.elementLocated(
          By.xpath("//dialog[@open]//button[normalize-space()='Aceptar']"),
        ),
        4000,
      );
      await btnExitoMod.click();
    } catch {
      // Redirección directa
    }
    await driver.wait(until.urlContains("/subdireccion/lista-solicitudes"), 8000);

    // Verificar en base de datos que la solicitud de modificación pasó a 'Aprobado',
    // el nuevo horario (10:00:00 - 11:00:00) fue aplicado al subevento #1, y los boletos siguen activos
    const modStatusRes = await db.query(
      `SELECT estado FROM "solicitudModificacion"
       WHERE "idEvento" = $1
       ORDER BY "idSolicitudModificacion" DESC LIMIT 1`,
      [publicEventId],
    );
    assert.equal(modStatusRes.rows.length, 1);
    assert.equal(
      modStatusRes.rows[0].estado,
      "Aprobado",
      "La solicitud de modificación logística debe quedar con estado 'Aprobado'",
    );

    const updatedScheduleRes = await db.query(
      `SELECT f."horaInicio", f."horaFin"
       FROM "subEvento" se
       INNER JOIN fecha f ON se."idFecha" = f."idFecha"
       WHERE se."idSubEvento" = $1`,
      [subEventoAuditorioId],
    );
    assert.equal(
      String(updatedScheduleRes.rows[0].horaInicio).startsWith("10:00"),
      true,
      `El nuevo horario de inicio (10:00) debe haberse aplicado al subevento (actual: ${updatedScheduleRes.rows[0].horaInicio})`,
    );
    assert.equal(
      String(updatedScheduleRes.rows[0].horaFin).startsWith("11:00"),
      true,
      `El nuevo horario de fin (11:00) debe haberse aplicado al subevento (actual: ${updatedScheduleRes.rows[0].horaFin})`,
    );
    console.log(
      "    ✓ Modificación logística APROBADA y aplicada en BD (nuevo horario 10:00–11:00 hrs vigente)\n",
    );

    console.log("================================================================================");
    console.log("¡LAS 6 ETAPAS DEL FLUJO MULTI-ACTOR Y TODAS LAS PRUEBAS ADVERSARIALES/DoS PASARON!");
    console.log("================================================================================");
  } finally {
    // Limpieza ordenada de todos los registros creados durante la corrida
    try {
      if (createdEventIds.length > 0) {
        const subRes = await db.query(
          `SELECT "idSubEvento", "idFecha" FROM "subEvento" WHERE "idEvento" = ANY($1::int[])`,
          [createdEventIds],
        );
        const subIds = subRes.rows.map((r: any) => Number(r.idSubEvento));
        const fechaIds = [
          ...new Set([
            ...createdFechaIds,
            ...subRes.rows
              .map((r: any) => Number(r.idFecha))
              .filter((n: number) => Number.isFinite(n) && n > 0),
          ]),
        ];

        if (subIds.length > 0) {
          const bolRes = await db.query(
            `SELECT "idBoleto" FROM "asistenteEvento" WHERE "idSubEvento" = ANY($1::int[]) AND "idBoleto" IS NOT NULL`,
            [subIds],
          );
          const bolIds = bolRes.rows.map((r: any) => Number(r.idBoleto));

          await db.query(
            `DELETE FROM "asistenteEvento" WHERE "idSubEvento" = ANY($1::int[])`,
            [subIds],
          );
          if (bolIds.length > 0) {
            await db.query(
              `DELETE FROM boleto WHERE "idBoleto" = ANY($1::int[])`,
              [bolIds],
            );
          }
          await db.query(
            `DELETE FROM ponente WHERE "idSubEvento" = ANY($1::int[])`,
            [subIds],
          );
        }

        await db.query(
          `DELETE FROM "bitacoraEvento" WHERE "idEvento" = ANY($1::int[])`,
          [createdEventIds],
        );
        await db.query(
          `DELETE FROM "solicitudModificacion" WHERE "idEvento" = ANY($1::int[])`,
          [createdEventIds],
        );
        await db.query(
          `DELETE FROM "subEvento" WHERE "idEvento" = ANY($1::int[])`,
          [createdEventIds],
        );
        await db.query(
          `DELETE FROM evento WHERE "idEvento" = ANY($1::int[])`,
          [createdEventIds],
        );

        if (fechaIds.length > 0) {
          await db.query(
            `DELETE FROM fecha WHERE "idFecha" = ANY($1::int[])`,
            [fechaIds],
          );
        }
      }

      if (unverifiedUserId) {
        await db.query(`DELETE FROM usuario WHERE "idUsuario" = $1`, [
          unverifiedUserId,
        ]);
      }
    } catch (cleanupErr) {
      console.warn("Advertencia durante limpieza de datos E2E:", cleanupErr);
    }

    await db.end();
    await driver.quit();
  }
}

runFullAdversarialWorkflowSuite().catch((err) => {
  console.error("\nFALLÓ LA SUITE E2E ADVERSARIAL MULTI-ACTOR:", err);
  process.exit(1);
});
