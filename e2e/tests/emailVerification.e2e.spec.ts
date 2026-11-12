import assert from "node:assert/strict";
import { Builder, WebDriver, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000/api";

async function clearSession(driver: WebDriver): Promise<void> {
  await driver.executeScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
}

async function runEmailVerificationSuite(): Promise<void> {
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

  const registerPage = new RegisterPage(driver);
  const loginPage = new LoginPage(driver);

  const timestamp = Date.now();
  const testEmail = `qa.verif.${timestamp}@alumno.ipn.mx`;
  const password = "Password123!";

  try {
    console.log("=== INICIANDO SUITE: VERIFICACIÓN DE REGISTRO POR CORREO ===");

    // -------------------------------------------------------------------------
    // TC-VERIF-01: Registro inicial en UI genera solicitud de confirmación
    // -------------------------------------------------------------------------
    console.log(`TC-VERIF-01: Registrando nuevo usuario (${testEmail})...`);
    await registerPage.open();
    await registerPage.fillForm({
      correo: testEmail,
      nombre: "Carlos",
      apellidoPa: "Ramírez",
      apellidoMaterno: "López",
      contrasena: password,
      confirmarContrasena: password,
    });
    await registerPage.submit();

    const isSuccessModalVisible = await registerPage.waitForSuccessModal(7000);
    assert.equal(
      isSuccessModalVisible,
      true,
      "Debe mostrarse el modal tras solicitar el registro",
    );
    await registerPage.acceptSuccessModal();
    await driver.wait(until.urlContains("/login"), 5000);
    console.log("  ✓ TC-VERIF-01 superado");

    // -------------------------------------------------------------------------
    // TC-VERIF-02: Intento de inicio de sesión antes de confirmar correo
    // -------------------------------------------------------------------------
    console.log("TC-VERIF-02: Intentando iniciar sesión antes de confirmar el correo...");
    await clearSession(driver);
    await loginPage.login(testEmail, password);

    const hasLoginBlocked =
      (await loginPage.isTextVisible("Credenciales incorrectas o inexistentes.", 4000)) ||
      (await loginPage.isTextVisible("Correo electrónico o contraseña incorrectos", 4000));
    assert.equal(
      hasLoginBlocked,
      true,
      "No debe permitir iniciar sesión si el usuario no ha confirmado su registro",
    );
    console.log("  ✓ TC-VERIF-02 superado (acceso no autorizado prevenido)");

    // -------------------------------------------------------------------------
    // TC-VERIF-03: Rechazo de confirmación con token inválido o corrupto
    // -------------------------------------------------------------------------
    console.log("TC-VERIF-03: Verificando rechazo con token inválido...");
    const invalidTokenRes = await fetch(`${API_BASE_URL}/auth/confirmar-registro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "token_completamente_falso_o_corrupto" }),
    });
    assert.equal(
      invalidTokenRes.status,
      400,
      "Debe responder 400 Bad Request ante un token inválido",
    );
    const invalidTokenData = await invalidTokenRes.json();
    assert.ok(
      invalidTokenData.message.includes("inválido"),
      "Debe indicar que el enlace es inválido",
    );
    console.log("  ✓ TC-VERIF-03 superado");

    // -------------------------------------------------------------------------
    // Obtener token legítimo de confirmación generado por el backend
    // -------------------------------------------------------------------------
    console.log("Obteniendo token de verificación para el usuario...");
    const regReq = await fetch(`${API_BASE_URL}/auth/registro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: "Carlos",
        apellidoPa: "Ramírez",
        apellidoMa: "López",
        correo: `segundo.${timestamp}@alumno.ipn.mx`,
        contrasena: password,
      }),
    });
    const regData = await regReq.json();
    const verificationToken = regData.token;
    assert.ok(verificationToken, "El backend debe suministrar el token de verificación");

    // -------------------------------------------------------------------------
    // TC-VERIF-04: Confirmación exitosa mediante POST /api/auth/confirmar-registro
    // -------------------------------------------------------------------------
    console.log("TC-VERIF-04: Confirmando registro con token legítimo (POST)...");
    const confirmRes = await fetch(`${API_BASE_URL}/auth/confirmar-registro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: verificationToken }),
    });

    assert.equal(confirmRes.status, 201, "La confirmación debe responder 201 Created");
    const confirmData = await confirmRes.json();
    assert.ok(confirmData.usuario?.idUsuario, "Debe retornar el usuario creado y activado");
    console.log("  ✓ TC-VERIF-04 superado (cuenta creada y activada)");

    // -------------------------------------------------------------------------
    // TC-VERIF-05: Reutilización de token rechazada (Single-use / Blacklist)
    // -------------------------------------------------------------------------
    console.log("TC-VERIF-05: Verificando que el token no se pueda reutilizar...");
    const reuseRes = await fetch(`${API_BASE_URL}/auth/confirmar-registro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: verificationToken }),
    });

    assert.ok(
      reuseRes.status === 400 || reuseRes.status === 409,
      "Reutilizar el token debe arrojar error (400 o 409)",
    );
    console.log("  ✓ TC-VERIF-05 superado");

    // -------------------------------------------------------------------------
    // TC-VERIF-06: Confirmación por método GET (enlace directo del correo)
    // -------------------------------------------------------------------------
    console.log("TC-VERIF-06: Verificando confirmación vía GET (enlace de correo)...");
    const emailGet = `tercero.${timestamp}@alumno.ipn.mx`;
    const regGetReq = await fetch(`${API_BASE_URL}/auth/registro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: "Laura",
        apellidoPa: "Mendoza",
        apellidoMa: "Cruz",
        correo: emailGet,
        contrasena: password,
      }),
    });
    const regGetData = await regGetReq.json();
    const getToken = regGetData.token;

    const confirmGetRes = await fetch(
      `${API_BASE_URL}/auth/confirmar-registro?token=${encodeURIComponent(getToken)}`,
      { method: "GET" },
    );
    assert.equal(confirmGetRes.status, 200, "Confirmación vía GET debe responder 200 OK");
    console.log("  ✓ TC-VERIF-06 superado");

    // -------------------------------------------------------------------------
    // TC-VERIF-07: Login exitoso del usuario tras haber confirmado su correo
    // -------------------------------------------------------------------------
    console.log("TC-VERIF-07: Iniciando sesión en frontend con la cuenta confirmada...");
    await clearSession(driver);
    await loginPage.login(emailGet, password);
    await driver.wait(until.urlContains("/menu-asistente"), 10000);

    const sessionData = await driver.executeScript<{
      hasToken: boolean;
      correo: string | null;
      tipoCuenta: string | null;
    }>(() => {
      const token = window.localStorage.getItem("token");
      const rawUser = window.localStorage.getItem("usuario");
      const user = rawUser ? JSON.parse(rawUser) : null;
      return {
        hasToken: Boolean(token && token.length > 0),
        correo: user?.correo ?? null,
        tipoCuenta: user?.tipoCuenta ?? null,
      };
    });

    assert.equal(sessionData.hasToken, true, "Debe almacenar token JWT en localStorage");
    assert.equal(sessionData.correo, emailGet);
    assert.equal(sessionData.tipoCuenta, "Usuario Interno");
    console.log("  ✓ TC-VERIF-07 superado (login y redirección a /menu-asistente exitosos)");

    console.log("\n=======================================================");
    console.log(">>> TODAS LAS PRUEBAS DE VERIFICACIÓN PASARON <<<");
    console.log("=======================================================\n");
  } finally {
    await driver.quit();
  }
}

runEmailVerificationSuite().catch((err) => {
  console.error("FATAL ERROR in runEmailVerificationSuite:", err);
  process.exit(1);
});
