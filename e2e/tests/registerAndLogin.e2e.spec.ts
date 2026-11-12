import assert from "node:assert/strict";
import { Builder, WebDriver, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";

async function testRegisterAndLoginFlow(): Promise<void> {
  const options = new chrome.Options();
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

  const uniqueEmail = `qa.usuario.${Date.now()}@alumno.ipn.mx`;
  const password = "Password123!";

  try {
    // 1. Open /registro and create a new profile (CU11)
    console.log(`1. Registrando nuevo perfil: ${uniqueEmail}...`);
    await registerPage.open();
    await registerPage.fillForm({
      correo: uniqueEmail,
      nombre: "Alejandro",
      apellidoPa: "Navarro",
      apellidoMaterno: "Soto",
      contrasena: password,
      confirmarContrasena: password,
    });
    await registerPage.submit();

    // 2. Verify success modal and accept to navigate to /login
    const isSuccessModalDisplayed = await registerPage.waitForSuccessModal();
    assert.equal(
      isSuccessModalDisplayed,
      true,
      "Expected '¡Registro exitoso!' modal to appear",
    );
    await registerPage.confirmPendingRegistration();
    await registerPage.acceptSuccessModal();

    // 3. Wait for /login redirect and sign in without CAPTCHA (CU01)
    await driver.wait(until.urlContains("/login"), 5000);
    console.log(`2. Iniciando sesión con el perfil creado (${uniqueEmail})...`);
    await loginPage.login(uniqueEmail, password);

    // 4. Verify redirect to /menu-asistente and session stored in localStorage
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

    assert.equal(sessionData.hasToken, true, "Expected JWT token in localStorage");
    assert.equal(sessionData.correo, uniqueEmail);
    assert.equal(sessionData.tipoCuenta, "Usuario Interno");

    console.log(
      `PASS: Flujo completo (Registro -> Login -> /menu-asistente) exitoso para ${uniqueEmail}.`,
    );
  } finally {
    await driver.quit();
  }
}

testRegisterAndLoginFlow();
