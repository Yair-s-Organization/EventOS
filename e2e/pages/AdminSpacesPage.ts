import { By, WebDriver, WebElement, until } from "selenium-webdriver";

export class AdminSpacesPage {
  private readonly url = process.env.E2E_BASE_URL
    ? `${process.env.E2E_BASE_URL}/gestion-espacios`
    : "http://localhost:5173/gestion-espacios";

  private readonly mainHeading = By.xpath(
    "//h1[normalize-space()='Gestión de espacios físicos']",
  );

  private readonly disableModalHeading = By.xpath(
    "//dialog[@open]//h2[normalize-space()='Inhabilitar espacio físico']",
  );
  private readonly enableModalHeading = By.xpath(
    "//dialog[@open]//h2[normalize-space()='Habilitar espacio físico']",
  );
  private readonly modalCancelBtn = By.xpath(
    "//dialog[@open]//button[normalize-space()='Cancelar']",
  );
  private readonly modalDisableConfirmBtn = By.xpath(
    "//dialog[@open]//button[normalize-space()='Inhabilitar']",
  );
  private readonly modalEnableConfirmBtn = By.xpath(
    "//dialog[@open]//button[normalize-space()='Habilitar']",
  );

  constructor(private readonly driver: WebDriver) {}

  private cardBySpaceName(spaceName: string): By {
    return By.xpath(
      `//h3[normalize-space()=${JSON.stringify(spaceName)}]/ancestor::div[contains(@class,'justify-between')][1]`,
    );
  }

  async open(): Promise<void> {
    await this.driver.get(this.url);
    await this.waitUntilLoaded();
  }

  async waitUntilLoaded(): Promise<void> {
    await this.driver.wait(until.urlContains("/gestion-espacios"), 10000);
    await this.driver.wait(until.elementLocated(this.mainHeading), 5000);
    await this.driver.wait(
      until.elementLocated(By.xpath("//h3[normalize-space()='Auditorio Principal']")),
      8000,
    );
  }

  async getSpaceCard(spaceName: string): Promise<WebElement> {
    const locator = this.cardBySpaceName(spaceName);
    const card = await this.driver.wait(until.elementLocated(locator), 5000);
    await this.driver.wait(until.elementIsVisible(card), 5000);
    return card;
  }

  async getSpaceStatusText(spaceName: string): Promise<string> {
    const card = await this.getSpaceCard(spaceName);
    const statusSpan = await card.findElement(
      By.xpath(".//span[normalize-space()='Habilitado' or normalize-space()='Inhabilitado']"),
    );
    return (await statusSpan.getText()).trim();
  }

  async getSpaceCapacity(spaceName: string): Promise<number> {
    const card = await this.getSpaceCard(spaceName);
    const capacityParagraph = await card.findElement(
      By.xpath(".//p[contains(normalize-space(),'Aforo máximo:')]"),
    );
    const text = await capacityParagraph.getText();
    const match = text.match(/(\d+)/);
    return match ? Number(match[1]) : NaN;
  }

  async hasManageEquipmentButton(spaceName: string): Promise<boolean> {
    const card = await this.getSpaceCard(spaceName);
    const btns = await card.findElements(
      By.xpath(".//button[normalize-space()='Gestionar equipos']"),
    );
    return btns.length > 0;
  }

  async clickToggleStateButton(spaceName: string): Promise<void> {
    const card = await this.getSpaceCard(spaceName);
    const toggleBtn = await card.findElement(
      By.xpath(".//button[normalize-space()='Inhabilitar' or normalize-space()='Habilitar']"),
    );
    await toggleBtn.click();
  }

  async isDisableModalOpen(timeoutMs = 5000): Promise<boolean> {
    try {
      const heading = await this.driver.wait(
        until.elementLocated(this.disableModalHeading),
        timeoutMs,
      );
      await this.driver.wait(until.elementIsVisible(heading), timeoutMs);
      return true;
    } catch {
      return false;
    }
  }

  async isEnableModalOpen(timeoutMs = 5000): Promise<boolean> {
    try {
      const heading = await this.driver.wait(
        until.elementLocated(this.enableModalHeading),
        timeoutMs,
      );
      await this.driver.wait(until.elementIsVisible(heading), timeoutMs);
      return true;
    } catch {
      return false;
    }
  }

  async cancelModal(): Promise<void> {
    const btn = await this.driver.wait(
      until.elementLocated(this.modalCancelBtn),
      5000,
    );
    await this.driver.wait(until.elementIsVisible(btn), 5000);
    await btn.click();
  }

  async confirmDisableSpace(spaceName: string): Promise<void> {
    const btn = await this.driver.wait(
      until.elementLocated(this.modalDisableConfirmBtn),
      5000,
    );
    await this.driver.wait(until.elementIsVisible(btn), 5000);
    await btn.click();

    await this.driver.wait(async () => {
      try {
        return (await this.getSpaceStatusText(spaceName)) === "Inhabilitado";
      } catch {
        return false;
      }
    }, 6000);
  }

  async confirmEnableSpace(spaceName: string): Promise<void> {
    const btn = await this.driver.wait(
      until.elementLocated(this.modalEnableConfirmBtn),
      5000,
    );
    await this.driver.wait(until.elementIsVisible(btn), 5000);
    await btn.click();

    await this.driver.wait(async () => {
      try {
        return (await this.getSpaceStatusText(spaceName)) === "Habilitado";
      } catch {
        return false;
      }
    }, 6000);
  }

  async clickManageEquipment(spaceName: string): Promise<void> {
    const card = await this.getSpaceCard(spaceName);
    const btn = await card.findElement(
      By.xpath(".//button[normalize-space()='Gestionar equipos']"),
    );
    await btn.click();
  }
}
