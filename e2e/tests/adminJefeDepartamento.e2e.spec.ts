import assert from "node:assert/strict";
import { Builder, By, WebDriver, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";
import { LoginPage } from "../pages/LoginPage";

async function runAdminJefeDepartamentoSuite(): Promise<void> {
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
    // TC-JEF-01: Login as Admin -> Navigate to /admin/jefe-departamento & verify exclusions
    // =========================================================================
    console.log(
      "Running TC-JEF-01: Navigate to /admin/jefe-departamento & verify Admin/Subdirección exclusion...",
    );
    await loginPage.login("admin@ipn.mx", "Admin123!");
    await driver.wait(until.urlContains("/menu-admin"), 10000);

    const navLink = await driver.findElement(
      By.xpath(
        "//nav//a[normalize-space()='Gestión de Jefes de departamento']",
      ),
    );
    await navLink.click();

    await driver.wait(until.urlContains("/admin/jefe-departamento"), 10000);
    await driver.wait(
      until.elementLocated(
        By.xpath("//h1[normalize-space()='Asignar Jefe de Departamento']"),
      ),
      5000,
    );
    await driver.sleep(500);

    // Verify neither admin@ipn.mx nor subdireccion@ipn.mx appear in candidates table
    const adminRows = await driver.findElements(
      By.xpath("//table//td[normalize-space()='admin@ipn.mx']"),
    );
    const subdirRows = await driver.findElements(
      By.xpath("//table//td[normalize-space()='subdireccion@ipn.mx']"),
    );
    assert.equal(
      adminRows.length,
      0,
      "admin@ipn.mx must not appear as a candidate for Jefe de Departamento",
    );
    assert.equal(
      subdirRows.length,
      0,
      "subdireccion@ipn.mx must not appear as a candidate for Jefe de Departamento",
    );
    console.log("  ✓ TC-JEF-01 passed");

    // =========================================================================
    // TC-JEF-02: Search institutional candidate ('organizador@ipn.mx') & test Cancel modal
    // =========================================================================
    console.log(
      "Running TC-JEF-02: Search 'organizador@ipn.mx' & test Cancelar in Assign modal...",
    );
    const searchInput = await driver.findElement(
      By.css("input[placeholder='Buscar Correo o nombre...']"),
    );
    const searchBtn = await driver.findElement(
      By.css("button[aria-label='Buscar']"),
    );

    await searchInput.clear();
    await searchInput.sendKeys("organizador@ipn.mx");
    await searchBtn.click();
    await driver.sleep(400);

    // If organizador@ipn.mx is currently in Revocar Jefe tab from a previous run, revoke first
    let candidateRow = await driver.findElements(
      By.xpath("//table//td[normalize-space()='organizador@ipn.mx']/parent::tr"),
    );
    if (candidateRow.length === 0) {
      const revocarTab = await driver.findElement(
        By.xpath("//button[normalize-space()='Revocar Jefe']"),
      );
      await revocarTab.click();
      await driver.sleep(400);
      const revBtn = await driver.findElement(
        By.xpath(
          "//table//td[normalize-space()='organizador@ipn.mx']/parent::tr//button[normalize-space()='Revocar']",
        ),
      );
      await revBtn.click();
      const confirmRevBtn = await driver.wait(
        until.elementLocated(
          By.xpath("//button[normalize-space()='Confirmar']"),
        ),
        5000,
      );
      await confirmRevBtn.click();
      await driver.sleep(500);
      const asignarTab = await driver.findElement(
        By.xpath("//button[normalize-space()='Asignar Jefe']"),
      );
      await asignarTab.click();
      await driver.sleep(400);
    }

    const assignRowBtn = await driver.wait(
      until.elementLocated(
        By.xpath(
          "//table//td[normalize-space()='organizador@ipn.mx']/parent::tr//button[normalize-space()='Asignar Jefe']",
        ),
      ),
      5000,
    );
    await assignRowBtn.click();

    const modalTitle = await driver.wait(
      until.elementLocated(
        By.xpath("//h2[normalize-space()='Asignar Jefe de Departamento']"),
      ),
      5000,
    );
    assert.equal(await modalTitle.isDisplayed(), true);

    const cancelBtn = await driver.findElement(
      By.xpath("//button[normalize-space()='Cancelar']"),
    );
    await cancelBtn.click();
    console.log("  ✓ TC-JEF-02 passed");

    // =========================================================================
    // TC-JEF-03: Confirm 'Asignar' Jefe de Departamento to 'organizador@ipn.mx'
    // =========================================================================
    console.log(
      "Running TC-JEF-03: Confirm 'Asignar' Jefe de Departamento to 'organizador@ipn.mx'...",
    );
    const assignBtnAgain = await driver.findElement(
      By.xpath(
        "//table//td[normalize-space()='organizador@ipn.mx']/parent::tr//button[normalize-space()='Asignar Jefe']",
      ),
    );
    await assignBtnAgain.click();

    const confirmAssignBtn = await driver.wait(
      until.elementLocated(By.xpath("//button[normalize-space()='Asignar']")),
      5000,
    );
    await confirmAssignBtn.click();

    const successBanner = await driver.wait(
      until.elementLocated(
        By.xpath(
          "//*[contains(normalize-space(),'fue asignado como Jefe de Departamento')]",
        ),
      ),
      5000,
    );
    assert.equal(await successBanner.isDisplayed(), true);
    console.log("  ✓ TC-JEF-03 passed");

    // =========================================================================
    // TC-JEF-04: Switch to 'Revocar Jefe' tab & revoke Jefe de Departamento
    // =========================================================================
    console.log(
      "Running TC-JEF-04: Switch to 'Revocar Jefe' tab & revoke 'organizador@ipn.mx'...",
    );
    const revocarTabBtn = await driver.findElement(
      By.xpath("//button[normalize-space()='Revocar Jefe']"),
    );
    await revocarTabBtn.click();

    const revokeRowBtn = await driver.wait(
      until.elementLocated(
        By.xpath(
          "//table//td[normalize-space()='organizador@ipn.mx']/parent::tr//button[normalize-space()='Revocar']",
        ),
      ),
      5000,
    );
    await revokeRowBtn.click();

    const revokeModalTitle = await driver.wait(
      until.elementLocated(
        By.xpath("//h2[normalize-space()='Revocar Jefe de Departamento']"),
      ),
      5000,
    );
    assert.equal(await revokeModalTitle.isDisplayed(), true);

    const confirmRevokeBtn = await driver.findElement(
      By.xpath("//button[normalize-space()='Confirmar']"),
    );
    await confirmRevokeBtn.click();

    const revokeSuccessBanner = await driver.wait(
      until.elementLocated(
        By.xpath("//*[contains(normalize-space(),'fue revocado del cargo')]"),
      ),
      5000,
    );
    assert.equal(await revokeSuccessBanner.isDisplayed(), true);
    console.log("  ✓ TC-JEF-04 passed");

    console.log(
      "\nALL 4 ADMIN GESTIÓN DE JEFES DE DEPARTAMENTO E2E TESTS PASSED SUCCESSFULLY!",
    );
  } finally {
    await driver.quit();
  }
}

runAdminJefeDepartamentoSuite();
