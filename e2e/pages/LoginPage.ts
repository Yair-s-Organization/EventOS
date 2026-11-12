import { By, WebDriver, until } from "selenium-webdriver";

export class LoginPage {
  private readonly url = process.env.E2E_BASE_URL
    ? `${process.env.E2E_BASE_URL}/login?disable_captcha=true`
    : "http://localhost:5173/login?disable_captcha=true";

  // Locators from apps/frontend/src/features/auth/LoginForm.tsx
  private readonly emailInput = By.id("correo");
  private readonly passwordInput = By.id("contrasena");
  private readonly submitButton = By.css("button[type='submit']");
  private readonly registerLink = By.css("a[href='/registro']");
  private readonly lockoutModalHeading = By.xpath(
    "//dialog[@open]//*[contains(normalize-space(), 'Acceso bloqueado temporalmente')]",
  );

  constructor(private readonly driver: WebDriver) {}

  async open(): Promise<void> {
    await this.driver.get(this.url);
    await this.driver.wait(until.elementLocated(this.emailInput), 5000);
  }

  async enterCredentials(email: string, password: string): Promise<void> {
    const emailElement = await this.driver.findElement(this.emailInput);
    await emailElement.clear();
    if (email) {
      await emailElement.sendKeys(email);
    }

    const passwordElement = await this.driver.findElement(this.passwordInput);
    await passwordElement.clear();
    if (password) {
      await passwordElement.sendKeys(password);
    }
  }

  async submit(): Promise<void> {
    const button = await this.driver.findElement(this.submitButton);
    await button.click();
  }

  /**
   * Logs in directly (in dev mode SKIP_CAPTCHA is active so no image challenge blocks automation).
   */
  async login(email: string, password: string): Promise<void> {
    await this.open();
    await this.enterCredentials(email, password);
    await this.submit();
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
      return await el.isDisplayed();
    } catch {
      return false;
    }
  }

  async isLockoutModalVisible(timeoutMs = 5000): Promise<boolean> {
    try {
      const el = await this.driver.wait(
        until.elementLocated(this.lockoutModalHeading),
        timeoutMs,
      );
      return await el.isDisplayed();
    } catch {
      return false;
    }
  }

  async goToRegister(): Promise<void> {
    await this.driver.findElement(this.registerLink).click();
  }
}
