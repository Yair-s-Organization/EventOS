import assert from "node:assert/strict";
import { By, Key, WebDriver, until } from "selenium-webdriver";
import { LoginPage } from "../pages/LoginPage";
import {
  API_URL,
  BASE_URL,
  connectTestDb,
  createChromeDriver,
} from "../utils/testEnv";

async function registerConfirmedUser(
  db: any,
  email: string,
  password: string,
  nombre: string,
  apellidoPa: string,
): Promise<{ idUsuario: number; token: string }> {
  const regRes = await fetch(`${API_URL}/auth/registro`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre,
      apellidoPa,
      apellidoMa: "Logistica",
      correo: email,
      contrasena: password,
    }),
  });
  assert.equal(regRes.ok, true, `Failed to register user ${email}`);
  const regData: any = await regRes.json();
  const confirmToken = regData.token ?? regData.tokenConfirmacion;

  const confirmRes = await fetch(`${API_URL}/auth/confirmar-registro`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: confirmToken }),
  });
  assert.equal(confirmRes.ok, true, `Failed to confirm user ${email}`);

  const userRes = await db.query(
    `UPDATE usuario
     SET "esVerificado" = 'Verificado', "estatus" = true
     WHERE correo = $1
     RETURNING "idUsuario"`,
    [email],
  );
  const idUsuario = Number(userRes.rows[0].idUsuario);

  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      correo: email,
      contrasena: password,
      captchaToken: "e2e-bypass",
    }),
  });
  assert.equal(loginRes.ok, true, `Failed to login user ${email}`);
  const loginData: any = await loginRes.json();

  return { idUsuario, token: loginData.access_token };
}

async function seedLogisticsScenario(
  db: any,
  idLogisticaUser: number,
  idAsistenteUser: number,
  eventName: string,
  qrToken: string,
) {
  const recintoRes = await db.query(
    `SELECT "idRecinto", aforo FROM recinto WHERE nombre = 'Sala 14' LIMIT 1`,
  );
  const idRecinto = Number(recintoRes.rows[0].idRecinto);
  const aforo = Number(recintoRes.rows[0].aforo);

  const year = new Date().getFullYear();
  const futureDate = `${year}-12-12`;

  const fechaRes = await db.query(
    `INSERT INTO fecha (fecha, "horaInicio", "horaFin")
     VALUES ($1, '13:00:00', '15:00:00')
     RETURNING "idFecha"`,
    [futureDate],
  );
  const idFecha = Number(fechaRes.rows[0].idFecha);

  const eventoRes = await db.query(
    `INSERT INTO evento (
       nombre,
       descripcion,
       justificacion,
       poster,
       "idAlcance",
       "idEstadoEvento",
       "esUrgente",
       "idOrganizador"
     ) VALUES ($1, $2, $3, $4, 1, 2, false, $5)
     RETURNING "idEvento"`,
    [
      eventName,
      "Evento de prueba para el módulo de logística y control de acceso por QR.",
      "Validar el control de aforo y escaneo de entradas en puerta.",
      "https://placehold.co/2048x1152/png",
      idLogisticaUser,
    ],
  );
  const idEvento = Number(eventoRes.rows[0].idEvento);

  const subEventoRes = await db.query(
    `INSERT INTO "subEvento" (
       nombre,
       descripcion,
       "accesoQR",
       estado,
       "idEvento",
       "idFecha",
       "idRecinto"
     ) VALUES ($1, $2, true, 'Aceptado', $3, $4, $5)
     RETURNING "idSubEvento"`,
    [
      `Taller de Ciberseguridad - ${eventName}`,
      "Actividad práctica con control de acceso QR en Sala 14.",
      idEvento,
      idFecha,
      idRecinto,
    ],
  );
  const idSubEvento = Number(subEventoRes.rows[0].idSubEvento);

  // Assign user as Personal de Logística for this event
  await db.query(
    `INSERT INTO "eventoPersonalLogistica" ("idEvento", "idUsuario")
     VALUES ($1, $2)`,
    [idEvento, idLogisticaUser],
  );

  // Create a valid ticket (EstadoBoleto.VALIDO = 1) and link it in asistenteEvento
  const boletoRes = await db.query(
    `INSERT INTO boleto ("tokenQR", "idEstadoBoleto")
     VALUES ($1, 1)
     RETURNING "idBoleto"`,
    [qrToken],
  );
  const idBoleto = Number(boletoRes.rows[0].idBoleto);

  await db.query(
    `INSERT INTO "asistenteEvento" ("idUsuario", "idSubEvento", "idBoleto")
     VALUES ($1, $2, $3)`,
    [idAsistenteUser, idSubEvento, idBoleto],
  );

  return { idEvento, idSubEvento, idFecha, idBoleto, aforo };
}

