import assert from "node:assert/strict";
import { Builder, By, WebDriver } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";
import { RegisterPage } from "../pages/RegisterPage";

interface TestResult {
  id: string;
  name: string;
  passed: boolean;
  reason?: string;
}

async function runRegisterAcceptanceSuite(): Promise<void> {
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
  const results: TestResult[] = [];

  async function recordTest(
    id: string,
    name: string,
    fn: () => Promise<void>,
  ): Promise<void> {
    process.stdout.write(`Running ${id}: ${name}... `);
    try {
      await fn();
      results.push({ id, name, passed: true });
      console.log("PASS");
    } catch (error: any) {
      const reason = error?.message || String(error);
      results.push({ id, name, passed: false, reason });
      console.log(`FAIL -> ${reason}`);
    }
  }

  try {
    // =========================================================================
    // CA-REG-01: Todos los campos obligatorios no nulos (incluyendo Apellido Materno según CU11)
    // =========================================================================
    await recordTest(
      "CA-REG-01",
      "Rechazar campos nulos/vacíos o solo con espacios (incluyendo Apellido Materno)",
      async () => {
        await registerPage.open();
        await registerPage.fillForm({
          correo: `ca01.${Date.now()}@alumno.ipn.mx`,
          nombre: "Eduardo",
          apellidoPa: "Mendoza",
          apellidoMaterno: "", // Vacío / nulo
          contrasena: "Password123!",
          confirmarContrasena: "Password123!",
        });
        await registerPage.submit();

        const registeredAnyway = await registerPage.waitForSuccessModal(2500);
        assert.equal(
          registeredAnyway,
          false,
          "El sistema permitió registrar al usuario con Apellido Materno nulo/vacío (violando CU11)",
        );
      },
    );

    // =========================================================================
    // CA-REG-02: Nombre de no más de 50 caracteres
    // =========================================================================
    await recordTest(
      "CA-REG-02",
      "Rechazar Nombre con más de 50 caracteres (55 caracteres)",
      async () => {
        await registerPage.open();
        const longName = "A".repeat(55);
        await registerPage.fillForm({
          correo: `ca02.${Date.now()}@alumno.ipn.mx`,
          nombre: longName,
          apellidoPa: "García",
          apellidoMaterno: "López",
          contrasena: "Password123!",
          confirmarContrasena: "Password123!",
        });

        const typedValue = await driver
          .findElement(By.id("nombre"))
          .getAttribute("value");

        assert.equal(
          typedValue.length <= 50,
          true,
          `El input de nombre permitió ${typedValue.length} caracteres (> 50) sin restricción en cliente`,
        );
      },
    );

    // =========================================================================
    // CA-REG-03: Apellido Paterno y Materno de no más de 50 caracteres (sin error 500 de BD)
    // =========================================================================
    await recordTest(
      "CA-REG-03",
      "Validar que Apellido Paterno y Materno no excedan 50 caracteres en el formulario",
      async () => {
        await registerPage.open();
        const longLastName = "B".repeat(55);
        await registerPage.fillForm({
          correo: `ca03.${Date.now()}@alumno.ipn.mx`,
          nombre: "Laura",
          apellidoPa: longLastName,
          apellidoMaterno: longLastName,
          contrasena: "Password123!",
          confirmarContrasena: "Password123!",
        });

        const typedPaternal = await driver
          .findElement(By.id("apellidoPa"))
          .getAttribute("value");
        const typedMaternal = await driver
          .findElement(By.id("apellidoMaterno"))
          .getAttribute("value");

        assert.equal(
          typedPaternal.length <= 50 && typedMaternal.length <= 50,
          true,
          `Los inputs de apellidos permitieron ${typedPaternal.length} y ${typedMaternal.length} caracteres (> 50) sin validación en cliente`,
        );
      },
    );

    // =========================================================================
    // CA-REG-04: Nombre solo con caracteres alfabéticos (rechazo inmediato en cliente)
    // =========================================================================
    await recordTest(
      "CA-REG-04",
      "Validación en formulario de solo letras en Nombre (rechazar números y símbolos)",
      async () => {
        await registerPage.open();
        await registerPage.fillForm({
          correo: `ca04.${Date.now()}@alumno.ipn.mx`,
          nombre: "Juan123$%",
          apellidoPa: "Pérez",
          apellidoMaterno: "Soto",
          contrasena: "Password123!",
          confirmarContrasena: "Password123!",
        });

        // Verificar si el input #nombre marca aria-invalid="true" antes de enviar al servidor
        const isNombreInvalidInClient = await driver
          .findElement(By.id("nombre"))
          .getAttribute("aria-invalid");

        assert.equal(
          isNombreInvalidInClient,
          "true",
          "El campo #nombre en el frontend dejó pasar números y símbolos ('Juan123$%') con aria-invalid='false'",
        );
      },
    );

    // =========================================================================
    // CA-REG-05: Apellidos solo con caracteres alfabéticos en el formulario
    // =========================================================================
    await recordTest(
      "CA-REG-05",
      "Validación en formulario de solo letras en Apellido Paterno y Materno",
      async () => {
        await registerPage.open();
        await registerPage.fillForm({
          correo: `ca05.${Date.now()}@alumno.ipn.mx`,
          nombre: "Fernando",
          apellidoPa: "Hernandez99",
          apellidoMaterno: "Diaz#!",
          contrasena: "Password123!",
          confirmarContrasena: "Password123!",
        });

        const isApellidoPaInvalid = await driver
          .findElement(By.id("apellidoPa"))
          .getAttribute("aria-invalid");
        const isApellidoMaInvalid = await driver
          .findElement(By.id("apellidoMaterno"))
          .getAttribute("aria-invalid");

        assert.equal(
          isApellidoPaInvalid === "true" && isApellidoMaInvalid === "true",
          true,
          `El frontend no validó números/símbolos en apellidos (apellidoPa aria-invalid=${isApellidoPaInvalid}, apellidoMaterno aria-invalid=${isApellidoMaInvalid})`,
        );
      },
    );

    // =========================================================================
    // CA-REG-06: Correo electrónico con longitud máxima <= 100/254 y formato de dominio válido
    // =========================================================================
    await recordTest(
      "CA-REG-06",
      "Rechazar correo electrónico con formato inválido o caracteres no permitidos",
      async () => {
        await registerPage.open();
        await registerPage.fillForm({
          correo: "usuario..invalido@@ipn..mx",
          nombre: "Sofía",
          apellidoPa: "Vargas",
          apellidoMaterno: "Ruiz",
          contrasena: "Password123!",
          confirmarContrasena: "Password123!",
        });
        await registerPage.submit();

        const registeredAnyway = await registerPage.waitForSuccessModal(2500);
        assert.equal(
          registeredAnyway,
          false,
          "El sistema permitió registrar un correo con doble '@' ('usuario..invalido@@ipn..mx') porque el regex /\\S+@\\S+\\.\\S+/ es demasiado permisivo",
        );
      },
    );

    // =========================================================================
    // CA-REG-07: Contraseña entre 8 y 64 caracteres con complejidad y confirmación idéntica
    // =========================================================================
    await recordTest(
      "CA-REG-07",
      "Rechazar contraseña mayor a 64 caracteres (65 caracteres)",
      async () => {
        await registerPage.open();
        const password65 = "Aa1!" + "x".repeat(61); // 65 chars
        await registerPage.fillForm({
          correo: `ca07.${Date.now()}@alumno.ipn.mx`,
          nombre: "Diego",
          apellidoPa: "Morales",
          apellidoMaterno: "Castro",
          contrasena: password65,
          confirmarContrasena: password65,
        });

        const hasLengthError = await registerPage.isTextVisible(
          "La contraseña debe tener entre 8 y 64 caracteres",
          2500,
        );
        assert.equal(
          hasLengthError,
          true,
          "Debería rechazar contraseñas de más de 64 caracteres",
        );
      },
    );

    // =========================================================================
    // RESUMEN DE AUDITORÍA QA
    // =========================================================================
    const failed = results.filter((r) => !r.passed);
    console.log("\n=======================================================");
    console.log(
      `RESUMEN SUITE DE ACEPTACIÓN REGISTRO: ${results.length - failed.length}/${results.length} PASARON, ${failed.length} FALLARON`,
    );
    console.log("=======================================================");
    for (const f of failed) {
      console.log(`❌ ${f.id} (${f.name}):\n   Causa: ${f.reason}`);
    }

    if (failed.length > 0) {
      process.exitCode = 1;
    }
  } finally {
    await driver.quit();
  }
}

runRegisterAcceptanceSuite();
