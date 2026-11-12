import assert from "node:assert/strict";
import { Builder, WebDriver, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";
import { LoginPage } from "../pages/LoginPage";
import { PasswordResetPage } from "../pages/PasswordResetPage";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000/api";

async function clearSession(driver: WebDriver): Promise<void> {
  await driver.executeScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
}

async function runPasswordResetSuite(): Promise<void> {
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
  const resetPage = new PasswordResetPage(driver);

  try {
    console.log("=== INICIANDO SUITE: RESTABLECIMIENTO DE CONTRASEÑA ===");

    // -------------------------------------------------------------------------
    // TC-RESET-01: Validación de campo de correo vacío
    // -------------------------------------------------------------------------
    console.log("TC-RESET-01: Validación de correo vacío en solicitud...");
    await resetPage.openRequestPage();
    await resetPage.fillRequestEmail("");
    await resetPage.submitRequest();

    assert.equal(
      await resetPage.isTextVisible("Por favor, ingresa tu correo electrónico."),
      true,
      "Debe mostrar mensaje de correo obligatorio",
    );
    console.log("  ✓ TC-RESET-01 superado");

    // -------------------------------------------------------------------------
    // TC-RESET-02: Validación de sintaxis de correo inválida
    // -------------------------------------------------------------------------
    console.log("TC-RESET-02: Validación de sintaxis de correo inválida...");
    await resetPage.fillRequestEmail("correo-invalido-sin-arroba");
    await resetPage.submitRequest();

    assert.equal(
      await resetPage.isTextVisible("Ingresa un correo electrónico válido."),
      true,
      "Debe mostrar mensaje de formato de correo inválido",
    );
    console.log("  ✓ TC-RESET-02 superado");

    // -------------------------------------------------------------------------
    // TC-RESET-03: Correo no registrado en el sistema
    // -------------------------------------------------------------------------
    console.log("TC-RESET-03: Correo inexistente en la base de datos...");
    await resetPage.fillRequestEmail("usuario.fantasma.noexiste@ipn.mx");
    await resetPage.submitRequest();

    const hasNotFoundError = await resetPage.isTextVisible(
      "El correo electrónico ingresado no se encuentra registrado en el sistema.",
      4000,
    );
    assert.equal(
      hasNotFoundError,
      true,
      "Debe alertar que el correo no está registrado",
    );
    console.log("  ✓ TC-RESET-03 superado");

    // -------------------------------------------------------------------------
    // TC-RESET-04: Enlace inválido o expirado sin token
    // -------------------------------------------------------------------------
    console.log("TC-RESET-04: Acceso a /restablecer-contrasena sin token...");
    await resetPage.openResetPage("");
    assert.equal(
      await resetPage.isInvalidTokenVisible(5000),
      true,
      "Debe mostrar banner de enlace inválido o expirado",
    );
    console.log("  ✓ TC-RESET-04 superado");

    // -------------------------------------------------------------------------
    // TC-RESET-05: Enlace con token malformado o falso
    // -------------------------------------------------------------------------
    console.log("TC-RESET-05: Acceso a /restablecer-contrasena con token corrupto...");
    await resetPage.openResetPage("token_jwt_completamente_invalido_12345");
    assert.equal(
      await resetPage.isInvalidTokenVisible(5000),
      true,
      "Debe rechazar token falso o corrupto",
    );
    console.log("  ✓ TC-RESET-05 superado");

    // -------------------------------------------------------------------------
    // Preparar usuario para prueba real de restablecimiento
    // Usamos el usuario organizador@ipn.mx existente
    // -------------------------------------------------------------------------
    const targetEmail = "organizador@ipn.mx";
    console.log(`Solicitando recuperación para ${targetEmail} vía API...`);

    const reqResponse = await fetch(`${API_BASE_URL}/auth/recuperar-contrasena`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo: targetEmail }),
    });

    const reqData = await reqResponse.json();
    assert.equal(reqResponse.status, 200, "La solicitud de recuperación debe responder 200");
    const resetToken = reqData.token;
    assert.ok(resetToken, "Debe retornar el token generado en ambiente de prueba");

    // -------------------------------------------------------------------------
    // TC-RESET-06: Formulario con contraseñas que no coinciden
    // -------------------------------------------------------------------------
    console.log("TC-RESET-06: Validación de contraseñas no coincidentes...");
    await resetPage.openResetPage(resetToken);
    assert.equal(await resetPage.waitForResetForm(5000), true, "Debe cargar formulario de nueva contraseña");

    await resetPage.fillResetPassword("NuevaPassword123!", "DiferentePassword123!");
    await resetPage.submitReset();

    assert.equal(
      await resetPage.isTextVisible("Las contraseñas ingresadas no coinciden."),
      true,
      "Debe exigir que ambas contraseñas sean idénticas",
    );
    console.log("  ✓ TC-RESET-06 superado");

    // -------------------------------------------------------------------------
    // TC-RESET-07: Validación de contraseña débil
    // -------------------------------------------------------------------------
    console.log("TC-RESET-07: Validación de complejidad de contraseña...");
    await resetPage.fillResetPassword("simple", "simple");
    await resetPage.submitReset();

    const hasComplexityError = await resetPage.isTextVisible(
      "La contraseña debe tener entre 8 y 64 caracteres",
      3000,
    );
    assert.equal(
      hasComplexityError,
      true,
      "Debe exigir mayúscula, minúscula, número y símbolo",
    );
    console.log("  ✓ TC-RESET-07 superado");

    // -------------------------------------------------------------------------
    // TC-RESET-08: Restablecimiento exitoso de contraseña
    // -------------------------------------------------------------------------
    const newPassword = `NewPass.${Date.now()}!`;
    console.log(`TC-RESET-08: Restableciendo contraseña a nueva clave segura...`);
    await resetPage.fillResetPassword(newPassword, newPassword);
    await resetPage.submitReset();

    assert.equal(
      await resetPage.waitForResetSuccessModal(7000),
      true,
      "Debe desplegar modal '¡Contraseña restablecida!'",
    );
    await resetPage.acceptResetSuccessModal();
    await driver.wait(until.urlContains("/login"), 5000);
    console.log("  ✓ TC-RESET-08 superado");

    // -------------------------------------------------------------------------
    // TC-RESET-09: Protección de un solo uso (token ya utilizado)
    // -------------------------------------------------------------------------
    console.log("TC-RESET-09: Verificando que el token no se pueda reutilizar...");
    await resetPage.openResetPage(resetToken);
    assert.equal(
      await resetPage.isInvalidTokenVisible(5000),
      true,
      "Un token ya utilizado debe ser marcado como inválido o expirado",
    );
    console.log("  ✓ TC-RESET-09 superado");

    // -------------------------------------------------------------------------
    // TC-RESET-10: Verificación de Login con nueva contraseña
    // -------------------------------------------------------------------------
    console.log("TC-RESET-10: Login con nueva contraseña y rechazo de la anterior...");
    await clearSession(driver);
    await loginPage.login(targetEmail, "Admin123!");
    const hasOldPassRejected =
      (await loginPage.isTextVisible("Credenciales incorrectas o inexistentes.", 3000)) ||
      (await loginPage.isTextVisible("Correo electrónico o contraseña incorrectos", 3000));
    assert.equal(hasOldPassRejected, true, "La contraseña antigua ya no debe ser válida");

    console.log("Iniciando sesión con la nueva contraseña...");
    await loginPage.login(targetEmail, newPassword);
    await driver.wait(until.urlContains("/menu-asistente"), 10000);
    console.log("  ✓ TC-RESET-10 superado");

    // Restaurar contraseña original para mantener la idempotencia de las suites
    console.log("Restaurando contraseña original del usuario de prueba...");
    const restoreReq = await fetch(`${API_BASE_URL}/auth/recuperar-contrasena`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo: targetEmail }),
    });
    const restoreData = await restoreReq.json();
    if (restoreData.token) {
      await fetch(`${API_BASE_URL}/auth/restablecer-contrasena`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: restoreData.token,
          nuevaContrasena: "Admin123!",
          confirmarContrasena: "Admin123!",
        }),
      });
      console.log("  ✓ Contraseña de organizador@ipn.mx restaurada a Admin123!");
    }

    console.log("\n=======================================================");
    console.log(">>> TODAS LAS PRUEBAS DE RESTABLECIMIENTO PASARON <<<");
    console.log("=======================================================\n");
  } finally {
    await driver.quit();
  }
}

runPasswordResetSuite().catch((err) => {
  console.error("FATAL ERROR in runPasswordResetSuite:", err);
  process.exit(1);
});
