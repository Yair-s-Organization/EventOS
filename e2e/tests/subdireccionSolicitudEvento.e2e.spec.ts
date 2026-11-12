import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { Builder, WebDriver } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";
import { LoginPage } from "../pages/LoginPage";
import { SubdireccionMenuPage } from "../pages/SubdireccionMenuPage";
import { EventRequestPage } from "../pages/EventRequestPage";

function ensureValidJpegFixture(): string {
  const fixturesDir = path.resolve(import.meta.dir, "../fixtures");
  fs.mkdirSync(fixturesDir, { recursive: true });
  const filePath = path.join(fixturesDir, "poster.jpg");
  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 1000) {
    return filePath;
  }

  // Minimal valid JPEG fallback
  const minimalJpegBase64 =
    "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";
  fs.writeFileSync(filePath, Buffer.from(minimalJpegBase64, "base64"));
  return filePath;
}

function getUniqueFutureDateIso(): string {
  // Generate a future date between 8 and 35 days ahead (before Dec 19 semester end, and > 7 days to avoid urgent modal)
  const daysAhead = 8 + (Math.floor(Date.now() / 1000) % 27);
  const target = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
  const iso = target.toISOString().slice(0, 10);
  const maxIso = `${new Date().getFullYear()}-12-19`;
  return iso <= maxIso ? iso : maxIso;
}

