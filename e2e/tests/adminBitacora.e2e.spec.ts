import assert from "node:assert/strict";
import { Builder, By, WebDriver, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";
import { LoginPage } from "../pages/LoginPage";

async function runAdminBitacoraSuite(): Promise<void> {
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
    // TC-BIT-01: Login as Admin -> Verify /menu-admin cards & Navbar options
    // =========================================================================
    console.log(
      "Running TC-BIT-01: Login as Administrador -> Verify /menu-admin & Navbar links...",
    );
    await loginPage.login("admin@ipn.mx", "Admin123!");
    await driver.wait(until.urlContains("/menu-admin"), 10000);

    const heading = await driver.wait(
      until.elementLocated(
        By.xpath("//h1[normalize-space()='Menú Principal de Administración']"),
      ),
      5000,
    );
    assert.equal(await heading.isDisplayed(), true);

    const expectedNavLinks = [
      "Menú",
      "Bitácora",
      "Gestión de Jefes de departamento",
      "Gestión de espacios",
      "Gestión de usuarios",
    ];
    for (const label of expectedNavLinks) {
      const link = await driver.findElement(
        By.xpath(`//nav//a[normalize-space()=${JSON.stringify(label)}]`),
      );
      assert.equal(
        await link.isDisplayed(),
        true,
        `Navbar link '${label}' should be visible`,
      );
    }
    console.log("  ✓ TC-BIT-01 passed");

    // =========================================================================
    // TC-BIT-02: Navigate to Bitácora (/admin/bitacora) & verify table structure
    // =========================================================================
    console.log(
      "Running TC-BIT-02: Navigate to /admin/bitacora & verify table headers...",
    );
    const consultarBitacoraBtn = await driver.findElement(
      By.xpath("//button[normalize-space()='Consultar Bitacora']"),
    );
    await consultarBitacoraBtn.click();

    await driver.wait(until.urlContains("/admin/bitacora"), 10000);
    await driver.wait(
      until.elementLocated(
        By.xpath("//h1[contains(normalize-space(), 'Bitácora')]"),
      ),
      5000,
    );

    for (const col of ["Evento", "Estado", "Usuario", "Fecha", "Hora"]) {
      const th = await driver.findElement(
        By.xpath(`//table//th[normalize-space()=${JSON.stringify(col)}]`),
      );
      assert.equal(await th.isDisplayed(), true);
    }
    console.log("  ✓ TC-BIT-02 passed");

    // =========================================================================
    // TC-BIT-03: Search events in Bitácora (non-existent filter + reset)
    // =========================================================================
    console.log(
      "Running TC-BIT-03: Search filter in Bitácora (no-match & reset)...",
    );
    const searchInput = await driver.findElement(
      By.css("input[placeholder='Buscar evento']"),
    );
    const searchSubmitBtn = await driver.findElement(
      By.css("button[aria-label='Buscar']"),
    );

    await searchInput.clear();
    await searchInput.sendKeys("EventoInexistenteXYZ999");
    await searchSubmitBtn.click();

    const emptyMsg = await driver.wait(
      until.elementLocated(
        By.xpath(
          "//td[contains(normalize-space(),'No se encontraron movimientos registrados.')]",
        ),
      ),
      5000,
    );
    assert.equal(await emptyMsg.isDisplayed(), true);

    // Clear search and reload all records
    await driver.executeScript((el: HTMLInputElement) => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      )?.set;
      setter?.call(el, "");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }, searchInput);
    await searchSubmitBtn.click();
    await driver.sleep(400);
    console.log("  ✓ TC-BIT-03 passed");

    // =========================================================================
    // TC-BIT-04: Export Bitácora CSV -> Confirm success modal -> Back to menu
    // =========================================================================
    console.log(
      "Running TC-BIT-04: Export Bitácora -> Verify modal -> Return to /menu-admin...",
    );
    const exportBtn = await driver.findElement(
      By.xpath("//button[normalize-space()='Exportar']"),
    );
    await exportBtn.click();

    const exportModalHeading = await driver.wait(
      until.elementLocated(
        By.xpath(
          "//dialog[@open]//h2[normalize-space()='Bitácora exportada correctamente']",
        ),
      ),
      5000,
    );
    await driver.wait(until.elementIsVisible(exportModalHeading), 5000);

    const acceptBtn = await driver.findElement(
      By.xpath("//dialog[@open]//button[normalize-space()='Aceptar']"),
    );
    await acceptBtn.click();

    const backToMenuBtn = await driver.findElement(
      By.xpath("//button[contains(normalize-space(),'Volver al menú')]"),
    );
    await backToMenuBtn.click();
    await driver.wait(until.urlContains("/menu-admin"), 5000);
    console.log("  ✓ TC-BIT-04 passed");

    console.log(
      "\nALL 4 ADMIN BITÁCORA & MENÚ E2E TESTS PASSED SUCCESSFULLY!",
    );
  } finally {
    await driver.quit();
  }
}

runAdminBitacoraSuite();
