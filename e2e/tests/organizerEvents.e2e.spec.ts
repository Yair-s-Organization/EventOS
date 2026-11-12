import assert from "node:assert/strict";
import { By, Key, WebDriver, until } from "selenium-webdriver";
import { LoginPage } from "../pages/LoginPage";
import {
  API_URL,
  BASE_URL,
  connectTestDb,
  createChromeDriver,
} from "../utils/testEnv";

async function registerVerifiedOrganizer(
  db: any,
  email: string,
  password: string,
): Promise<number> {
  const regRes = await fetch(`${API_URL}/auth/registro`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: "Roberto",
      apellidoPa: "Organizador",
      apellidoMa: "Prueba",
      correo: email,
      contrasena: password,
    }),
  });
  assert.equal(regRes.ok, true, "Failed to register organizer user");
  const regData: any = await regRes.json();
  const token = regData.token ?? regData.tokenConfirmacion;

  const confirmRes = await fetch(`${API_URL}/auth/confirmar-registro`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  assert.equal(confirmRes.ok, true, "Failed to confirm organizer email");

  const userRes = await db.query(
    `UPDATE usuario
     SET "esVerificado" = 'Verificado', "estatus" = true
     WHERE correo = $1
     RETURNING "idUsuario"`,
    [email],
  );
  assert.equal(userRes.rows.length, 1);
  return Number(userRes.rows[0].idUsuario);
}

