import assert from "node:assert/strict";
import path from "node:path";
import { Builder, By, WebDriver, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { EventRequestPage } from "../pages/EventRequestPage";
import { connectTestDb } from "../utils/testEnv";

// Helper to clear browser storage and state between actor logins
async function clearSession(driver: WebDriver): Promise<void> {
  await driver.executeScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
}

// Database helper to update account verification status
async function verifyUserInDatabase(email: string): Promise<void> {
  const client = await connectTestDb();
  const updateResult = await client.query(
    `UPDATE usuario SET "esVerificado" = 'Verificado' WHERE correo = $1 RETURNING "idUsuario", "esVerificado"`,
    [email],
  );
  await client.end();

  assert.equal(
    updateResult.rowCount && updateResult.rowCount > 0,
    true,
    `No se encontró el usuario con correo ${email} para verificar en base de datos.`,
  );
}

// Format a future date (8-35 days ahead, within semester) in YYYY-MM-DD avoiding collisions across test runs
function getFutureDateIso(): string {
  const randomOffset = Math.floor(Math.random() * 27) + 8;
  const target = new Date(Date.now() + randomOffset * 24 * 60 * 60 * 1000);
  const iso = target.toISOString().split("T")[0];
  const maxIso = `${new Date().getFullYear()}-12-19`;
  return iso <= maxIso ? iso : maxIso;
}

async function runEventLifecycleSuite(): Promise<void> {
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
  const registerPage = new RegisterPage(driver);
  const eventRequestPage = new EventRequestPage(driver);

  const timestamp = Date.now();
  const testUser = {
    nombre: "Rodrigo",
    apellidoPa: "Morales",
    apellidoMaterno: "Cruz",
    correo: `organizador.${timestamp}@alumno.ipn.mx`,
    contrasena: "Password123!",
  };

  const testEventName = `Congreso Nacional de TI ${timestamp}`;
  const posterPath = path.resolve(__dirname, "../fixtures/poster.jpg");
  const eventDate = getFutureDateIso();

  try {
    console.log("==========================================================================");
    console.log("INICIANDO SUITE DE CICLO COMPLETO DE EVENTO (REGISTRO -> APROBACIÓN -> BITÁCORA)");
    console.log("==========================================================================\n");

    // =========================================================================
    // PASO 1: Registro de nuevo usuario (Organizador)
    // =========================================================================
    console.log(`[Paso 1] Registrando nuevo usuario: ${testUser.correo}...`);
    await registerPage.open();
    await clearSession(driver);
    await registerPage.open();

    await registerPage.fillForm({
      nombre: testUser.nombre,
      apellidoPa: testUser.apellidoPa,
      apellidoMaterno: testUser.apellidoMaterno,
      correo: testUser.correo,
      contrasena: testUser.contrasena,
      confirmarContrasena: testUser.contrasena,
    });
    await registerPage.submit();

    const registrationSuccess = await registerPage.waitForSuccessModal(8000);
    assert.equal(
      registrationSuccess,
      true,
      "Debe mostrarse el modal de registro exitoso para el nuevo usuario",
    );
    await registerPage.confirmPendingRegistration();
    await registerPage.acceptSuccessModal();
    await driver.wait(until.urlContains("/login"), 5000);
    console.log("  ✓ Paso 1 completado: Cuenta creada exitosamente.\n");

    // =========================================================================
    // PASO 2: Validación de regla de negocio: Rechazo de solicitud sin verificación previa
    // =========================================================================
    console.log("[Paso 2] Verificando bloqueo de solicitud si el usuario NO está verificado...");
    await loginPage.login(testUser.correo, testUser.contrasena);
    await driver.wait(until.urlContains("/menu-asistente"), 10000);

    await eventRequestPage.open();
    const isVerificationBlocked = await eventRequestPage.isVerificationRequiredModalVisible(7000);
    assert.equal(
      isVerificationBlocked,
      true,
      "El sistema debe desplegar el modal 'Verificación necesaria' si el usuario no está verificado",
    );
    await eventRequestPage.clickGoToVerification();
    await driver.wait(until.urlContains("/verificacion"), 5000);
    console.log("  ✓ Paso 2 completado: Bloqueo por falta de verificación comprobado correctamente.\n");

    // =========================================================================
    // PASO 3: Verificación de la cuenta del usuario
    // =========================================================================
    console.log(`[Paso 3] Verificando la cuenta del usuario ${testUser.correo}...`);
    await verifyUserInDatabase(testUser.correo);
    // Re-iniciar sesión para sincronizar el estado Verificado en localStorage
    await clearSession(driver);
    await loginPage.login(testUser.correo, testUser.contrasena);
    await driver.wait(until.urlContains("/menu-asistente"), 10000);
    console.log("  ✓ Paso 3 completado: Usuario verificado y sesión actualizada.\n");

    // =========================================================================
    // PASO 4: Solicitud exitosa de evento por el usuario ya verificado
    // =========================================================================
    console.log("[Paso 4] Enviando solicitud de evento con el usuario ya verificado...");
    await eventRequestPage.open();
    await eventRequestPage.fillCompleteForm({
      nombre: testEventName,
      idAlcance: "1",
      posterAbsolutePath: posterPath,
      descripcion: "Congreso de divulgación sobre arquitectura de software y computación moderna.",
      justificacion: "Fomentar el aprendizaje práctico y las buenas prácticas en la comunidad politécnica.",
      subEvento: {
        nombre: "Conferencia Magistral",
        descripcion: "Ponencia inaugural del congreso de tecnología.",
        fecha: eventDate,
        idRecinto: "1",
        horaInicio: "10:00",
        horaFin: "12:00",
        accesoQR: "true",
      },
    });

    await eventRequestPage.submitForm();
    try {
      await driver.wait(
        until.elementLocated(
          By.xpath("//dialog[@open]//*[contains(normalize-space(), '¿Desea enviar')]"),
        ),
        6000,
      );
    } catch (err) {
      const diag = await driver.executeScript(() => {
        const dialog = document.querySelector("dialog[open]");
        const textDanger = Array.from(document.querySelectorAll(".text-danger, .text-red-500, [class*='error']")).map(el => (el as HTMLElement).innerText);
        return {
          dialogText: dialog ? (dialog as HTMLElement).innerText : "NO_DIALOG",
          errorsOnScreen: textDanger,
        };
      });
      console.error("DIAGNOSTIC ON CONFIRM MODAL TIMEOUT:", JSON.stringify(diag, null, 2));
      throw err;
    }
    await eventRequestPage.acceptConfirmModal();

    let successModalHeading;
    try {
      successModalHeading = await driver.wait(
        until.elementLocated(
          By.xpath("//dialog[@open]//*[contains(normalize-space(), 'Operación exitosa')]"),
        ),
        8000,
      );
      await driver.wait(until.elementIsVisible(successModalHeading), 5000);
    } catch (err) {
      const pageInfo = await driver.executeScript(() => {
        const dialog = document.querySelector("dialog[open]");
        return {
          dialogText: dialog ? (dialog as HTMLElement).innerText : "NO_DIALOG",
        };
      });
      console.error("DIAGNOSTIC ON FAILURE:", JSON.stringify(pageInfo, null, 2));
      throw err;
    }

    const modalAceptarBtn = await driver.findElement(
      By.xpath("//dialog[@open]//button[normalize-space()='Aceptar']"),
    );
    await modalAceptarBtn.click();
    console.log(`  ✓ Paso 4 completado: Solicitud de '${testEventName}' enviada con éxito.\n`);

    // =========================================================================
    // PASO 5: Subdirección revisa y autoriza el evento
    // =========================================================================
    console.log("[Paso 5] Iniciando sesión como Subdirección para autorizar el evento...");
    await loginPage.open();
    await clearSession(driver);
    await loginPage.login("subdireccion@ipn.mx", "Admin123!");
    await driver.wait(until.urlContains("/subdireccion/menu-principal"), 10000);

    await driver.get("http://localhost:5173/subdireccion/lista-solicitudes");
    await driver.wait(
      until.elementLocated(By.xpath("//h1[normalize-space()='Solicitudes pendientes']")),
      8000,
    );

    // Localizar la fila del evento solicitado por su nombre
    const rowLocator = By.xpath(`//tr[contains(., ${JSON.stringify(testEventName)})]`);
    const eventRow = await driver.wait(until.elementLocated(rowLocator), 8000);
    assert.equal(await eventRow.isDisplayed(), true, "La solicitud debe aparecer en la lista de pendientes");

    const verDetallesBtn = await eventRow.findElement(
      By.xpath(".//button[normalize-space()='Ver detalles']"),
    );
    await verDetallesBtn.click();

    await driver.wait(until.urlContains("/detalles-solicitud"), 8000);
    const botonAprobar = await driver.wait(
      until.elementLocated(By.id("botonAprobar")),
      8000,
    );
    await driver.wait(until.elementIsVisible(botonAprobar), 5000);
    await botonAprobar.click();

    // Confirmar en el modal de dictamen
    const confirmModal = await driver.wait(
      until.elementLocated(
        By.xpath("//dialog[@open]//*[contains(normalize-space(), '¿Desea aprobar el evento?')]"),
      ),
      5000,
    );
    await driver.wait(until.elementIsVisible(confirmModal), 5000);

    const aceptarDictamenBtn = await driver.findElement(
      By.xpath("//dialog[@open]//button[normalize-space()='Aceptar']"),
    );
    await aceptarDictamenBtn.click();

    // Si aparece el modal de Operación exitosa, confirmarlo para volver al listado
    try {
      const exitoModal = await driver.wait(
        until.elementLocated(
          By.xpath("//dialog[@open]//*[contains(normalize-space(), 'Operación exitosa') or contains(normalize-space(), 'aprobado exitosamente')]"),
        ),
        4000,
      );
      if (await exitoModal.isDisplayed()) {
        const btnExito = await driver.findElement(
          By.xpath("//dialog[@open]//button[normalize-space()='Aceptar']"),
        );
        await btnExito.click();
      }
    } catch {
      // Continuar si ya redirigió directamente
    }

    // Tras aprobar, debe retornar a la lista de solicitudes y el evento ya no debe estar pendiente
    await driver.wait(until.urlContains("/subdireccion/lista-solicitudes"), 8000);
    await driver.sleep(600);

    const remainingRows = await driver.findElements(rowLocator);
    assert.equal(
      remainingRows.length === 0,
      true,
      "El evento autorizado ya no debe figurar en la lista de solicitudes pendientes",
    );
    console.log(`  ✓ Paso 5 completado: Evento '${testEventName}' aprobado por Subdirección.\n`);

    // =========================================================================
    // PASO 6: Administrador audita el estado del evento en la Bitácora
    // =========================================================================
    console.log("[Paso 6] Iniciando sesión como Administrador para auditar la Bitácora...");
    await loginPage.open();
    await clearSession(driver);
    await loginPage.login("admin@ipn.mx", "Admin123!");
    await driver.wait(until.urlContains("/menu-admin"), 10000);

    await driver.get("http://localhost:5173/admin/bitacora");
    await driver.wait(
      until.elementLocated(By.xpath("//h1[contains(normalize-space(), 'Bitácora')]")),
      8000,
    );

    // Filtrar por el nombre del evento en la caja de búsqueda
    const searchInput = await driver.findElement(By.css("input[placeholder='Buscar evento']"));
    await searchInput.clear();
    await searchInput.sendKeys(testEventName);

    const searchForm = await driver.findElement(By.xpath("//form[.//input[@placeholder='Buscar evento']]"));
    await searchForm.submit();
    await driver.sleep(600);

    // Verificar que en la bitácora aparezca el registro del evento con estado 'Aceptado'
    const bitacoraRowLocator = By.xpath(
      `//table//tr[contains(., ${JSON.stringify(testEventName)})]`,
    );
    const bitacoraRow = await driver.wait(until.elementLocated(bitacoraRowLocator), 8000);
    assert.equal(
      await bitacoraRow.isDisplayed(),
      true,
      `El evento '${testEventName}' debe figurar en la bitácora del Administrador`,
    );

    const rowText = await bitacoraRow.getText();
    assert.equal(
      rowText.includes("Aceptado"),
      true,
      `El registro en bitácora debe mostrar estado 'Aceptado'. Fila: "${rowText}"`,
    );

    console.log(`  ✓ Paso 6 completado: El evento figura en la Bitácora con estado 'Aceptado'.`);
    console.log(`    Detalle auditado: "${rowText}"\n`);

    console.log("==========================================================================");
    console.log("¡TODOS LOS PASOS DEL CICLO DE VIDA COMPLETADOS Y AUDITADOS EXITOSAMENTE!");
    console.log("==========================================================================");
  } finally {
    await driver.quit();
  }
}

runEventLifecycleSuite();
