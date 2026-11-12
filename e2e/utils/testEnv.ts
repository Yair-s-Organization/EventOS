import fs from "node:fs";
import path from "node:path";
import { Builder, WebDriver } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";

/**
 * Carga variables de entorno desde apps/backend/.env y .env en la raíz
 * sin sobrescribir variables definidas explícitamente en la terminal.
 */
export function loadTestEnv(): void {
  const rootDir = path.resolve(import.meta.dir, "../..");
  const candidateFiles = [
    path.join(rootDir, ".env"),
    path.join(rootDir, "apps/backend/.env"),
    path.join(rootDir, "apps/frontend/.env"),
  ];

  for (const envPath of candidateFiles) {
    if (!fs.existsSync(envPath)) continue;
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) {
        process.env[key] = val;
      }
    }
  }
}

loadTestEnv();

export const API_BASE_URL =
  process.env.API_BASE_URL || "http://localhost:3000/api";
export const API_URL = API_BASE_URL;
export const FRONTEND_URL =
  process.env.E2E_BASE_URL ||
  process.env.FRONTEND_URL ||
  "http://localhost:5173";
export const BASE_URL = FRONTEND_URL;

/**
 * Conecta a PostgreSQL probando primero la configuración de entorno (.env)
 * y haciendo fallback automático entre instalación local (5432) y Docker Compose (5433).
 */
export async function connectTestDb() {
  const pg = await import("../../apps/backend/node_modules/pg");
  const candidates = [
    {
      host: process.env.DB_HOST ?? "localhost",
      port: Number(process.env.DB_PORT ?? 5432),
      user: process.env.DB_USER ?? "postgres",
      password: process.env.DB_PASSWORD ?? "admin",
      database: process.env.DB_NAME ?? "eventos",
    },
    {
      host: "localhost",
      port: 5433,
      user: "postgres",
      password: "postgres",
      database: "eventos",
    },
    {
      host: "localhost",
      port: 5432,
      user: "postgres",
      password: "postgres",
      database: "eventos",
    },
    {
      host: "localhost",
      port: 5432,
      user: "postgres",
      password: "admin",
      database: "eventos",
    },
  ];

  let lastError: unknown;
  for (const config of candidates) {
    const client = new pg.default.Client(config);
    try {
      await client.connect();
      await client.query(
        `ALTER TABLE evento ADD COLUMN IF NOT EXISTS "motivoRechazo" text;`,
      );
      return client;
    } catch (err) {
      lastError = err;
      try {
        await client.end();
      } catch {
        // Ignorar cierre fallido
      }
    }
  }

  throw new Error(
    `No se pudo conectar a PostgreSQL para las pruebas E2E: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`,
  );
}

/**
 * Crea una instancia estandarizada de Chrome WebDriver.
 */
export async function createChromeDriver(): Promise<WebDriver> {
  const options = new chrome.Options();
  options.addArguments("--window-size=1366,900");
  if (process.env.HEADLESS === "true") {
    options.addArguments(
      "--headless=new",
      "--no-sandbox",
      "--disable-dev-shm-usage",
    );
  }

  return await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();
}
