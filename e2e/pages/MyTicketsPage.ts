import { By, WebDriver, WebElement, until } from "selenium-webdriver";

export class MyTicketsPage {
  private readonly baseUrl: string;

  // UI08 Locators
  private readonly pageHeading = By.xpath("//h1[normalize-space()='Mis Boletos']");
  private readonly searchInput = By.css("input[type='search'], input[placeholder*='Buscar evento']");
  private readonly statusSelect = By.xpath("//select[.//option[@value='active']]");
  private readonly clearFiltersBtn = By.xpath("//button[contains(normalize-space(), 'Limpiar filtros')]");
  private readonly successAlert = By.xpath("//*[@role='status' and contains(normalize-space(), 'Tu asistencia se canceló correctamente')]");
  private readonly errorAlert = By.xpath("//*[@role='alert']");
  private readonly emptyStateHeading = By.xpath("//h2[contains(normalize-space(), 'No cuentas con eventos registrados') or contains(normalize-space(), 'No se encontraron registros') or contains(normalize-space(), 'No encontramos boletos') or contains(normalize-space(), 'No tienes boletos')]");

  // ConfirmationDialog Locators
  private readonly confirmModalTitle = By.xpath("//dialog[@open]//*[contains(normalize-space(), 'Cancelar asistencia')]");
  private readonly confirmModalConfirmBtn = By.xpath("//dialog[@open]//button[normalize-space()='Confirmar cancelación']");
  private readonly confirmModalCancelBtn = By.xpath("//dialog[@open]//button[normalize-space()='Volver']");

  // Digital Ticket (/asistente/boletos/:id) Locators
  private readonly digitalTicketHeading = By.xpath("//h1[normalize-space()='Boleto Digital']");
  private readonly qrActiveImage = By.xpath("//img[@alt='Código QR de acceso al evento']");
  private readonly qrDisabledNotice = By.xpath("//p[contains(normalize-space(), 'El código QR de este boleto no está habilitado para el ingreso')]");
  private readonly downloadPdfBtn = By.xpath("//button[normalize-space()='Descargar PDF']");
  private readonly previewPdfBtn = By.xpath("//button[normalize-space()='Vista previa PDF']");
  private readonly digitalTicketBackBtn = By.xpath("//section//button[normalize-space()='Volver']");

  constructor(private readonly driver: WebDriver) {
    this.baseUrl = process.env.E2E_BASE_URL || "http://localhost:5173";
  }

  async open(): Promise<void> {
    await this.driver.get(`${this.baseUrl}/asistente/boletos`);
    await this.waitForPage();
  }

  async waitForPage(): Promise<void> {
    await this.driver.wait(until.elementLocated(this.pageHeading), 8000);
  }

  async getTicketCard(eventName: string): Promise<WebElement> {
    const cardXPath = `//article[.//h2[contains(normalize-space(), ${JSON.stringify(eventName)})]]`;
    return await this.driver.wait(until.elementLocated(By.xpath(cardXPath)), 8000);
  }

  async waitForTicketStatus(eventName: string, expectedStatus: string, timeoutMs = 8000): Promise<WebElement> {
    const xpath = `//article[.//h2[contains(normalize-space(), ${JSON.stringify(eventName)})] and .//*[contains(@class, 'rounded') and normalize-space()=${JSON.stringify(expectedStatus)}]]`;
    return await this.driver.wait(until.elementLocated(By.xpath(xpath)), timeoutMs);
  }

  async getCardStatus(card: WebElement): Promise<string> {
    const badgeEl = await card.findElement(
      By.xpath(".//*[contains(@class, 'rounded') and (normalize-space()='Activo' or normalize-space()='Cancelado' or normalize-space()='Ingresado')]"),
    );
    return (await badgeEl.getText()).trim();
  }

  async hasCancelButton(card: WebElement): Promise<boolean> {
    const buttons = await card.findElements(
      By.xpath(".//button[normalize-space()='Cancelar asistencia']"),
    );
    return buttons.length > 0 && (await buttons[0].isDisplayed());
  }

  async hasVerQrButton(card: WebElement): Promise<boolean> {
    const buttons = await card.findElements(
      By.xpath(".//button[normalize-space()='Ver QR']"),
    );
    return buttons.length > 0 && (await buttons[0].isDisplayed());
  }

  async hasVerDetallesButton(card: WebElement): Promise<boolean> {
    const buttons = await card.findElements(
      By.xpath(".//button[normalize-space()='Ver detalles']"),
    );
    return buttons.length > 0 && (await buttons[0].isDisplayed());
  }

  async clickVerQr(card: WebElement): Promise<void> {
    const btn = await card.findElement(By.xpath(".//button[normalize-space()='Ver QR']"));
    await this.driver.executeScript("arguments[0].scrollIntoView({ block: 'center' });", btn);
    await btn.click();
  }

