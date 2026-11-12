import assert from "node:assert/strict";
import { Builder, By, WebDriver, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";
import { LoginPage } from "../pages/LoginPage";

async function runAdminPerfilSuite(): Promise<void> {
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

  try {
    // =========================================================================
    // TC-PER-01: Login as Admin -> Navigate to /perfil via Navbar profile button
    // =========================================================================
    console.log(
      "Running TC-PER-01: Login as Admin -> Click Navbar 'Perfil de usuario' icon -> /perfil...",
    );
    await loginPage.login("admin@ipn.mx", "Admin123!");
    await driver.wait(until.urlContains("/menu-admin"), 10000);

    const profileBtn = await driver.findElement(
      By.css("[aria-label='Perfil de usuario']"),
    );
    await profileBtn.click();

    await driver.wait(until.urlContains("/perfil"), 10000);
    const heading = await driver.wait(
      until.elementLocated(By.xpath("//h1[normalize-space()='Perfil']")),
      5000,
    );
    assert.equal(await heading.isDisplayed(), true);
    console.log("  ✓ TC-PER-01 passed");

    // =========================================================================
    // TC-PER-02: Verify Admin profile details (Name, Role, User type & hidden verification badge per PR #92)
    // =========================================================================
    console.log(
      "Running TC-PER-02: Verify Administrador data rendered on /perfil...",
    );
    const fullNameHeading = await driver.wait(
      until.elementLocated(
        By.xpath("//h2[contains(normalize-space(),'Carlos Ramírez')]"),
      ),
      5000,
    );
    assert.equal(await fullNameHeading.isDisplayed(), true);

    const verifiedBadges = await driver.findElements(
      By.xpath("//span[normalize-space()='Verificado' or normalize-space()='Sin verificar']"),
    );
    assert.equal(
      verifiedBadges.length,
      0,
      "Verification badge should not be rendered for Administrador",
    );

    const roleText = await driver.findElement(
      By.xpath("//p[contains(normalize-space(),'Rol: Administrador')]"),
    );
    assert.equal(await roleText.isDisplayed(), true);

    const userTypeText = await driver.findElement(
      By.xpath(
        "//p[contains(normalize-space(),'Tipo de usuario: Administrador')]",
      ),
    );
    assert.equal(await userTypeText.isDisplayed(), true);
    console.log("  ✓ TC-PER-02 passed");

    // =========================================================================
    // TC-PER-03: '← Volver al menú' returns to /menu-admin & 'Cerrar sesión' logs out
    // =========================================================================
    console.log(
      "Running TC-PER-03: Test '← Volver al menú' and 'Cerrar sesión' logout flow...",
    );
    const backBtn = await driver.findElement(
      By.xpath("//button[contains(normalize-space(),'Volver al menú')]"),
    );
    await backBtn.click();
    await driver.wait(until.urlContains("/menu-admin"), 5000);

    // Return to /perfil and click 'Cerrar sesión'
    const profileBtnAgain = await driver.findElement(
      By.css("[aria-label='Perfil de usuario']"),
    );
    await profileBtnAgain.click();
    await driver.wait(until.urlContains("/perfil"), 5000);

    const logoutBtn = await driver.wait(
      until.elementLocated(
        By.xpath("//button[normalize-space()='Cerrar sesión']"),
      ),
      5000,
    );
    await logoutBtn.click();

    await driver.wait(until.urlContains("/login"), 5000);

    const sessionCleared = await driver.executeScript<boolean>(() => {
      return (
        window.localStorage.getItem("token") === null &&
        window.localStorage.getItem("usuario") === null
      );
    });
    assert.equal(
      sessionCleared,
      true,
      "localStorage token and usuario must be cleared after Cerrar sesión",
    );
    console.log("  ✓ TC-PER-03 passed");

    console.log("\nALL 3 ADMIN VER PERFIL E2E TESTS PASSED SUCCESSFULLY!");
  } finally {
    await driver.quit();
  }
}

runAdminPerfilSuite();