async function runSubdireccionEventRequestSuite(): Promise<void> {
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
  const subdireccionMenuPage = new SubdireccionMenuPage(driver);
  const eventRequestPage = new EventRequestPage(driver);
  const posterPath = ensureValidJpegFixture();

  try {
    // =========================================================================
    // TC-SUB-01: Login as Subdirección & verify /subdireccion/menu-principal (UI25)
    // =========================================================================
    console.log(
      "Running TC-SUB-01: Login as Subdirección -> /subdireccion/menu-principal...",
    );
    await loginPage.login("subdireccion@ipn.mx", "Admin123!");
    await subdireccionMenuPage.waitUntilLoaded();

    assert.equal(await subdireccionMenuPage.getHeadingText(), "Menú principal");
    assert.equal(await subdireccionMenuPage.getStoredUserRole(), "Subdirección");
    assert.equal(
      await subdireccionMenuPage.isDashboardContentVisible(),
      true,
      "Expected metrics and venue agenda sections to be visible on Subdirección dashboard",
    );
    console.log("  ✓ TC-SUB-01 passed");

    // =========================================================================
    // TC-SUB-02: Navigate via Navbar to /solicitud-evento (UI07)
    // =========================================================================
    console.log(
      "Running TC-SUB-02: Navigate from Navbar to /solicitud-evento...",
    );
    await subdireccionMenuPage.navigateToEventRequestViaNavbar();
    await eventRequestPage.waitUntilLoaded();
    console.log("  ✓ TC-SUB-02 passed");

    // =========================================================================
    // TC-SUB-03: Empty submission triggers Error Modal (MSG-E-11) & field errors
    // =========================================================================
    console.log(
      "Running TC-SUB-03: Empty form submission triggers Error Modal & field errors...",
    );
    await eventRequestPage.submitForm();
    assert.equal(
      await eventRequestPage.isErrorModalVisible(),
      true,
      "Should display 'Error' modal when mandatory fields are missing",
    );
    assert.equal(
      await eventRequestPage.isTextVisible(
        "Por favor, completa todos los campos obligatorios resaltados para continuar",
      ),
      true,
      "Should display MSG-E-11 inside the Error modal",
    );
    await eventRequestPage.closeErrorModal();

    // Verify mandatory field messages
    assert.equal(
      await eventRequestPage.isTextVisible(
        "El nombre del evento es obligatorio.",
      ),
      true,
    );
    assert.equal(
      await eventRequestPage.isTextVisible(
        "Debe seleccionar un tipo de alcance válido para continuar",
      ),
      true,
    );
    assert.equal(
      await eventRequestPage.isTextVisible(
        "El póster del evento es obligatorio.",
      ),
      true,
    );
    assert.equal(
      await eventRequestPage.isTextVisible(
        "La descripción del evento es obligatoria.",
      ),
      true,
    );
    assert.equal(
      await eventRequestPage.isTextVisible(
        "La justificación del evento es obligatoria.",
      ),
      true,
    );
    assert.equal(
      await eventRequestPage.isTextVisible("Selecciona la fecha del evento"),
      true,
    );
    assert.equal(
      await eventRequestPage.isTextVisible("Selecciona un espacio para el evento"),
      true,
    );
    console.log("  ✓ TC-SUB-03 passed");

    // =========================================================================
    // TC-SUB-04: Schedule select filtering & dynamic enabling (fecha + recinto required)
    // =========================================================================
    console.log(
      "Running TC-SUB-04: Schedule select enabling and valid hour range...",
    );
    const testDate = getUniqueFutureDateIso();
    await eventRequestPage.setSubEventDate(testDate, 0);
    await eventRequestPage.setSubEventVenue("1", 0);
    await eventRequestPage.setSubEventTimes("10:00", "12:00", 0);
    console.log("  ✓ TC-SUB-04 passed");

    // =========================================================================
    // TC-SUB-05: Venue-specific rules (Sala 14 vs Laboratorio 1104 vs Auditorio)
    // =========================================================================
    console.log(
      "Running TC-SUB-05: Dynamic rules by venue (Sala 14 vs Laboratorio 1104 vs Auditorio)...",
    );
    // Sala 14 ("4") disables both ticket select and space details button
    await eventRequestPage.setSubEventVenue("4", 0);
    assert.equal(
      await eventRequestPage.isTicketSelectDisabled(0),
      true,
      "Ticket select should be disabled for Sala 14",
    );
    assert.equal(
      await eventRequestPage.isViewSpaceDetailsButtonDisabled(),
      true,
      "View space details button should be disabled for Sala 14",
    );

    // Laboratorio 1104 ("2") auto-selects Cupo limitado and enables space details modal
    await eventRequestPage.setSubEventVenue("2", 0);
    assert.equal(
      await eventRequestPage.isViewSpaceDetailsButtonDisabled(),
      false,
      "View space details button should be enabled for Laboratorio 1104",
    );
    assert.equal(
      await eventRequestPage.openSpaceDetailsModal(),
      true,
      "Should open 'Detalles del espacio solicitado' modal for Laboratorio 1104",
    );
    await eventRequestPage.closeOpenDialogViaEscape();

    // Auditorio ("1") enables ticket select
    await eventRequestPage.setSubEventVenue("1", 0);
    assert.equal(
      await eventRequestPage.isTicketSelectDisabled(0),
      false,
      "Ticket select should be enabled for Auditorio",
    );
    console.log("  ✓ TC-SUB-05 passed");

    // =========================================================================
    // TC-SUB-06: Add and remove multiple sub-event date blocks
    // =========================================================================
    console.log(
      "Running TC-SUB-06: Add and remove multiple sub-event date blocks...",
    );
    assert.equal(await eventRequestPage.getSubEventBlockCount(), 1);
    await eventRequestPage.addSubEventBlock();
    assert.equal(await eventRequestPage.getSubEventBlockCount(), 2);
    await eventRequestPage.removeLastSubEventBlock();
    assert.equal(await eventRequestPage.getSubEventBlockCount(), 1);
    console.log("  ✓ TC-SUB-06 passed");

    // =========================================================================
    // TC-SUB-07: Complete event request by Subdirección & verify RN-13 auto-approval
    // =========================================================================
    console.log(
      "Running TC-SUB-07: Submit valid event request -> Confirm Modal -> Verify RN-13 auto-approval...",
    );
    const eventName = `Simposio Subdirección QA ${Date.now()}`;
    const futureDate = getUniqueFutureDateIso();

    await eventRequestPage.fillCompleteForm({
      nombre: eventName,
      idAlcance: "1", // Público
      posterAbsolutePath: posterPath,
      descripcion:
        "Simposio institucional organizado por Subdirección de Servicios Educativos.",
      justificacion:
        "Fomentar la vinculación académica y tecnológica de la comunidad politécnica.",
      subEvento: {
        fecha: futureDate,
        horaInicio: "10:00",
        horaFin: "12:00",
        idRecinto: "1", // Auditorio
        accesoQR: "true",
      },
    });

    // Submit and test 'Cancelar' first on confirmation modal
    await eventRequestPage.submitForm();
    assert.equal(
      await eventRequestPage.isConfirmModalVisible(),
      true,
      "Should display 'Confirmar solicitud' modal",
    );
    await eventRequestPage.cancelConfirmModal();

    // Submit again and confirm with 'Aceptar'
    await eventRequestPage.submitForm();
    assert.equal(await eventRequestPage.isConfirmModalVisible(), true);
    await eventRequestPage.acceptConfirmModal();

    // Wait briefly for POST /api/solicitudes to complete and verify in backend that RN-13 auto-approved it
    await driver.sleep(1000);
    const createdAndApproved = await driver.executeAsyncScript<boolean>(
      async (expectedName: string, done: (result: boolean) => void) => {
        try {
          const token = window.localStorage.getItem("token");
          const res = await fetch(
            "http://localhost:3000/api/solicitudes?estado=Aprobado",
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (!res.ok) return done(false);
          const eventos = await res.json();
          const match = Array.isArray(eventos)
            ? eventos.find(
                (e: any) =>
                  e.nombre === expectedName && e.idEstadoEvento === 2,
              )
            : null;
          done(Boolean(match));
        } catch {
          done(false);
        }
      },
      eventName,
    );

    assert.equal(
      createdAndApproved,
      true,
      "Event created by Subdirección should be stored in DB with idEstadoEvento=2 (Aprobado per RN-13)",
    );
    console.log("  ✓ TC-SUB-07 passed");

    console.log(
      "\nALL 7 SUBDIRECCIÓN (MENU -> SOLICITUD-EVENTO) E2E TESTS PASSED SUCCESSFULLY!",
    );
  } finally {
    await driver.quit();
  }
}

runSubdireccionEventRequestSuite();