  async clickVerDetalles(card: WebElement): Promise<void> {
    const btn = await card.findElement(By.xpath(".//button[normalize-space()='Ver detalles']"));
    await this.driver.executeScript("arguments[0].scrollIntoView({ block: 'center' });", btn);
    await btn.click();
  }

  async clickCancelTicket(card: WebElement): Promise<void> {
    const btn = await card.findElement(By.xpath(".//button[normalize-space()='Cancelar asistencia']"));
    await this.driver.executeScript("arguments[0].scrollIntoView({ block: 'center' });", btn);
    await btn.click();
  }

  async waitForCancelDialog(): Promise<boolean> {
    try {
      const dialog = await this.driver.wait(until.elementLocated(this.confirmModalTitle), 5000);
      return await dialog.isDisplayed();
    } catch {
      return false;
    }
  }

  async cancelDialogDismiss(): Promise<void> {
    const btn = await this.driver.wait(until.elementLocated(this.confirmModalCancelBtn), 5000);
    await btn.click();
  }

  async cancelDialogConfirm(): Promise<void> {
    const btn = await this.driver.wait(until.elementLocated(this.confirmModalConfirmBtn), 5000);
    await btn.click();
  }

  async waitForSuccessCancellation(): Promise<boolean> {
    try {
      const el = await this.driver.wait(until.elementLocated(this.successAlert), 8000);
      return await el.isDisplayed();
    } catch {
      return false;
    }
  }

  async search(query: string): Promise<void> {
    const input = await this.driver.wait(until.elementLocated(this.searchInput), 5000);
    await input.clear();
    await input.sendKeys(query);
    await this.driver.sleep(400);
  }

  async filterByStatus(status: "active" | "checked-in" | "cancelled" | ""): Promise<void> {
    const labelMap: Record<string, string> = {
      active: "Activo",
      "checked-in": "Ingresado",
      cancelled: "Cancelado",
      "": "Todos los estados",
    };
    const targetLabel = labelMap[status] || status;

    const selects = await this.driver.findElements(this.statusSelect);
    if (selects.length > 0 && (await selects[0].isDisplayed())) {
      await selects[0].sendKeys(status);
      await this.driver.sleep(400);
      return;
    }

    const detailsList = await this.driver.findElements(
      By.xpath("//details[.//summary[contains(@aria-label, 'Estado') or contains(., 'Estado') or contains(., 'Todos los estados') or contains(., 'Activo') or contains(., 'Cancelado')]]"),
    );
    for (const details of detailsList) {
      const summary = await details.findElement(By.css("summary"));
      await this.driver.executeScript("arguments[0].scrollIntoView({ block: 'center' });", summary);
      await summary.click();
      await this.driver.sleep(300);

      const optionBtns = await details.findElements(
        By.xpath(`.//button[normalize-space()=${JSON.stringify(targetLabel)}]`),
      );
      if (optionBtns.length > 0) {
        await optionBtns[0].click();
        await this.driver.sleep(400);
        return;
      }
    }
  }

  async clickClearFilters(): Promise<void> {
    const btn = await this.driver.wait(until.elementLocated(this.clearFiltersBtn), 5000);
    await btn.click();
    await this.driver.sleep(400);
  }

  async isNoTicketsFound(): Promise<boolean> {
    try {
      const el = await this.driver.wait(until.elementLocated(this.emptyStateHeading), 4000);
      return await el.isDisplayed();
    } catch {
      return false;
    }
  }

  // Digital Ticket methods
  async openDigitalTicket(ticketId: number): Promise<void> {
    await this.driver.get(`${this.baseUrl}/asistente/boletos/${ticketId}`);
  }

  async waitForDigitalTicket(): Promise<void> {
    await this.driver.wait(until.elementLocated(this.digitalTicketHeading), 8000);
  }

  async isQrActive(): Promise<boolean> {
    try {
      const img = await this.driver.wait(until.elementLocated(this.qrActiveImage), 5000);
      return await img.isDisplayed();
    } catch {
      return false;
    }
  }

  async isQrDisabledNoticeVisible(): Promise<boolean> {
    try {
      const notice = await this.driver.wait(until.elementLocated(this.qrDisabledNotice), 5000);
      return await notice.isDisplayed();
    } catch {
      return false;
    }
  }

  async hasPdfOptions(): Promise<boolean> {
    const dl = await this.driver.findElements(this.downloadPdfBtn);
    const pv = await this.driver.findElements(this.previewPdfBtn);
    return dl.length > 0 || pv.length > 0;
  }

  async clickDigitalTicketBack(): Promise<void> {
    const btn = await this.driver.wait(until.elementLocated(this.digitalTicketBackBtn), 5000);
    await btn.click();
    await this.waitForPage();
  }
}
