import assert from "node:assert/strict";
import { Builder, WebDriver, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { SubdireccionMenuPage } from "../pages/SubdireccionMenuPage";

async function clearSession(driver: WebDriver): Promise<void> {
  await driver.executeScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
}

async function runAuthE2ESuite(): Promise<void> {
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

  const loginPage = new LoginPage(driver);
  const registerPage = new RegisterPage(driver);
  const subdireccionMenuPage = new SubdireccionMenuPage(driver);

  try {
    // =========================================================================
    // 1. LOGIN TESTS (CU01 - UI01)
    // =========================================================================

    console.log("Running TC-LOGIN-01: Empty form validation...");
    await loginPage.open();
    await clearSession(driver);
    await loginPage.submit();

    assert.equal(
      await loginPage.isTextVisible("Por favor, completa todos los campos"),
      true,
      "Should display general empty-fields message",
    );
    assert.equal(
      await loginPage.isTextVisible("El correo electrónico es requerido."),
      true,
      "Should display required email message",
    );
    assert.equal(
      await loginPage.isTextVisible("La contraseña es requerida."),
      true,
      "Should display required password message",
    );
    console.log("  ✓ TC-LOGIN-01 passed");

    console.log("Running TC-LOGIN-02: Invalid email format validation...");
    await loginPage.open();
    await loginPage.enterCredentials("correo-invalido", "Admin123!");
    assert.equal(
      await loginPage.isTextVisible(
        "Ingresa un correo valido. Ejemplo: usuario@alumno.ipn.mx",
      ),
      true,
      "Should display invalid email format error",
    );
    console.log("  ✓ TC-LOGIN-02 passed");

    console.log("Running TC-LOGIN-03: Invalid credentials error from backend...");
    await loginPage.open();
    await loginPage.login("organizador@ipn.mx", "ClaveIncorrecta99!");
    const hasInvalidCredsMsg =
      (await loginPage.isTextVisible("Credenciales incorrectas o inexistentes.", 3000)) ||
      (await loginPage.isTextVisible("Correo electrónico o contraseña incorrectos", 3000));
    assert.equal(
      hasInvalidCredsMsg,
      true,
      "Should display invalid credentials error",
    );
    console.log("  ✓ TC-LOGIN-03 passed");

    console.log("Running TC-LOGIN-04: Successful login as Subdirección...");
    await loginPage.login("subdireccion@ipn.mx", "Admin123!");
    await subdireccionMenuPage.waitUntilLoaded();
    assert.equal(await subdireccionMenuPage.getHeadingText(), "Menú principal");
    assert.equal(await subdireccionMenuPage.getStoredUserRole(), "Subdirección");
    console.log("  ✓ TC-LOGIN-04 passed");

    console.log("Running TC-LOGIN-05: Successful login as Administrador...");
    await clearSession(driver);
    await loginPage.login("admin@ipn.mx", "Admin123!");
    await driver.wait(until.urlContains("/menu-admin"), 10000);
    console.log("  ✓ TC-LOGIN-05 passed");

    // =========================================================================
    // 2. REGISTRATION TESTS (CU11 - UI02)
    // =========================================================================

    console.log("Running TC-REG-01: Empty registration triggers modal...");
    await clearSession(driver);
    await registerPage.open();
    await registerPage.submit();

    assert.equal(
      await registerPage.isIncompleteModalVisible(),
      true,
      "Should open 'Campos obligatorios incompletos' modal",
    );
    await registerPage.closeIncompleteModal();
    assert.equal(
      await registerPage.isTextVisible("El nombre es requerido."),
      true,
      "Should display required first name error",
    );
    console.log("  ✓ TC-REG-01 passed");

    console.log("Running TC-REG-02: Weak password and mismatch validation...");
    await registerPage.open();
    await registerPage.fillForm({
      correo: "nuevo@alumno.ipn.mx",
      nombre: "Elena",
      apellidoPa: "Gómez",
      contrasena: "debil",
      confirmarContrasena: "otra",
    });

    assert.equal(
      await registerPage.isTextVisible(
        "La contraseña debe tener entre 8 y 64 caracteres",
      ),
      true,
      "Should display password complexity error",
    );
    assert.equal(
      await registerPage.isTextVisible("Las contraseñas no coinciden"),
      true,
      "Should display password mismatch error",
    );
    console.log("  ✓ TC-REG-02 passed");

    console.log("Running TC-REG-03: Duplicate email conflict (409)...");
    await registerPage.open();
    await registerPage.fillForm({
      correo: "organizador@ipn.mx",
      nombre: "Víctor",
      apellidoPa: "Pérez",
      apellidoMaterno: "López",
      contrasena: "Password123!",
      confirmarContrasena: "Password123!",
    });
    await registerPage.submit();

    assert.equal(
      await registerPage.isTextVisible(
        "El correo electrónico ya se encuentra registrado.",
      ),
      true,
      "Should display duplicate email error from backend",
    );
    console.log("  ✓ TC-REG-03 passed");

    console.log(
      "Running TC-REG-04: Successful registration + login with new account...",
    );
    const uniqueEmail = `qa.alumno.${Date.now()}@alumno.ipn.mx`;
    await registerPage.open();
    await registerPage.fillForm({
      correo: uniqueEmail,
      nombre: "Mariana",
      apellidoPa: "Torres",
      apellidoMaterno: "Silva",
      contrasena: "Password123!",
      confirmarContrasena: "Password123!",
    });
    await registerPage.submit();

    assert.equal(
      await registerPage.waitForSuccessModal(),
      true,
      "Should display '¡Registro exitoso!' modal",
    );
    await registerPage.confirmPendingRegistration();
    await registerPage.acceptSuccessModal();

    // Should redirect to /login and allow immediate login as Usuario Interno
    await driver.wait(until.urlContains("/login"), 5000);
    await loginPage.login(uniqueEmail, "Password123!");
    await driver.wait(until.urlContains("/menu-asistente"), 10000);
    console.log("  ✓ TC-REG-04 passed");

    console.log("\nALL 9 AUTH E2E TESTS PASSED SUCCESSFULLY!");
  } finally {
    await driver.quit();
  }
}

runAuthE2ESuite();
