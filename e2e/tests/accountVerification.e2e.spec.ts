import assert from "node:assert/strict";
import path from "node:path";
import { By, WebDriver, until } from "selenium-webdriver";
import { LoginPage } from "../pages/LoginPage";
import {
  API_URL,
  BASE_URL,
  connectTestDb,
  createChromeDriver,
} from "../utils/testEnv";

async function registerAndConfirmDisposableUser(email: string, password: string) {
  const regRes = await fetch(`${API_URL}/auth/registro`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: "Valeria",
      apellidoPa: "Verificacion",
      apellidoMa: "Test",
      correo: email,
      contrasena: password,
    }),
  });
  assert.equal(regRes.ok, true, `Failed to register test user: ${regRes.status}`);
  const regData: any = await regRes.json();
  const token = regData.token ?? regData.tokenConfirmacion;
  assert.equal(Boolean(token), true, "Expected confirmation token from /auth/registro");

  const confirmRes = await fetch(`${API_URL}/auth/confirmar-registro`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  assert.equal(confirmRes.ok, true, "Failed to confirm test user email");
}

async function getSubdireccionToken(): Promise<string> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      correo: "subdireccion@ipn.mx",
      contrasena: "Admin123!",
      captchaToken: "e2e-bypass",
    }),
  });
  assert.equal(res.ok, true, "Failed to authenticate Subdirección");
  const data: any = await res.json();
  return data.access_token;
}

