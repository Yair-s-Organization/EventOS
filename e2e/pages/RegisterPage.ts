import { By, WebDriver, until } from "selenium-webdriver";

export interface RegisterFormInput {
  correo: string;
  nombre: string;
  apellidoPa: string;
  apellidoMaterno?: string;
  contrasena: string;
  confirmarContrasena: string;
}

export class RegisterPage {
  private readonly url = process.env.E2E_BASE_URL
    ? `${process.env.E2E_BASE_URL}/registro`
    : "http://localhost:5173/registro";

  // Locators from apps/frontend/src/features/auth/Registro.tsx
  private readonly emailInput = By.id("correo");
  private readonly firstNameInput = By.id("nombre");
  private readonly lastNamePaternalInput = By.id("apellidoPa");
  private readonly lastNameMaternalInput = By.id("apellidoMaterno");
  private readonly passwordInput = By.id("contrasena");
  private readonly confirmPasswordInput = By.id("confirmarContrasena");
  private readonly submitButton = By.css("button[type='submit']");

  // Target ONLY open <dialog open> elements from Modal.tsx
  private readonly incompleteModalHeading = By.xpath(
    "//dialog[@open]//*[contains(normalize-space(), 'Campos obligatorios incompletos')]",
  );
  private readonly incompleteModalCloseBtn = By.xpath(
    "//dialog[@open]//button[normalize-space()='Cerrar']",
  );
  private readonly successModalHeading = By.xpath(
    "//dialog[@open]//*[contains(normalize-space(), '¡Registro exitoso!') or contains(normalize-space(), '¡Verifica tu correo')]",
  );
  private readonly successModalAcceptBtn = By.xpath(
    "//dialog[@open]//button[normalize-space()='Aceptar' or contains(normalize-space(), 'Entendido')]",
  );

  constructor(private readonly driver: WebDriver) {}

  async open(): Promise<void> {
    await this.driver.get(this.url);
    await this.driver.wait(until.elementLocated(this.emailInput), 5000);
  }

  async fillForm(data: RegisterFormInput): Promise<void> {
    const fields: Array<[By, string | undefined]> = [
      [this.emailInput, data.correo],
      [this.firstNameInput, data.nombre],
      [this.lastNamePaternalInput, data.apellidoPa],
      [this.lastNameMaternalInput, data.apellidoMaterno],
      [this.passwordInput, data.contrasena],
      [this.confirmPasswordInput, data.confirmarContrasena],
    ];

    for (const [locator, value] of fields) {
      const element = await this.driver.findElement(locator);
      await element.clear();
      if (value) {
        await element.sendKeys(value);
      }
    }
  }

  async submit(): Promise<void> {
    const button = await this.driver.findElement(this.submitButton);
    await button.click();
  }

  async isIncompleteModalVisible(timeoutMs = 5000): Promise<boolean> {
    try {
      const el = await this.driver.wait(
        until.elementLocated(this.incompleteModalHeading),
        timeoutMs,
      );
      await this.driver.wait(until.elementIsVisible(el), timeoutMs);
      return true;
    } catch {
      return false;
    }
  }

  async closeIncompleteModal(): Promise<void> {
    const btn = await this.driver.wait(
      until.elementLocated(this.incompleteModalCloseBtn),
      5000,
    );
    await this.driver.wait(until.elementIsVisible(btn), 5000);
    await btn.click();
  }

  async waitForSuccessModal(timeoutMs = 8000): Promise<boolean> {
    try {
      const el = await this.driver.wait(
        until.elementLocated(this.successModalHeading),
        timeoutMs,
      );
      await this.driver.wait(until.elementIsVisible(el), timeoutMs);
      return true;
    } catch {
      return false;
    }
  }

  async acceptSuccessModal(): Promise<void> {
    const btn = await this.driver.wait(
      until.elementLocated(this.successModalAcceptBtn),
      5000,
    );
    await this.driver.wait(until.elementIsVisible(btn), 5000);
    await btn.click();
  }

  async isTextVisible(text: string, timeoutMs = 8000): Promise<boolean> {
    const locator = By.xpath(
      `//*[contains(normalize-space(), ${JSON.stringify(text)})]`,
    );
    try {
      const el = await this.driver.wait(
        until.elementLocated(locator),
        timeoutMs,
      );
      return await el.isDisplayed();
    } catch {
      return false;
    }
  }

  async confirmPendingRegistration(apiBaseUrl = "http://localhost:3000/api"): Promise<boolean> {
    const token = await this.driver.executeScript<string | null>(() => {
      return (window as any).__lastRegistrationToken || null;
    });

    if (!token) {
      return false;
    }

    try {
      const res = await fetch(`${apiBaseUrl}/auth/confirmar-registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
