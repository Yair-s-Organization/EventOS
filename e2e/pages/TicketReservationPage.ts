import { By, WebDriver, WebElement, until } from "selenium-webdriver";

export class TicketReservationPage {
  private readonly baseUrl: string;

  // Catalog locators
  private readonly catalogCards = By.css("article");

  // Event details (UI05) locators
  private readonly eventDetailsHeading = By.xpath(
    "//h1[normalize-space()='Detalles del Evento']",
  );
  private readonly freeAdmissionBadge = By.xpath(
    "//*[normalize-space()='Entrada libre']",
  );
  private readonly freeAdmissionNotice = By.xpath(
    "//*[contains(normalize-space(), 'Acceso libre hasta completar el aforo del recinto')]",
  );
  private readonly reserveButton = By.xpath(
    "//a[normalize-space()='Reservar lugar']",
  );

  // Reservation screen (UI06) locators
  private readonly reservationHeader = By.xpath(
    "//h1[normalize-space()='Reservar lugar']",
  );
  private readonly seatMapSection = By.xpath(
    "//section[@aria-label='Mapa de asientos']",
  );
  private readonly selectedSeatDisplay = By.xpath(
    "//*[contains(normalize-space(), 'Asiento seleccionado:')]",
  );
  private readonly reserveSeatButton = By.xpath(
    "//button[normalize-space()='Reservar asiento']",
  );
  private readonly automaticReservationNotice = By.xpath(
    "//*[contains(normalize-space(), 'no necesitas seleccionar un asiento numerado')]",
  );
  private readonly automaticReserveButton = By.xpath(
    "//main//button[normalize-space()='Reservar lugar']",
  );

  // Dialog locators
  private readonly confirmDialogConfirmBtn = By.xpath(
    "//dialog[@open]//button[normalize-space()='Confirmar reservación']",
  );
  private readonly successDialogHeading = By.xpath(
    "//dialog[@open]//*[contains(normalize-space(), 'Asiento reservado') or contains(normalize-space(), 'Reservación confirmada')]",
  );
  private readonly successDialogQrImage = By.xpath(
    "//dialog[@open]//img[contains(@alt, 'Código QR')]",
  );
  private readonly successDialogAcceptBtn = By.xpath(
    "//dialog[@open]//button[normalize-space()='Aceptar']",
  );

  // Digital ticket locators
  private readonly digitalTicketStatusActive = By.xpath(
    "//*[normalize-space()='Activo']",
  );
  private readonly digitalTicketQrImage = By.xpath(
    "//section//img[contains(@alt, 'Código QR') or contains(@src, 'data:image/')]",
  );

  constructor(private readonly driver: WebDriver) {
    this.baseUrl = process.env.E2E_BASE_URL || "http://localhost:5173";
  }

  async openCatalog(): Promise<void> {
    await this.driver.get(`${this.baseUrl}/cartelera`);
    await this.driver.wait(
      until.elementLocated(By.xpath("//h1[contains(normalize-space(), 'Cartelera')]")),
      8000,
    );
  }

  async selectEventByTitle(title: string): Promise<void> {
    try {
      const searchInputs = await this.driver.findElements(
        By.css("input[type='search'], input[placeholder*='Buscar']"),
      );
      if (searchInputs.length > 0 && (await searchInputs[0].isDisplayed())) {
        await searchInputs[0].clear();
        await searchInputs[0].sendKeys(title);
        await this.driver.sleep(500);
      }
    } catch {
      // Continue without search filter
    }

    const cardXPath = `//article[.//h2[contains(normalize-space(), ${JSON.stringify(title)})] or .//h3[contains(normalize-space(), ${JSON.stringify(title)})]]`;
    const card = await this.driver.wait(until.elementLocated(By.xpath(cardXPath)), 10000);
    const detailLink = await card.findElement(By.xpath(".//a[contains(normalize-space(), 'Ver detalles')]"));
    await this.driver.executeScript("arguments[0].scrollIntoView({ block: 'center' });", detailLink);
    await detailLink.click();
  }

  async waitForEventDetails(title: string): Promise<void> {
    await this.driver.wait(until.elementLocated(this.eventDetailsHeading), 8000);
    await this.driver.wait(
      until.elementLocated(
        By.xpath(`//*[contains(normalize-space(), ${JSON.stringify(title)})]`),
      ),
      8000,
    );
  }

  async isFreeAdmission(): Promise<boolean> {
    try {
      const badge = await this.driver.wait(until.elementLocated(this.freeAdmissionBadge), 3000);
      const notice = await this.driver.wait(until.elementLocated(this.freeAdmissionNotice), 3000);
      return (await badge.isDisplayed()) && (await notice.isDisplayed());
    } catch {
      return false;
    }
  }

  async hasReserveButton(): Promise<boolean> {
    try {
      const elements = await this.driver.findElements(this.reserveButton);
      return elements.length > 0 && (await elements[0].isDisplayed());
    } catch {
      return false;
    }
  }