async function runAccountVerificationSuite(): Promise<void> {
  const driver: WebDriver = await createChromeDriver();
  const loginPage = new LoginPage(driver);
  const db = await connectTestDb();

  const uniqueSuffix = Date.now().toString().slice(-7);
  const testEmail = `verif.e2e.${uniqueSuffix}@alumno.ipn.mx`;
  const testPassword = "Password123!";
  const pdfFixturePath = path.resolve(__dirname, "../fixtures/comprobante.pdf");

  try {
    await registerAndConfirmDisposableUser(testEmail, testPassword);

    // =========================================================================
    // TC-VER-01: Unverified user visits /perfil, sees 'Sin verificar' badge & banner, navigates to /verificacion
    // =========================================================================
    console.log(
      "Running TC-VER-01: Unverified user sees 'Sin verificar' on /perfil and navigates to /verificacion...",
    );
    await loginPage.login(testEmail, testPassword);
    await driver.wait(until.urlContains("/menu-asistente"), 10000);

    await driver.get(`${BASE_URL}/perfil`);
    const unverifiedBadge = await driver.wait(
      until.elementLocated(
        By.xpath("//span[normalize-space()='Sin verificar']"),
      ),
      8000,
    );
    assert.equal(await unverifiedBadge.isDisplayed(), true);

    const verifyBtn = await driver.wait(
      until.elementLocated(
        By.xpath("//button[normalize-space()='Verificar Cuenta']"),
      ),
      5000,
    );
    await verifyBtn.click();

    await driver.wait(until.urlContains("/verificacion"), 8000);
    const verifHeading = await driver.wait(
      until.elementLocated(
        By.xpath("//h1[normalize-space()='Verificación de identidad']"),
      ),
      5000,
    );
    assert.equal(await verifHeading.isDisplayed(), true);
    console.log("  ✓ TC-VER-01 passed");

    // =========================================================================
    // TC-VER-02: Submitting without PDF shows client-side validation error
    // =========================================================================
    console.log(
      "Running TC-VER-02: Submit without attaching PDF -> validation error...",
    );
    const submitBtn = await driver.findElement(
      By.xpath("//button[normalize-space()='Enviar solicitud de verificacion']"),
    );
    await submitBtn.click();

    const missingPdfError = await driver.wait(
      until.elementLocated(
        By.xpath(
          "//*[contains(normalize-space(),'Por favor adjunta el archivo PDF correspondiente.')]",
        ),
      ),
      5000,
    );
    assert.equal(await missingPdfError.isDisplayed(), true);
    console.log("  ✓ TC-VER-02 passed");

    // =========================================================================
    // TC-VER-03: Dynamic fields update when switching Tipo de perfil
    // =========================================================================
    console.log(
      "Running TC-VER-03: Dynamic form labels and inputs per Tipo de perfil...",
    );
    const selectPerfil = await driver.findElement(By.id("tipoPerfil"));

    // Default: Estudiante -> Número de boleta
    const boletaLabel = await driver.findElement(
      By.xpath("//label[normalize-space()='Número de boleta']"),
    );
    assert.equal(await boletaLabel.isDisplayed(), true);

    // Switch to Profesor -> Número de empleado
    await selectPerfil.findElement(By.css("option[value='Profesor']")).click();
    const empleadoLabel = await driver.wait(
      until.elementLocated(
        By.xpath("//label[normalize-space()='Número de empleado']"),
      ),
      5000,
    );
    assert.equal(await empleadoLabel.isDisplayed(), true);

    // Switch to Empresa -> Nombre de empresa o dependencia
    await selectPerfil.findElement(By.css("option[value='Empresa']")).click();
    const empresaLabel = await driver.wait(
      until.elementLocated(
        By.xpath("//label[normalize-space()='Nombre de empresa o dependencia']"),
      ),
      5000,
    );
    assert.equal(await empresaLabel.isDisplayed(), true);

    // Switch to Externo -> hides #infoAdicional input
    await selectPerfil.findElement(By.css("option[value='Externo']")).click();
    const infoInputs = await driver.findElements(By.id("infoAdicional"));
    assert.equal(
      infoInputs.length,
      0,
      "Externo profile should not display additional info text field",
    );

    // Switch back to Estudiante
    await selectPerfil.findElement(By.css("option[value='Estudiante']")).click();
    await driver.wait(until.elementLocated(By.id("infoAdicional")), 5000);
    console.log("  ✓ TC-VER-03 passed");

    // =========================================================================
    // TC-VER-04: Submitting invalid boleta format triggers backend validation error
    // =========================================================================
    console.log(
      "Running TC-VER-04: Invalid boleta format rejected by backend...",
    );
    const infoInput = await driver.findElement(By.id("infoAdicional"));
    await infoInput.clear();
    await infoInput.sendKeys("ABC-INVALID");

    const fileInput = await driver.findElement(By.id("archivo"));
    await fileInput.sendKeys(pdfFixturePath);

    await submitBtn.click();

    const formatError = await driver.wait(
      until.elementLocated(
        By.xpath("//*[contains(normalize-space(),'dígitos válidos')]"),
      ),
      8000,
    );
    assert.equal(await formatError.isDisplayed(), true);
    console.log("  ✓ TC-VER-04 passed");

    // =========================================================================
    // TC-VER-05: Submitting valid Estudiante boleta + PDF succeeds and redirects to /perfil
    // =========================================================================
    console.log(
      "Running TC-VER-05: Valid Estudiante verification request redirects to /perfil...",
    );
    const infoInputValid = await driver.findElement(By.id("infoAdicional"));
    await infoInputValid.clear();
    await infoInputValid.sendKeys("2022630456");

    const submitBtnValid = await driver.findElement(
      By.xpath("//button[normalize-space()='Enviar solicitud de verificacion']"),
    );
    await submitBtnValid.click();

    await driver.wait(until.urlContains("/perfil"), 10000);
    console.log("  ✓ TC-VER-05 passed");

    // =========================================================================
    // TC-VER-06: Subdirección rejects and approves verification; /perfil reflects 'Verificado'
    // =========================================================================
    console.log(
      "Running TC-VER-06: Subdirección reviews, rejects, and approves verification -> 'Verificado' on /perfil...",
    );
    const subToken = await getSubdireccionToken();

    // 1. Find the pending verification in Subdirección list
    const listRes1 = await fetch(
      `${API_URL}/usuarios/verificaciones/pendientes?buscar=${encodeURIComponent(testEmail)}`,
      {
        headers: { Authorization: `Bearer ${subToken}` },
      },
    );
    assert.equal(listRes1.ok, true);
    const pendingList1: any[] = await listRes1.json();
    assert.equal(
      pendingList1.length >= 1,
      true,
      "Pending verification should appear in Subdirección list",
    );
    const idVerificacion1 = pendingList1[0].idVerificacion;

    // 2. Reject the first request with a reason
    const rejectRes = await fetch(
      `${API_URL}/usuarios/verificaciones/${idVerificacion1}/rechazar`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${subToken}`,
        },
        body: JSON.stringify({
          motivo: "Documento ilegible en la primera página",
        }),
      },
    );
    assert.equal(rejectRes.ok, true, "Subdirección rejection should succeed");

    // 3. Re-submit from /verificacion
    await driver.get(`${BASE_URL}/verificacion`);
    const boletaInput2 = await driver.wait(
      until.elementLocated(By.id("infoAdicional")),
      8000,
    );
    await boletaInput2.clear();
    await boletaInput2.sendKeys("2022630456");

    const fileInput2 = await driver.findElement(By.id("archivo"));
    await fileInput2.sendKeys(pdfFixturePath);

    const submitBtn2 = await driver.findElement(
      By.xpath("//button[normalize-space()='Enviar solicitud de verificacion']"),
    );
    await submitBtn2.click();
    await driver.wait(until.urlContains("/perfil"), 10000);

    // 4. Approve the new verification request as Subdirección
    const listRes2 = await fetch(
      `${API_URL}/usuarios/verificaciones/pendientes?buscar=${encodeURIComponent(testEmail)}`,
      {
        headers: { Authorization: `Bearer ${subToken}` },
      },
    );
    const pendingList2: any[] = await listRes2.json();
    assert.equal(pendingList2.length >= 1, true);
    const idVerificacion2 = pendingList2[0].idVerificacion;

    const approveRes = await fetch(
      `${API_URL}/usuarios/verificaciones/${idVerificacion2}/aprobar`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${subToken}` },
      },
    );
    assert.equal(approveRes.ok, true, "Subdirección approval should succeed");

    // 5. Refresh /perfil and verify badge is now 'Verificado'
    await driver.navigate().refresh();
    const verifiedBadge = await driver.wait(
      until.elementLocated(
        By.xpath("//span[normalize-space()='Verificado']"),
      ),
      8000,
    );
    assert.equal(await verifiedBadge.isDisplayed(), true);

    const warningBanners = await driver.findElements(
      By.xpath(
        "//*[contains(normalize-space(),'Verifica tu cuenta para realizar una solicitud')]",
      ),
    );
    assert.equal(
      warningBanners.length,
      0,
      "Verification prompt banner should disappear once verified",
    );
    console.log("  ✓ TC-VER-06 passed");

    console.log("\nAll 6 Account Verification E2E tests passed successfully!");
  } finally {
    // Cleanup disposable user and its verifications
    try {
      await db.query(
        `DELETE FROM verificacion WHERE "idUsuario" IN (SELECT "idUsuario" FROM usuario WHERE correo = $1)`,
        [testEmail],
      );
      await db.query(`DELETE FROM usuario WHERE correo = $1`, [testEmail]);
    } catch {
      // Ignore cleanup errors
    }
    await db.end();
    await driver.quit();
  }
}

runAccountVerificationSuite().catch((err) => {
  console.error("\nAccount Verification E2E test suite failed:", err);
  process.exit(1);
});
