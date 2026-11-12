import { By, WebDriver, until } from "selenium-webdriver";

export class PasswordResetPage {
  private readonly baseUrl = process.env.E2E_BASE_URL || "http://localhost:5173";

  // Locators for /recuperar-contrasena
  private readonly requestEmailInput = By.id("correo");
  private readonly requestSubmitBtn = By.css("button[type='submit']");
  private readonly requestBackToLogin = By.css("a[href='/login']");
  private readonly requestSuccessModal = By.xpath(
    "//dialog[@open]//*[contains(normalize-space(), 'Correo enviado')]",
  );
  private readonly requestSuccessAcceptBtn = By.xpath(
    "//dialog[@open]//button[contains(normalize-space(), 'Aceptar')]",
  );

  // Locators for /restablecer-contrasena
  private readonly newPasswordInput = By.id("nuevaContrasena");
  private readonly confirmPasswordInput = By.id("confirmarContrasena");
  private readonly resetSubmitBtn = By.css("button[type='submit']");
  private readonly resetSuccessModal = By.xpath(
    "//dialog[@open]//*[contains(normalize-space(), '¡Contraseña restablecida!')]",
  );
  private readonly resetSuccessAcceptBtn = By.xpath(
    "//dialog[@open]//button[contains(normalize-space(), 'Ir a Iniciar Sesión')]",
  );
  private readonly invalidTokenHeading = By.xpath(
    "//*[contains(normalize-space(), 'Enlace inválido o expirado')]",
  );

  constructor(private readonly driver: WebDriver) {}

  async openRequestPage(): Promise<void> {
    await this.driver.get(`${this.baseUrl}/recuperar-contrasena`);
    await this.driver.wait(until.elementLocated(this.requestEmailInput), 5000);
  }

  async fillRequestEmail(email: string): Promise<void> {
    const input = await this.driver.findElement(this.requestEmailInput);
    await input.clear();
    if (email) {
      await input.sendKeys(email);
    }
  }

  async submitRequest(): Promise<void> {
    const btn = await this.driver.findElement(this.requestSubmitBtn);
    await btn.click();
  }

  async waitForRequestSuccessModal(timeoutMs = 7000): Promise<boolean> {
    try {
      await this.driver.wait(until.elementLocated(this.requestSuccessModal), timeoutMs);
      return true;
    } catch {
      return false;
    }
  }

  async acceptRequestSuccessModal(): Promise<void> {
    const btn = await this.driver.wait(
      until.elementLocated(this.requestSuccessAcceptBtn),
      5000,
    );
    await btn.click();
  }

  async openResetPage(token: string): Promise<void> {
    await this.driver.get(`${this.baseUrl}/restablecer-contrasena?token=${encodeURIComponent(token)}`);
  }

  async waitForResetForm(timeoutMs = 5000): Promise<boolean> {
    try {
      await this.driver.wait(until.elementLocated(this.newPasswordInput), timeoutMs);
      return true;
    } catch {
      return false;
    }
  }

  async fillResetPassword(newPassword: string, confirmPassword: string): Promise<void> {
    const newPassEl = await this.driver.findElement(this.newPasswordInput);
    await newPassEl.clear();
    if (newPassword) {
      await newPassEl.sendKeys(newPassword);
    }

    const confirmPassEl = await this.driver.findElement(this.confirmPasswordInput);
    await confirmPassEl.clear();
    if (confirmPassword) {
      await confirmPassEl.sendKeys(confirmPassword);
    }
  }

  async submitReset(): Promise<void> {
    const btn = await this.driver.findElement(this.resetSubmitBtn);
    await btn.click();
  }

  async waitForResetSuccessModal(timeoutMs = 7000): Promise<boolean> {
    try {
      await this.driver.wait(until.elementLocated(this.resetSuccessModal), timeoutMs);
      return true;
    } catch {
      return false;
    }
  }

  async acceptResetSuccessModal(): Promise<void> {
    const btn = await this.driver.wait(
      until.elementLocated(this.resetSuccessAcceptBtn),
      5000,
    );
    await btn.click();
  }

  async isInvalidTokenVisible(timeoutMs = 5000): Promise<boolean> {
    try {
      await this.driver.wait(until.elementLocated(this.invalidTokenHeading), timeoutMs);
      return true;
    } catch {
      return false;
    }
  }

  async isTextVisible(text: string, timeoutMs = 5000): Promise<boolean> {
    const locator = By.xpath(
      `//*[contains(normalize-space(), ${JSON.stringify(text)})]`,
    );
    try {
      const el = await this.driver.wait(
        until.elementLocated(locator),
        timeoutMs,
      );
      await this.driver.wait(until.elementIsVisible(el), timeoutMs);
      return true;
    } catch {
      return false;
    }
  }
}
