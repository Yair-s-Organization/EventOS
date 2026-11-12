import assert from "node:assert/strict";
import { Builder, By, WebDriver, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";
import { LoginPage } from "../pages/LoginPage";

async function createDisposableTestUser(): Promise<{
  correo: string;
  nombreCompleto: string;
}> {
  const timestamp = Date.now();
  const correo = `borrar.${timestamp}@alumno.ipn.mx`;
  const payload = {
    nombre: "UsuarioBorrar",
    apellidoPa: "Prueba",
    apellidoMa: "Temporal",
    correo,
    contrasena: "Password123!",
  };

  const res = await fetch("http://localhost:3000/api/auth/registro", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Failed to create disposable user: ${await res.text()}`);
  }
  const data = await res.json();
  if (data.token) {
    const confirmRes = await fetch("http://localhost:3000/api/auth/confirmar-registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: data.token }),
    });
    if (!confirmRes.ok) {
      throw new Error(`Failed to confirm disposable user: ${await confirmRes.text()}`);
    }
  }
  return {
    correo,
    nombreCompleto: "UsuarioBorrar Prueba Temporal",
  };
}

async function runAdminGestionUsuariosSuite(): Promise<void> {
  const options = new chrome.Options();
  options.addArguments("--window-size=1366,900");
  if (process.env.HEADLESS === "true") {
    options.addArguments(
      "--headless=new",
      "--no-sandbox",
      "--disable-dev-shm-usage",
    );
  }

  const disposableUser = await createDisposableTestUser();

  const driver: WebDriver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  const loginPage = new LoginPage(driver);

  try {
    // =========================================================================
    // TC-USU-01: Login as Admin -> Navigate to /admin/gestion-usuarios
    // =========================================================================
    console.log(
      "Running TC-USU-01: Login as Admin -> Navigate to /admin/gestion-usuarios...",
    );
    await loginPage.login("admin@ipn.mx", "Admin123!");
    await driver.wait(until.urlContains("/menu-admin"), 10000);

    const navLink = await driver.findElement(
      By.xpath("//nav//a[normalize-space()='Gestión de usuarios']"),
    );
    await navLink.click();

    await driver.wait(until.urlContains("/admin/gestion-usuarios"), 10000);
    await driver.wait(
      until.elementLocated(
        By.xpath("//h1[normalize-space()='Cuentas del sistema']"),
      ),
      5000,
    );

    for (const col of ["Nombre", "Correo", "Rol", "Acción"]) {
      const th = await driver.findElement(
        By.xpath(`//table//th[normalize-space()=${JSON.stringify(col)}]`),
      );
      assert.equal(await th.isDisplayed(), true);
    }
    console.log("  ✓ TC-USU-01 passed");

    // =========================================================================
    // TC-USU-02: Filter by role ('No verificado') and search by email
    // =========================================================================
    console.log(
      "Running TC-USU-02: Filter by role ('No verificado') and search disposable user...",
    );
    const roleSelect = await driver.findElement(By.css("select"));
    await roleSelect
      .findElement(By.css("option[value='No verificado']"))
      .click();
    await driver.sleep(450);

    const searchInput = await driver.findElement(
      By.css("input[placeholder='Buscar por nombre o correo...']"),
    );
    await searchInput.clear();
    await searchInput.sendKeys(disposableUser.correo);
    await driver.sleep(500);

    const userRow = await driver.wait(
      until.elementLocated(
        By.xpath(
          `//table//td[normalize-space()=${JSON.stringify(disposableUser.correo)}]/parent::tr`,
        ),
      ),
      5000,
    );
    assert.equal(await userRow.isDisplayed(), true);
    console.log("  ✓ TC-USU-02 passed");

    // =========================================================================
    // TC-USU-03: Click 'Eliminar' -> Verify confirmation modal & test 'Cancelar'
    // =========================================================================
    console.log(
      "Running TC-USU-03: Open '¿Eliminar cuenta de usuario?' modal & test 'Cancelar'...",
    );
    const deleteBtn = await userRow.findElement(
      By.xpath(".//button[normalize-space()='Eliminar']"),
    );
    await deleteBtn.click();

    const confirmHeading = await driver.wait(
      until.elementLocated(
        By.xpath("//h2[normalize-space()='¿Eliminar cuenta de usuario?']"),
      ),
      5000,
    );
    assert.equal(await confirmHeading.isDisplayed(), true);

    const cancelBtn = await driver.findElement(
      By.xpath("//button[normalize-space()='Cancelar']"),
    );
    await cancelBtn.click();

    // User should still be present after canceling
    const stillPresent = await driver.findElements(
      By.xpath(
        `//table//td[normalize-space()=${JSON.stringify(disposableUser.correo)}]`,
      ),
    );
    assert.equal(stillPresent.length, 1);
    console.log("  ✓ TC-USU-03 passed");

    // =========================================================================
    // TC-USU-04: Confirm 'Eliminar' -> Verify 'Usuario eliminado' modal & removal
    // =========================================================================
    console.log(
      "Running TC-USU-04: Confirm 'Aceptar' deletion -> Verify 'Usuario eliminado' modal...",
    );
    const deleteBtnAgain = await driver.findElement(
      By.xpath(
        `//table//td[normalize-space()=${JSON.stringify(disposableUser.correo)}]/parent::tr//button[normalize-space()='Eliminar']`,
      ),
    );
    await deleteBtnAgain.click();

    const acceptDeleteBtn = await driver.wait(
      until.elementLocated(By.xpath("//button[normalize-space()='Aceptar']")),
      5000,
    );
    await acceptDeleteBtn.click();

    const deletedModalHeading = await driver.wait(
      until.elementLocated(
        By.xpath("//h2[normalize-space()='Usuario eliminado']"),
      ),
      5000,
    );
    assert.equal(await deletedModalHeading.isDisplayed(), true);

    const closeSuccessBtn = await driver.findElement(
      By.xpath("//button[normalize-space()='Aceptar']"),
    );
    await closeSuccessBtn.click();

    const remainingRows = await driver.findElements(
      By.xpath(
        `//table//td[normalize-space()=${JSON.stringify(disposableUser.correo)}]`,
      ),
    );
    assert.equal(
      remainingRows.length,
      0,
      "Deleted user should no longer appear in active accounts table",
    );
    console.log("  ✓ TC-USU-04 passed");

    console.log(
      "\nALL 4 ADMIN GESTIÓN DE USUARIOS E2E TESTS PASSED SUCCESSFULLY!",
    );
  } finally {
    await driver.quit();
  }
}

runAdminGestionUsuariosSuite();