  async clickReserve(): Promise<void> {
    const btn = await this.driver.wait(until.elementLocated(this.reserveButton), 5000);
    await this.driver.wait(until.elementIsVisible(btn), 5000);
    await this.driver.executeScript("arguments[0].scrollIntoView({ block: 'center' });", btn);
    await btn.click();
  }

  async waitForReservationPage(): Promise<void> {
    await this.driver.wait(until.elementLocated(this.reservationHeader), 8000);
  }

  async isSeatMapVisible(): Promise<boolean> {
    try {
      const el = await this.driver.wait(until.elementLocated(this.seatMapSection), 5000);
      return await el.isDisplayed();
    } catch {
      return false;
    }
  }

  async selectAvailableSeat(targetLabel?: string): Promise<string> {
    await this.driver.wait(until.elementLocated(this.seatMapSection), 8000);
    let seatBtn: WebElement;

    if (targetLabel) {
      const xpath = `//button[contains(@aria-label, 'Asiento ${targetLabel}') and contains(@aria-label, 'disponible')]`;
      seatBtn = await this.driver.wait(until.elementLocated(By.xpath(xpath)), 5000);
    } else {
      const xpath = "//button[contains(@aria-label, 'disponible') and not(@disabled)]";
      const availableSeats = await this.driver.findElements(By.xpath(xpath));
      if (availableSeats.length === 0) {
        throw new Error("No hay asientos disponibles en el mapa de asientos.");
      }
      seatBtn = availableSeats[0];
    }

    await this.driver.executeScript("arguments[0].scrollIntoView({ block: 'center' });", seatBtn);
    await seatBtn.click();

    // Extract seat label from aria-label (e.g. "Asiento A4, disponible")
    const ariaLabel = (await seatBtn.getAttribute("aria-label")) || "";
    const match = ariaLabel.match(/Asiento\s+([A-Za-z0-9]+)/);
    return match ? match[1] : "";
  }

  async getSelectedSeatDisplay(): Promise<string> {
    const displayEl = await this.driver.wait(until.elementLocated(this.selectedSeatDisplay), 5000);
    return (await displayEl.getText()).trim();
  }

  async clickReserveSeat(): Promise<void> {
    const btn = await this.driver.wait(until.elementLocated(this.reserveSeatButton), 5000);
    await this.driver.wait(until.elementIsEnabled(btn), 5000);
    await this.driver.executeScript("arguments[0].scrollIntoView({ block: 'center' });", btn);
    await btn.click();
  }

  async isAutomaticReservationNoticeVisible(): Promise<boolean> {
    try {
      const el = await this.driver.wait(until.elementLocated(this.automaticReservationNotice), 5000);
      return await el.isDisplayed();
    } catch {
      return false;
    }
  }

  async clickAutomaticReserve(): Promise<void> {
    const btn = await this.driver.wait(until.elementLocated(this.automaticReserveButton), 5000);
    await this.driver.wait(until.elementIsEnabled(btn), 5000);
    await this.driver.executeScript("arguments[0].scrollIntoView({ block: 'center' });", btn);
    await btn.click();
  }

  async confirmReservationInModal(): Promise<void> {
    const btn = await this.driver.wait(until.elementLocated(this.confirmDialogConfirmBtn), 5000);
    await this.driver.wait(until.elementIsVisible(btn), 5000);
    await btn.click();
  }

  async waitForSuccessDialog(): Promise<boolean> {
    try {
      const heading = await this.driver.wait(until.elementLocated(this.successDialogHeading), 10000);
      return await heading.isDisplayed();
    } catch {
      return false;
    }
  }

  async isSuccessQrGenerated(): Promise<boolean> {
    try {
      const qrImg = await this.driver.wait(until.elementLocated(this.successDialogQrImage), 5000);
      return await qrImg.isDisplayed();
    } catch {
      return false;
    }
  }

  async getTicketIdFromSuccessDialog(): Promise<number | null> {
    try {
      const dialogTextEl = await this.driver.findElement(
        By.xpath("//dialog[@open]//*[contains(normalize-space(), 'Boleto #')]"),
      );
      const text = await dialogTextEl.getText();
      const match = text.match(/Boleto\s+#(\d+)/);
      return match ? Number(match[1]) : null;
    } catch {
      return null;
    }
  }

  async closeSuccessDialog(): Promise<void> {
    const btn = await this.driver.wait(until.elementLocated(this.successDialogAcceptBtn), 5000);
    await btn.click();
  }

  async navigateToDigitalTicket(ticketId: number): Promise<void> {
    await this.driver.get(`${this.baseUrl}/asistente/boletos/${ticketId}`);
  }

  async waitForDigitalTicket(eventName: string): Promise<boolean> {
    try {
      await this.driver.wait(
        until.elementLocated(
          By.xpath(`//*[contains(normalize-space(), ${JSON.stringify(eventName)})]`),
        ),
        10000,
      );
      const activeBadge = await this.driver.wait(
        until.elementLocated(this.digitalTicketStatusActive),
        5000,
      );
      const qrEl = await this.driver.wait(
        until.elementLocated(this.digitalTicketQrImage),
        5000,
      );
      return (await activeBadge.isDisplayed()) && (await qrEl.isDisplayed());
    } catch {
      return false;
    }
  }
}
