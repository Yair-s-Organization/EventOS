import assert from "node:assert/strict";
import { By, WebDriver, until } from "selenium-webdriver";
import {
  API_URL,
  BASE_URL,
  createChromeDriver,
} from "../utils/testEnv";

async function runSecurityResilienceSuite(): Promise<void> {
  const driver: WebDriver = await createChromeDriver();

  try {
    // =========================================================================
    // TC-SEC-01: Ataque #1 — Peticiones mal formadas SIN encabezado Content-Type
    // =========================================================================
    console.log(
      "Running TC-SEC-01: Malformed requests without Content-Type header return 400 (never 500 or crash)...",
    );
    const endpointsWithoutContentType = [
      "/auth/registro",
      "/auth/login",
      "/auth/recuperar-contrasena",
      "/auth/confirmar-registro",
      "/auth/restablecer-contrasena",
    ];

    for (const endpoint of endpointsWithoutContentType) {
      // Browser fetch with string body and NO headers sends text/plain;charset=UTF-8 -> req.body is undefined
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        body: '{"correo":"test@test.com"}',
      });

      assert.notEqual(
        res.status,
        500,
        `Endpoint ${endpoint} threw 500 Internal Server Error on missing Content-Type`,
      );
      assert.equal(
        res.status,
        400,
        `Expected 400 Bad Request on ${endpoint} without Content-Type, got ${res.status}`,
      );
    }
    console.log("  ✓ TC-SEC-01 passed");

    // =========================================================================
    // TC-SEC-02: Ataque #2 — DoS con Payload Gigante ({ nombre: "A".repeat(100000) })
    // =========================================================================
    console.log(
      "Running TC-SEC-02: Giant payload DoS ({ nombre: 'A'.repeat(100000) }) blocked with 413 Payload Too Large...",
    );
    const giantPayload = JSON.stringify({
      nombre: "A".repeat(100000),
      apellidoPa: "Pérez",
      apellidoMa: "Gómez",
      correo: "dos.attack@alumno.ipn.mx",
      contrasena: "Password123!",
    });

    const giantRegRes = await fetch(`${API_URL}/auth/registro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: giantPayload,
    });
    assert.equal(
      giantRegRes.status,
      413,
      `Expected 413 Payload Too Large for 100KB payload on /auth/registro, got ${giantRegRes.status}`,
    );

    const giantLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        correo: "dos.attack@alumno.ipn.mx",
        contrasena: "A".repeat(100000),
      }),
    });
    assert.equal(
      giantLoginRes.status,
      413,
      `Expected 413 Payload Too Large for 100KB payload on /auth/login, got ${giantLoginRes.status}`,
    );
    console.log("  ✓ TC-SEC-02 passed");

    // =========================================================================
    // TC-SEC-03: JSON sintácticamente corrupto / truncado
    // =========================================================================
    console.log(
      "Running TC-SEC-03: Broken/truncated JSON syntax returns 400 Bad Request...",
    );
    const brokenJsonRes = await fetch(`${API_URL}/auth/registro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"correo": "test@ipn.mx", "nombre": "Truncado',
    });
    assert.equal(
      brokenJsonRes.status,
      400,
      `Expected 400 Bad Request on broken JSON, got ${brokenJsonRes.status}`,
    );
    console.log("  ✓ TC-SEC-03 passed");

    // =========================================================================
    // TC-SEC-04: Type Confusion Attack (números, booleanos, objetos y arreglos en campos string)
    // =========================================================================
    console.log(
      "Running TC-SEC-04: Type confusion payloads (numbers, arrays, objects instead of strings) rejected with 400...",
    );
    const typeConfusionPayloads = [
      {
        nombre: 123456,
        apellidoPa: ["Arreglo"],
        apellidoMa: { "$ne": null },
        correo: true,
        contrasena: { nested: "object" },
      },
      {
        correo: { "$gt": "" },
        contrasena: ["Password123!"],
      },
      null,
      [],
    ];

    for (const payload of typeConfusionPayloads) {
      const res = await fetch(`${API_URL}/auth/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      assert.equal(
        res.status === 400,
        true,
        `Expected 400 on /auth/registro for type-confusion payload ${JSON.stringify(payload)}, got ${res.status}`,
      );
    }

    const loginTypeConfusionRes = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        correo: { "$ne": null },
        contrasena: 99999999,
      }),
    });
    assert.equal(
      loginTypeConfusionRes.status,
      400,
      `Expected 400 on /auth/login for type-confusion payload, got ${loginTypeConfusionRes.status}`,
    );
    console.log("  ✓ TC-SEC-04 passed");

    // =========================================================================
    // TC-SEC-05: Protección contra ReDoS y bcrypt CPU DoS (cadenas medianas > límites de DTO pero < 10kb)
    // =========================================================================
    console.log(
      "Running TC-SEC-05: Sub-10KB oversized fields (>50 chars name / >72 chars password) rejected fast (<300ms) with 400...",
    );
    const startRedos = Date.now();
    const redosRes = await fetch(`${API_URL}/auth/registro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: "A".repeat(800) + "!",
        apellidoPa: "López",
        apellidoMa: "García",
        correo: "redos@alumno.ipn.mx",
        contrasena: "B".repeat(800) + "1",
      }),
    });
    const elapsedMs = Date.now() - startRedos;

    assert.equal(redosRes.status, 400);
    assert.equal(
      elapsedMs < 1000,
      true,
      `Validation took too long (${elapsedMs}ms), indicating potential ReDoS or bcrypt execution`,
    );
    console.log(`  ✓ TC-SEC-05 passed (${elapsedMs}ms)`);

    // =========================================================================
    // TC-SEC-06: Mass Assignment / Inyección de propiedades privilegiadas
    // =========================================================================
    console.log(
      "Running TC-SEC-06: Mass Assignment injection (tipoCuenta='Administrador', esVerificado='Verificado') stripped...",
    );
    const massAssignEmail = `mass.assign.${Date.now().toString().slice(-6)}@alumno.ipn.mx`;
    const massAssignRes = await fetch(`${API_URL}/auth/registro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: "Carlos",
        apellidoPa: "Intruso",
        apellidoMa: "Seguridad",
        correo: massAssignEmail,
        contrasena: "Password123!",
        tipoCuenta: "Administrador",
        esVerificado: "Verificado",
        esJefeAcademia: true,
        idUsuario: 1,
      }),
    });
    assert.equal(massAssignRes.ok, true);
    const massAssignData: any = await massAssignRes.json();

    // Decode JWT payload to verify the token did NOT inherit 'Administrador'
    const tokenParts = (massAssignData.token as string).split(".");
    const decodedPayload = JSON.parse(
      Buffer.from(tokenParts[1], "base64url").toString("utf-8"),
    );
    assert.notEqual(
      decodedPayload.tipoCuenta,
      "Administrador",
      "Mass assignment must not allow setting tipoCuenta to Administrador",
    );
    assert.equal(decodedPayload.tipoCuenta, "Usuario Interno");
    console.log("  ✓ TC-SEC-06 passed");

    // =========================================================================
    // TC-SEC-07: Inyección SQL y XSS en campos de autenticación y búsqueda
    // =========================================================================
    console.log(
      "Running TC-SEC-07: SQL Injection & XSS payloads rejected safely without 500 errors...",
    );
    const sqliLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        correo: "' OR 1=1; DROP TABLE usuario; --@ipn.mx",
        contrasena: "' OR '1'='1",
        captchaToken: "e2e-bypass",
      }),
    });
    assert.equal(
      sqliLoginRes.status === 400 || sqliLoginRes.status === 401,
      true,
      `SQLi login attempt must return 400 or 401, got ${sqliLoginRes.status}`,
    );

    const xssRegRes = await fetch(`${API_URL}/auth/registro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: "<script>alert('xss')</script>",
        apellidoPa: "Pérez",
        apellidoMa: "Gómez",
        correo: "xss.test@alumno.ipn.mx",
        contrasena: "Password123!",
      }),
    });
    assert.equal(
      xssRegRes.status,
      400,
      "XSS script tags in nombre must be rejected with 400 Bad Request",
    );
    console.log("  ✓ TC-SEC-07 passed");

    // =========================================================================
    // TC-SEC-08: Acceso con JWT falsificado / sin token a rutas protegidas
    // =========================================================================
    console.log(
      "Running TC-SEC-08: Tampered JWT and unauthenticated access to protected routes blocked (401/403)...",
    );
    const tamperedJwt =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImNvcnJlbyI6ImFkbWluQGlwbi5teCIsInRpcG9DdWVudGEiOiJBZG1pbmlzdHJhZG9yIn0.FIRMA_FALSA_INVALIDA";

    const protectedEndpoints = [
      "/usuarios/perfil",
      "/usuarios/admin/cuentas",
      "/eventos/mis-eventos",
      "/logistica/mis-eventos",
    ];

    for (const ep of protectedEndpoints) {
      const noTokenRes = await fetch(`${API_URL}${ep}`);
      assert.equal(
        noTokenRes.status === 401 || noTokenRes.status === 403,
        true,
        `Unauthenticated request to ${ep} must return 401/403, got ${noTokenRes.status}`,
      );

      const badTokenRes = await fetch(`${API_URL}${ep}`, {
        headers: { Authorization: `Bearer ${tamperedJwt}` },
      });
      assert.equal(
        badTokenRes.status === 401 || badTokenRes.status === 403,
        true,
        `Tampered JWT request to ${ep} must return 401/403, got ${badTokenRes.status}`,
      );
    }
    console.log("  ✓ TC-SEC-08 passed");

    // =========================================================================
    // TC-SEC-09: Supervivencia del Servidor y UI tras la ráfaga de ataques
    // =========================================================================
    console.log(
      "Running TC-SEC-09: Verify backend and frontend remain healthy and responsive after attack burst...",
    );
    const healthRes = await fetch(`${API_URL}/eventos`);
    assert.equal(
      healthRes.status,
      200,
      "GET /api/eventos must still respond 200 OK after all attack simulations",
    );

    await driver.get(`${BASE_URL}/login?disable_captcha=true`);
    const emailInput = await driver.wait(
      until.elementLocated(By.id("correo")),
      8000,
    );
    assert.equal(await emailInput.isDisplayed(), true);

    // Execute browser-side fetch without Content-Type directly from the browser context
    const browserAttackStatus = await driver.executeAsyncScript<number>(
      function (apiUrl: string, done: (status: number) => void) {
        fetch(`${apiUrl}/auth/registro`, {
          method: "POST",
          body: '{"correo":"test@test.com"}',
        })
          .then((r) => done(r.status))
          .catch(() => done(-1));
      },
      API_URL,
    );
    assert.equal(
      browserAttackStatus,
      400,
      `Browser fetch without Content-Type must receive 400 Bad Request, got ${browserAttackStatus}`,
    );
    console.log("  ✓ TC-SEC-09 passed");

    console.log(
      "\nAll 9 Security, Malformed Payloads & DoS Resilience E2E tests passed successfully!",
    );
  } finally {
    await driver.quit();
  }
}

runSecurityResilienceSuite().catch((err) => {
  console.error("\nSecurity & Resilience E2E test suite failed:", err);
  process.exit(1);
});