async function runLogisticsAccessControlSuite(): Promise<void> {
  const driver: WebDriver = await createChromeDriver();
  const loginPage = new LoginPage(driver);
  const db = await connectTestDb();

  const uniqueSuffix = Date.now().toString().slice(-6);
  const logisticaEmail = `logistica.e2e.${uniqueSuffix}@alumno.ipn.mx`;
  const asistenteEmail = `asistente.qr.${uniqueSuffix}@alumno.ipn.mx`;
  const unauthorizedEmail = `noautorizado.${uniqueSuffix}@alumno.ipn.mx`;
  const password = "Password123!";
  const eventName = `Foro Logística QR ${uniqueSuffix}`;
  const qrToken = `QR-E2E-TOKEN-${uniqueSuffix}`;

  let logisticaUser: { idUsuario: number; token: string } | null = null;
  let asistenteUser: { idUsuario: number; token: string } | null = null;
  let unauthorizedUser: { idUsuario: number; token: string } | null = null;
  let seeded: {
    idEvento: number;
    idSubEvento: number;
    idFecha: number;
    idBoleto: number;
    aforo: number;
  } | null = null;

  try {
    logisticaUser = await registerConfirmedUser(
      db,
      logisticaEmail,
      password,
      "Mateo",
      "Portero",
    );
    asistenteUser = await registerConfirmedUser(
      db,
      asistenteEmail,
      password,
      "Lucía",
      "Visitante",
    );
    unauthorizedUser = await registerConfirmedUser(
      db,
      unauthorizedEmail,
      password,
      "Pedro",
      "Externo",
    );

    seeded = await seedLogisticsScenario(
      db,
      logisticaUser.idUsuario,
      asistenteUser.idUsuario,
      eventName,
      qrToken,
    );

    // =========================================================================
    // TC-LOG-01: Logistics user visits /panel-eventos-asignados and sees assigned subevent card
    // =========================================================================
    console.log(
      "Running TC-LOG-01: Logistics staff logs in -> /panel-eventos-asignados shows assigned subevent...",
    );
    await loginPage.login(logisticaEmail, password);
    await driver.wait(until.urlContains("/menu-asistente"), 10000);

    await driver.get(`${BASE_URL}/panel-eventos-asignados`);
    const heading = await driver.wait(
      until.elementLocated(
        By.xpath("//h1[normalize-space()='Mis Eventos Asignados']"),
      ),
      8000,
    );
    assert.equal(await heading.isDisplayed(), true);

    const assignedCardHeading = await driver.wait(
      until.elementLocated(
        By.xpath(`//h3[normalize-space()='${eventName}']`),
      ),
      8000,
    );
    assert.equal(await assignedCardHeading.isDisplayed(), true);
    console.log("  ✓ TC-LOG-01 passed");

    // =========================================================================
    // TC-LOG-02: Search filter, empty state, and 'Limpiar filtros' on /panel-eventos-asignados
    // =========================================================================
    console.log(
      "Running TC-LOG-02: Search filter & 'Limpiar filtros' on /panel-eventos-asignados...",
    );
    const searchInput = await driver.findElement(
      By.css("input[placeholder='Buscar evento o actividad...']"),
    );
    await searchInput.clear();
    await searchInput.sendKeys("SUBEVENTO-INEXISTENTE-999");

    const noMatchHeading = await driver.wait(
      until.elementLocated(
        By.xpath(
          "//h2[normalize-space()='No encontramos eventos con esos filtros']",
        ),
      ),
      5000,
    );
    assert.equal(await noMatchHeading.isDisplayed(), true);

    const limpiarBtn = await driver.findElement(
      By.xpath("//button[normalize-space()='Limpiar filtros']"),
    );
    await limpiarBtn.click();

    const restoredCard = await driver.wait(
      until.elementLocated(
        By.xpath(`//h3[normalize-space()='${eventName}']`),
      ),
      5000,
    );
    assert.equal(await restoredCard.isDisplayed(), true);
    console.log("  ✓ TC-LOG-02 passed");

    // =========================================================================
    // TC-LOG-03: Click 'Control de Acceso' -> /control-acceso/:idSubEvento shows initial 0/aforo and empty attendee list
    // =========================================================================
    console.log(
      "Running TC-LOG-03: Navigate to /control-acceso/:idSubEvento and verify initial 0/aforo state...",
    );
    const controlAccesoBtn = await driver.findElement(
      By.xpath("//button[normalize-space()='Control de Acceso']"),
    );
    await controlAccesoBtn.click();

    await driver.wait(
      until.urlContains(`/control-acceso/${seeded.idSubEvento}`),
      8000,
    );

    const controlHeading = await driver.wait(
      until.elementLocated(
        By.xpath("//h1[normalize-space()='Control de Acceso']"),
      ),
      8000,
    );
    assert.equal(await controlHeading.isDisplayed(), true);

    const initialCapacity = await driver.wait(
      until.elementLocated(
        By.xpath(`//*[normalize-space()='0/${seeded.aforo}']`),
      ),
      5000,
    );
    assert.equal(await initialCapacity.isDisplayed(), true);

    const emptyAttendeeMsg = await driver.findElement(
      By.xpath(
        "//td[contains(normalize-space(),'Ningún asistente ha accedido todavía.')]",
      ),
    );
    assert.equal(await emptyAttendeeMsg.isDisplayed(), true);
    console.log("  ✓ TC-LOG-03 passed");

    // =========================================================================
    // TC-LOG-04: Click 'Abrir Escáner' -> /escanear-boleto/:idSubEvento renders scanner view
    // =========================================================================
    console.log(
      "Running TC-LOG-04: Click 'Abrir Escáner' -> /escanear-boleto/:idSubEvento...",
    );
    const abrirEscanerBtn = await driver.findElement(
      By.xpath("//button[contains(normalize-space(),'Abrir Escáner')]"),
    );
    await abrirEscanerBtn.click();

    await driver.wait(
      until.urlContains(`/escanear-boleto/${seeded.idSubEvento}`),
      8000,
    );

    const scannerInstruction = await driver.wait(
      until.elementLocated(
        By.xpath(
          "//*[contains(normalize-space(),'Centra el código QR del boleto dentro del marco')]",
        ),
      ),
      5000,
    );
    assert.equal(await scannerInstruction.isDisplayed(), true);
    console.log("  ✓ TC-LOG-04 passed");

    // =========================================================================
    // TC-LOG-05: Negative & security validations (Unauthorized 403, Invalid QR 404)
    // =========================================================================
    console.log(
      "Running TC-LOG-05: Security & edge cases (Unauthorized staff 403, non-existent QR 404)...",
    );
    // 1. User not assigned to eventoPersonalLogistica gets 403 Forbidden
    const unauthRes = await fetch(
      `${API_URL}/logistica/subeventos/${seeded.idSubEvento}/escanear`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${unauthorizedUser.token}`,
        },
        body: JSON.stringify({ tokenQr: qrToken }),
      },
    );
    assert.equal(
      unauthRes.status,
      403,
      "User not assigned to logistics for this event must receive HTTP 403",
    );

    // 2. Assigned logistics staff scanning non-existent QR gets 404 Not Found
    const invalidQrRes = await fetch(
      `${API_URL}/logistica/subeventos/${seeded.idSubEvento}/escanear`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${logisticaUser.token}`,
        },
        body: JSON.stringify({ tokenQr: "QR-FALSO-INEXISTENTE-000" }),
      },
    );
    assert.equal(
      invalidQrRes.status,
      404,
      "Scanning a non-existent QR token must return HTTP 404",
    );
    console.log("  ✓ TC-LOG-05 passed");

    // =========================================================================
    // TC-LOG-06: Scan valid QR -> marks ticket UTILIZADO, prevents duplicate scan (409), and updates /control-acceso/:idSubEvento to 1/aforo with attendee row
    // =========================================================================
    console.log(
      "Running TC-LOG-06: Valid QR scan registers entry, blocks duplicate scan (409), and updates /control-acceso/:idSubEvento...",
    );
    const validScanRes = await fetch(
      `${API_URL}/logistica/subeventos/${seeded.idSubEvento}/escanear`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${logisticaUser.token}`,
        },
        body: JSON.stringify({ tokenQr: qrToken }),
      },
    );
    assert.equal(validScanRes.ok, true, "First scan of valid QR must succeed");

    // Second scan of the same QR must be rejected with 409 Conflict
    const duplicateScanRes = await fetch(
      `${API_URL}/logistica/subeventos/${seeded.idSubEvento}/escanear`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${logisticaUser.token}`,
        },
        body: JSON.stringify({ tokenQr: qrToken }),
      },
    );
    assert.equal(
      duplicateScanRes.status,
      409,
      "Re-scanning an already used QR ticket must return HTTP 409 Conflict",
    );

    // Return to /control-acceso/:idSubEvento and verify capacity is now 1/aforo and attendee appears in table
    await driver.get(`${BASE_URL}/control-acceso/${seeded.idSubEvento}`);
    const updatedCapacity = await driver.wait(
      until.elementLocated(
        By.xpath(`//*[normalize-space()='1/${seeded.aforo}']`),
      ),
      8000,
    );
    assert.equal(await updatedCapacity.isDisplayed(), true);

    const attendeeRow = await driver.wait(
      until.elementLocated(
        By.xpath("//td[contains(normalize-space(),'Lucía Visitante Logistica')]"),
      ),
      5000,
    );
    assert.equal(await attendeeRow.isDisplayed(), true);
    console.log("  ✓ TC-LOG-06 passed");

    console.log("\nAll 6 Logistics & Access Control E2E tests passed successfully!");
  } finally {
    try {
      if (seeded) {
        await db.query(
          `DELETE FROM "asistenteEvento" WHERE "idSubEvento" = $1`,
          [seeded.idSubEvento],
        );
        await db.query(
          `DELETE FROM boleto WHERE "idBoleto" = $1`,
          [seeded.idBoleto],
        );
        await db.query(
          `DELETE FROM "eventoPersonalLogistica" WHERE "idEvento" = $1`,
          [seeded.idEvento],
        );
        await db.query(
          `DELETE FROM "subEvento" WHERE "idEvento" = $1`,
          [seeded.idEvento],
        );
        await db.query(
          `DELETE FROM evento WHERE "idEvento" = $1`,
          [seeded.idEvento],
        );
        await db.query(
          `DELETE FROM fecha WHERE "idFecha" = $1`,
          [seeded.idFecha],
        );
      }
      for (const u of [logisticaUser, asistenteUser, unauthorizedUser]) {
        if (u) {
          await db.query(`DELETE FROM usuario WHERE "idUsuario" = $1`, [
            u.idUsuario,
          ]);
        }
      }
    } catch {
      // Ignore cleanup errors
    }
    await db.end();
    await driver.quit();
  }
}

runLogisticsAccessControlSuite().catch((err) => {
  console.error("\nLogistics & Access Control E2E test suite failed:", err);
  process.exit(1);
});
