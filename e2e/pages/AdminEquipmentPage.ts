import { By, WebDriver, until } from "selenium-webdriver";

export class AdminEquipmentPage {
  private readonly mainHeading = By.xpath(
    "//h1[normalize-space()='Mapa visual de inventario']",
  );
  private readonly backButton = By.xpath(
    "//button[contains(normalize-space(),'Volver a Gestion de Espacios') or normalize-space()='Regresar']",
  );
  private readonly warningModalHeading = By.xpath(
    "//dialog[@open]//h2[normalize-space()='Advertencia']",
  );
  private readonly modalCancelBtn = By.xpath(
    "//dialog[@open]//button[normalize-space()='Cancelar']",
  );
  private readonly modalAcceptBtn = By.xpath(
    "//dialog[@open]//button[normalize-space()='Aceptar']",
  );

  constructor(private readonly driver: WebDriver) {}

  async waitUntilLoaded(expectedLabId?: number): Promise<void> {
    const urlPart = expectedLabId
      ? `/gestion-equipos/${expectedLabId}`
      : "/gestion-equipos/";
    await this.driver.wait(until.urlContains(urlPart), 10000);
    await this.driver.wait(until.elementLocated(this.mainHeading), 5000);
    await this.driver.wait(
      until.elementLocated(By.xpath("//span[normalize-space()='Equipo 1']")),
      8000,
    );
  }

  private switchForEquipment(equipmentNumber: number): By {
    return By.xpath(
      `//span[normalize-space()='Equipo ${equipmentNumber}']/parent::div//button[@role='switch']`,
    );
  }

  async isEquipmentDisabled(equipmentNumber: number): Promise<boolean> {
    const switchBtn = await this.driver.wait(
      until.elementLocated(this.switchForEquipment(equipmentNumber)),
      5000,
    );
    const ariaChecked = await switchBtn.getAttribute("aria-checked");
    return ariaChecked === "true";
  }

  async clickEquipmentSwitch(equipmentNumber: number): Promise<void> {
    const switchBtn = await this.driver.wait(
      until.elementLocated(this.switchForEquipment(equipmentNumber)),
      5000,
    );
    await switchBtn.click();
  }

  async isWarningModalOpen(timeoutMs = 5000): Promise<boolean> {
    try {
      const heading = await this.driver.wait(
        until.elementLocated(this.warningModalHeading),
        timeoutMs,
      );
      await this.driver.wait(until.elementIsVisible(heading), timeoutMs);
      return true;
    } catch {
      return false;
    }
  }

  async getWarningModalText(): Promise<string> {
    const p = await this.driver.wait(
      until.elementLocated(By.xpath("//dialog[@open]//p[normalize-space()!='']")),
      5000,
    );
    return (await p.getText()).trim();
  }

  async cancelWarningModal(): Promise<void> {
    const btn = await this.driver.wait(
      until.elementLocated(this.modalCancelBtn),
      5000,
    );
    await this.driver.wait(until.elementIsVisible(btn), 5000);
    await btn.click();
  }

  async acceptWarningModalAndWaitForState(
    equipmentNumber: number,
    expectedDisabled: boolean,
  ): Promise<void> {
    const btn = await this.driver.wait(
      until.elementLocated(this.modalAcceptBtn),
      5000,
    );
    await this.driver.wait(until.elementIsVisible(btn), 5000);
    await btn.click();

    await this.driver.wait(async () => {
      try {
        return (await this.isEquipmentDisabled(equipmentNumber)) === expectedDisabled;
      } catch {
        return false;
      }
    }, 6000);
  }

  async getStats(): Promise<{
    total: number;
    disponibles: number;
    fueraDeServicio: number;
  }> {
    const parseStat = async (label: string): Promise<number> => {
      const el = await this.driver.findElement(
        By.xpath(`//p[contains(normalize-space(), ${JSON.stringify(label)})]`),
      );
      const text = await el.getText();
      const match = text.match(/(\d+)/);
      return match ? Number(match[1]) : NaN;
    };

    return {
      total: await parseStat("Total de equipos:"),
      disponibles: await parseStat("Equipos disponibles:"),
      fueraDeServicio: await parseStat("Equipos fuera de servicio:"),
    };
  }

  async clickBackToSpaces(): Promise<void> {
    const btn = await this.driver.findElement(this.backButton);
    await btn.click();
  }
}