async function seedOrganizerEvent(db: any, idOrganizador: number, eventName: string) {
  const recintoRes = await db.query(
    `SELECT "idRecinto", aforo FROM recinto WHERE nombre = 'Auditorio Principal' LIMIT 1`,
  );
  const idRecinto = Number(recintoRes.rows[0].idRecinto);
  const aforo = Number(recintoRes.rows[0].aforo);

  // Pick a future date within the current semester (<= YYYY-12-18)
  const year = new Date().getFullYear();
  const futureDate = `${year}-12-10`;

  const fechaRes = await db.query(
    `INSERT INTO fecha (fecha, "horaInicio", "horaFin")
     VALUES ($1, '10:00:00', '12:00:00')
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
      "Descripción inicial del simposio organizado para pruebas automatizadas E2E.",
      "Fomentar la investigación tecnológica en la comunidad estudiantil politécnica.",
      "https://placehold.co/2048x1152/png",
      idOrganizador,
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
      `Conferencia Magistral - ${eventName}`,
      "Sesión inaugural en el Auditorio Principal.",
      idEvento,
      idFecha,
      idRecinto,
    ],
  );
  const idSubEvento = Number(subEventoRes.rows[0].idSubEvento);

  await db.query(
    `INSERT INTO ponente (nombre, "apellidoPa", "apellidoMa", correo, "idSubEvento")
     VALUES ('Elena', 'Gómez', 'Ruiz', 'elena.ponente.e2e@ipn.mx', $1)`,
    [idSubEvento],
  );

  return { idEvento, idSubEvento, idFecha };
}

async function runOrganizerEventsSuite(): Promise<void> {
  const driver: WebDriver = await createChromeDriver();
  const loginPage = new LoginPage(driver);
  const db = await connectTestDb();

  const uniqueSuffix = Date.now().toString().slice(-6);
  const organizerEmail = `org.e2e.${uniqueSuffix}@ipn.mx`;
  const organizerPassword = "Password123!";
  const eventName = `Simposio Organizador E2E ${uniqueSuffix}`;
  const updatedEventName = `${eventName} Actualizado`;

  let idOrganizador: number | null = null;
  let seeded: { idEvento: number; idSubEvento: number; idFecha: number } | null =
    null;

  try {
    idOrganizador = await registerVerifiedOrganizer(
      db,
      organizerEmail,
      organizerPassword,
    );
    seeded = await seedOrganizerEvent(db, idOrganizador, eventName);

    // =========================================================================
    // TC-ORG-01: Login & view /organizador/mis-eventos with seeded event card
    // =========================================================================
    console.log(
      "Running TC-ORG-01: Organizer logs in -> /organizador/mis-eventos displays event card...",
    );
    await loginPage.login(organizerEmail, organizerPassword);
    await driver.wait(until.urlContains("/menu-asistente"), 10000);

    await driver.get(`${BASE_URL}/organizador/mis-eventos`);
    const heading = await driver.wait(
      until.elementLocated(By.xpath("//h1[normalize-space()='Mis eventos']")),
      8000,
    );
    assert.equal(await heading.isDisplayed(), true);

    const cardTitle = await driver.wait(
      until.elementLocated(
        By.xpath(`//h2[normalize-space()='${eventName}']`),
      ),
      8000,
    );
    assert.equal(await cardTitle.isDisplayed(), true);
    console.log("  ✓ TC-ORG-01 passed");

    // =========================================================================
    // TC-ORG-02: Filter by search text and by Espacio on /organizador/mis-eventos
    // =========================================================================
    console.log(
      "Running TC-ORG-02: Search bar and Espacio filter on /organizador/mis-eventos...",
    );
    const searchInput = await driver.findElement(
      By.css("input[placeholder='Buscar por nombre']"),
    );
    await searchInput.clear();
    await searchInput.sendKeys("EVENTO-INEXISTente-XYZ-999");

    const emptyFilterMsg = await driver.wait(
      until.elementLocated(
        By.xpath(
          "//*[contains(normalize-space(),'No hay eventos que coincidan con los filtros seleccionados.')]",
        ),
      ),
      5000,
    );
    assert.equal(await emptyFilterMsg.isDisplayed(), true);

    // Clear search and filter by Espacio = Auditorio Principal
    await searchInput.sendKeys(Key.chord(Key.CONTROL, "a"), Key.BACK_SPACE);
    const selectRecinto = await driver.findElement(By.id("selectRecinto"));
    await selectRecinto
      .findElement(By.css("option[value='Auditorio Principal']"))
      .click();

    const filteredCard = await driver.wait(
      until.elementLocated(
        By.xpath(`//h2[normalize-space()='${eventName}']`),
      ),
      5000,
    );
    assert.equal(await filteredCard.isDisplayed(), true);
    console.log("  ✓ TC-ORG-02 passed");

    // =========================================================================
    // TC-ORG-03: Click 'Ver detalles' -> /organizador/administrar-evento/:idEvento
    // =========================================================================
    console.log(
      "Running TC-ORG-03: Navigate to /organizador/administrar-evento/:idEvento and verify event details...",
    );
    const verDetallesBtn = await driver.findElement(
      By.xpath(
        `//article[.//h2[normalize-space()='${eventName}']]//button[normalize-space()='Ver detalles']`,
      ),
    );
    await verDetallesBtn.click();

    await driver.wait(
      until.urlContains(`/organizador/administrar-evento/${seeded.idEvento}`),
      8000,
    );

    const adminHeading = await driver.wait(
      until.elementLocated(
        By.xpath("//h1[normalize-space()='Administración y detalles de mi evento']"),
      ),
      8000,
    );
    assert.equal(await adminHeading.isDisplayed(), true);

    const ponenteCell = await driver.wait(
      until.elementLocated(
        By.xpath("//*[contains(normalize-space(),'Elena Gómez Ruiz')]"),
      ),
      5000,
    );
    assert.equal(await ponenteCell.isDisplayed(), true);
    console.log("  ✓ TC-ORG-03 passed");

    // =========================================================================
    // TC-ORG-04: Click 'Modificar Evento' -> /organizador/editar-evento/:idEvento and save general info
    // =========================================================================
    console.log(
      "Running TC-ORG-04: Edit event general info on /organizador/editar-evento/:idEvento...",
    );
    const modificarBtn = await driver.findElement(
      By.xpath("//button[normalize-space()='Modificar Evento']"),
    );
    await modificarBtn.click();

    await driver.wait(
      until.urlContains(`/organizador/editar-evento/${seeded.idEvento}`),
      8000,
    );

    const campoNombre = await driver.wait(
      until.elementLocated(By.id("campoNombre")),
      8000,
    );
    await campoNombre.sendKeys(Key.chord(Key.CONTROL, "a"), Key.BACK_SPACE);
    await campoNombre.sendKeys(updatedEventName);

    const campoDescripcion = await driver.findElement(By.id("campoDescripcion"));
    await campoDescripcion.sendKeys(Key.chord(Key.CONTROL, "a"), Key.BACK_SPACE);
    await campoDescripcion.sendKeys(
      "Descripción actualizada del simposio mediante la suite E2E del organizador.",
    );

    const confirmarCambiosBtn = await driver.findElement(
      By.xpath("//button[normalize-space()='Confirmar cambios']"),
    );
    await confirmarCambiosBtn.click();

    const successBadge = await driver.wait(
      until.elementLocated(
        By.xpath(
          "//*[contains(normalize-space(),'Los cambios se guardaron correctamente.')]",
        ),
      ),
      8000,
    );
    assert.equal(await successBadge.isDisplayed(), true);
    console.log("  ✓ TC-ORG-04 passed");

    // =========================================================================
    // TC-ORG-05: Return to event administration & cancel event with validation
    // =========================================================================
    console.log(
      "Running TC-ORG-05: Return to /organizador/administrar-evento/:idEvento and cancel event...",
    );
    const volverBtn = await driver.findElement(
      By.xpath("//button[.//span[normalize-space()='Volver']]"),
    );
    await volverBtn.click();

    await driver.wait(
      until.urlContains(`/organizador/administrar-evento/${seeded.idEvento}`),
      8000,
    );

    // Verify updated event name is displayed
    const updatedTitleSpan = await driver.wait(
      until.elementLocated(
        By.xpath(`//*[@id='contenedorTitulo']//*[normalize-space()='${updatedEventName}']`),
      ),
      8000,
    );
    assert.equal(await updatedTitleSpan.isDisplayed(), true);

    const cancelarEventoBtn = await driver.findElement(
      By.xpath("//button[normalize-space()='Cancelar evento']"),
    );
    await cancelarEventoBtn.click();

    // Try clicking 'Continuar' without entering a reason -> validation error
    const continuarModalBtn = await driver.wait(
      until.elementLocated(
        By.xpath("//dialog[@open]//button[normalize-space()='Continuar']"),
      ),
      5000,
    );
    await continuarModalBtn.click();

    const emptyReasonErr = await driver.wait(
      until.elementLocated(
        By.xpath(
          "//dialog[@open]//*[contains(normalize-space(),'La justificación no puede estar vacía')]",
        ),
      ),
      5000,
    );
    assert.equal(await emptyReasonErr.isDisplayed(), true);

    // Enter valid cancellation reason and confirm
    const motivoTextarea = await driver.findElement(
      By.id("contenedorMotivoCancelacion"),
    );
    await motivoTextarea.sendKeys(
      "Cancelación programada de prueba automatizada por ajuste de calendario institucional.",
    );
    await continuarModalBtn.click();

    const confirmarCancelacionBtn = await driver.wait(
      until.elementLocated(
        By.xpath(
          "//dialog[@open]//button[normalize-space()='Confirmar Cancelación']",
        ),
      ),
      5000,
    );
    await confirmarCancelacionBtn.click();

    // Verify cancellation success message or 'Cancelado' state
    const cancelSuccess = await driver.wait(
      until.elementLocated(
        By.xpath(
          "//*[contains(normalize-space(),'Cancelado') or contains(normalize-space(),'cancelado')]",
        ),
      ),
      8000,
    );
    assert.equal(await cancelSuccess.isDisplayed(), true);
    console.log("  ✓ TC-ORG-05 passed");

    console.log("\nAll 5 Organizer Events E2E tests passed successfully!");
  } finally {
    try {
      if (seeded) {
        await db.query(
          `DELETE FROM "bitacoraEvento" WHERE "idEvento" = $1`,
          [seeded.idEvento],
        );
        await db.query(
          `DELETE FROM ponente WHERE "idSubEvento" = $1`,
          [seeded.idSubEvento],
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
      if (idOrganizador) {
        await db.query(
          `DELETE FROM usuario WHERE "idUsuario" = $1`,
          [idOrganizador],
        );
      }
    } catch {
      // Ignore cleanup errors
    }
    await db.end();
    await driver.quit();
  }
}

runOrganizerEventsSuite().catch((err) => {
  console.error("\nOrganizer Events E2E test suite failed:", err);
  process.exit(1);
});
