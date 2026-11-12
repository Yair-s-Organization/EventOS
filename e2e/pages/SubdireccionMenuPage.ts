import { By, WebDriver, until } from "selenium-webdriver";

export class SubdireccionMenuPage {
  private readonly expectedPath = "/subdireccion/menu-principal";
  private readonly mainHeading = By.xpath(
    "//h1[normalize-space()='Menú principal']",
  );
  private readonly metricsContainer = By.id("contenedorMetricas");
  private readonly agendaContainer = By.id("contenedorAgendaRecintos");
  private readonly requestEventNavLink = By.xpath(
    "//nav//a[@href='/solicitud-evento' and normalize-space()='Solicitar evento']",
  );

  constructor(private readonly driver: WebDriver) {}

  async waitUntilLoaded(): Promise<void> {
    await this.driver.wait(until.urlContains(this.expectedPath), 10000);
    await this.driver.wait(until.elementLocated(this.mainHeading), 5000);
  }

  async getHeadingText(): Promise<string> {
    const heading = await this.driver.findElement(this.mainHeading);
    return heading.getText();
  }

  async isDashboardContentVisible(): Promise<boolean> {
    const metrics = await this.driver.findElement(this.metricsContainer);
    const agenda = await this.driver.findElement(this.agendaContainer);
    return (await metrics.isDisplayed()) && (await agenda.isDisplayed());
  }

  async navigateToEventRequestViaNavbar(): Promise<void> {
    const navLink = await this.driver.wait(
      until.elementLocated(this.requestEventNavLink),
      5000,
    );
    await this.driver.wait(until.elementIsVisible(navLink), 5000);
    await navLink.click();
    await this.driver.wait(until.urlContains("/solicitud-evento"), 5000);
  }

  async getStoredUserRole(): Promise<string | null> {
    return this.driver.executeScript<string | null>(() => {
      const rawUser = window.localStorage.getItem("usuario");
      if (!rawUser) return null;
      return JSON.parse(rawUser).tipoCuenta ?? null;
    });
  }

  async hasAccessToken(): Promise<boolean> {
    return this.driver.executeScript<boolean>(() => {
      const token = window.localStorage.getItem("token");
      return Boolean(token && token.length > 0);
    });
  }
}
