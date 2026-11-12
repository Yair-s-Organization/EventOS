import { By, WebDriver, until } from "selenium-webdriver";

export interface SubEventFormInput {
  nombre?: string;
  descripcion?: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  idRecinto: "1" | "2" | "3" | "4"; // 1=Auditorio, 2=Lab 1104, 3=Lab 1105, 4=Sala 14
  accesoQR?: "true" | "false";
}

export interface EventRequestFormInput {
  nombre: string;
  idAlcance: "1" | "2" | "3"; // 1=Público, 2=Interno, 3=Privado
  posterAbsolutePath: string;
  descripcion: string;
  justificacion: string;
  subEvento: SubEventFormInput;
}

export class EventRequestPage {
  private readonly url = process.env.E2E_BASE_URL
    ? `${process.env.E2E_BASE_URL}/solicitud-evento`
    : "http://localhost:5173/solicitud-evento";

  private readonly mainHeading = By.xpath(
    "//h1[normalize-space()='Solicitud de evento']",
  );

  // General event locators from SeccionDatosEvento.tsx
  private readonly nameInput = By.id("campoNombreEvento");
  private readonly scopeSelect = By.id("selectCategoria");
  private readonly posterInput = By.id("campoPoster");
  private readonly descriptionInput = By.id("campoDescripcion");
  private readonly justificationInput = By.id("campoJustificacion");

  // Dynamic sub-event buttons from SeccionSubeventos.tsx & CardSubevento.tsx
  private readonly addDateButton = By.id("botonAgregarFecha");
  private readonly viewSpaceDetailsButton = By.xpath(
    "//button[normalize-space()='Ver detalles de espacio' or normalize-space()='Ver detalles del laboratorio']",
  );
  private readonly submitRequestButton = By.xpath(
    "//button[@type='submit' and normalize-space()='Solicitar evento']",
  );

  // Scoped to open <dialog open> modals from Modal.tsx
  private readonly errorModalHeading = By.xpath(
    "//dialog[@open]//h2[normalize-space()='Error']",
  );
  private readonly errorModalAcceptBtn = By.xpath(
    "//dialog[@open]//button[normalize-space()='Aceptar']",
  );
  private readonly confirmModalHeading = By.xpath(
    "//dialog[@open]//h2[normalize-space()='Confirmar solicitud']",
  );
  private readonly confirmModalCancelBtn = By.xpath(
    "//dialog[@open]//button[normalize-space()='Cancelar']",
  );
  private readonly confirmModalAcceptBtn = By.xpath(
    "//dialog[@open]//button[normalize-space()='Aceptar']",
  );
  private readonly spaceDetailsModalHeading = By.xpath(
    "//dialog[@open]//h2[normalize-space()='Detalles del espacio solicitado']",
  );

  constructor(private readonly driver: WebDriver) {}

  private dateInput(index = 0) {
    return By.id(`selectFecha-${index}`);
  }
  private startTimeSelect(index = 0) {
    return By.id(`selectHoraInicio-${index}`);
  }
  private endTimeSelect(index = 0) {
    return By.id(`selectHoraFinal-${index}`);
  }
  private venueSelect(index = 0) {
    return By.id(`selectRecinto-${index}`);
  }
  private ticketSelect(index = 0) {
    return By.id(`selectBoleto-${index}`);
  }

  async open(): Promise<void> {
    await this.driver.get(this.url);
    await this.driver.wait(until.urlContains("/solicitud-evento"), 10000);
    await this.driver.wait(until.elementLocated(this.mainHeading), 5000);
  }

  async isVerificationRequiredModalVisible(timeoutMs = 5000): Promise<boolean> {
    const heading = By.xpath("//dialog[@open]//*[contains(normalize-space(), 'Verificación necesaria')]");
    try {
      await this.driver.wait(until.elementLocated(heading), timeoutMs);
      return true;
    } catch {
      return false;
    }
  }

  async clickGoToVerification(): Promise<void> {
    const btn = By.xpath("//dialog[@open]//button[contains(normalize-space(), 'Ir a verificación')]");
    const el = await this.driver.wait(until.elementLocated(btn), 5000);
    await el.click();
  }

  async waitUntilLoaded(): Promise<void> {
    await this.driver.wait(until.urlContains("/solicitud-evento"), 10000);
    await this.driver.wait(until.elementLocated(this.mainHeading), 5000);
    await this.driver.wait(until.elementLocated(this.nameInput), 5000);
  }

  private async selectOptionByValue(
    selectLocator: By,
    value: string,
  ): Promise<void> {
    const selectEl = await this.driver.findElement(selectLocator);
    const optionEl = await selectEl.findElement(
      By.css(`option[value='${value}']`),
    );
    await optionEl.click();
  }

  async setSubEventDate(dateIso: string, index = 0): Promise<void> {
    const input = await this.driver.findElement(this.dateInput(index));
    // Set controlled React input value reliably across browsers
    await this.driver.executeScript(
      (el: HTMLInputElement, val: string) => {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value",
        )?.set;
        nativeInputValueSetter?.call(el, val);
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        el.dispatchEvent(new Event("blur", { bubbles: true }));
      },
      input,
      dateIso,
    );
  }

  async setSubEventTimes(
    startTime: string,
    endTime: string,
    index = 0,
  ): Promise<void> {
    await this.selectOptionByValue(this.startTimeSelect(index), startTime);
    await this.selectOptionByValue(this.endTimeSelect(index), endTime);
    // Trigger blur on end time select so validation message renders immediately
    const endEl = await this.driver.findElement(this.endTimeSelect(index));
    await this.driver.executeScript(
      (el: HTMLElement) => el.dispatchEvent(new Event("blur", { bubbles: true })),
      endEl,
    );
  }

  async setSubEventVenue(
    venueId: "1" | "2" | "3" | "4",
    index = 0,
  ): Promise<void> {
    await this.selectOptionByValue(this.venueSelect(index), venueId);
  }

  async setSubEventTicketAccess(
    requiresTicket: "true" | "false",
    index = 0,
  ): Promise<void> {
    await this.selectOptionByValue(this.ticketSelect(index), requiresTicket);
  }

  async isTicketSelectDisabled(index = 0): Promise<boolean> {
    const selectEl = await this.driver.findElement(this.ticketSelect(index));
    return !(await selectEl.isEnabled());
  }

  async isViewSpaceDetailsButtonDisabled(): Promise<boolean> {
    const btn = await this.driver.findElement(this.viewSpaceDetailsButton);
    return !(await btn.isEnabled());
  }

  async openSpaceDetailsModal(): Promise<boolean> {
    const btn = await this.driver.findElement(this.viewSpaceDetailsButton);
    await btn.click();
    try {
      const heading = await this.driver.wait(
        until.elementLocated(this.spaceDetailsModalHeading),
        5000,
      );
      await this.driver.wait(until.elementIsVisible(heading), 5000);
      return true;
    } catch {
      return false;
    }
  }

  async closeOpenDialogViaEscape(): Promise<void> {
    await this.driver.executeScript(() => {
      const openDialog = document.querySelector<HTMLDialogElement>("dialog[open]");
      if (openDialog) {
        openDialog.dispatchEvent(new Event("cancel", { bubbles: true }));
        openDialog.close();
      }
    });
  }

  async addSubEventBlock(): Promise<void> {
    const btn = await this.driver.findElement(this.addDateButton);
    await btn.click();
  }

  async getSubEventBlockCount(): Promise<number> {
    const inputs = await this.driver.findElements(
      By.css("input[id^='selectFecha-']"),
    );
    return inputs.length;
  }

  async removeLastSubEventBlock(): Promise<void> {
    const removeBtns = await this.driver.findElements(
      By.css("button[id^='botonEliminarFecha-']"),
    );
    if (removeBtns.length > 0) {
      await removeBtns[removeBtns.length - 1].click();
      // Wait for 350ms removal transition in SeccionSubeventos.tsx
      await this.driver.sleep(450);
    }
  }

  async fillCompleteForm(data: EventRequestFormInput): Promise<void> {
    const nameEl = await this.driver.findElement(this.nameInput);
    await nameEl.clear();
    await nameEl.sendKeys(data.nombre);

    await this.selectOptionByValue(this.scopeSelect, data.idAlcance);

    const posterEl = await this.driver.findElement(this.posterInput);
    await posterEl.sendKeys(data.posterAbsolutePath);
    await this.driver.sleep(300);

    const descEl = await this.driver.findElement(this.descriptionInput);
    await descEl.clear();
    await descEl.sendKeys(data.descripcion);

    const justEl = await this.driver.findElement(this.justificationInput);
    await justEl.clear();
    await justEl.sendKeys(data.justificacion);

    await this.setSubEventDate(data.subEvento.fecha, 0);
    await this.setSubEventVenue(data.subEvento.idRecinto, 0);
    await this.setSubEventTimes(
      data.subEvento.horaInicio,
      data.subEvento.horaFin,
      0,
    );

    if (data.subEvento.idRecinto === "1" && data.subEvento.accesoQR) {
      await this.setSubEventTicketAccess(data.subEvento.accesoQR, 0);
    }

    if (data.subEvento.nombre && data.subEvento.descripcion) {
      await this.setSubEventDetails(
        data.subEvento.nombre,
        data.subEvento.descripcion,
        0,
      );
    }
  }

  async setSubEventDetails(
    nombre: string,
    descripcion: string,
    index = 0,
  ): Promise<void> {
    const infoBtns = await this.driver.findElements(
      By.css("button[id^='botonVerInformacion-']"),
    );
    if (infoBtns.length > index) {
      await this.driver.executeScript(
        "arguments[0].scrollIntoView({ block: 'center' });",
        infoBtns[index],
      );
      await infoBtns[index].click();

      const nameInput = await this.driver.wait(
        until.elementLocated(
          By.xpath("//dialog[@open]//*[@id='campoNombreSubevento']"),
        ),
        5000,
      );
      await this.driver.wait(until.elementIsVisible(nameInput), 5000);
      await nameInput.clear();
      await nameInput.sendKeys(nombre);

      const descInput = await this.driver.findElement(
        By.xpath("//dialog[@open]//*[@id='campoDescripcionSubevento']"),
      );
      await descInput.clear();
      await descInput.sendKeys(descripcion);

      const saveBtn = await this.driver.findElement(
        By.xpath("//dialog[@open]//button[normalize-space()='Guardar']"),
      );
      await saveBtn.click();
      await this.driver.sleep(300);
    }
  }

  async submitForm(): Promise<void> {
    const btn = await this.driver.findElement(this.submitRequestButton);
    await btn.click();
  }

  async isErrorModalVisible(timeoutMs = 5000): Promise<boolean> {
    try {
      const heading = await this.driver.wait(
        until.elementLocated(this.errorModalHeading),
        timeoutMs,
      );
      await this.driver.wait(until.elementIsVisible(heading), timeoutMs);
      return true;
    } catch {
      return false;
    }
  }

  async closeErrorModal(): Promise<void> {
    const btn = await this.driver.wait(
      until.elementLocated(this.errorModalAcceptBtn),
      5000,
    );
    await this.driver.wait(until.elementIsVisible(btn), 5000);
    await btn.click();
  }

  async getModalText(): Promise<string> {
    const dialog = await this.driver.wait(
      until.elementLocated(By.css("dialog[open]")),
      5000,
    );
    return await dialog.getText();
  }

  async isConfirmModalVisible(timeoutMs = 5000): Promise<boolean> {
    try {
      const heading = await this.driver.wait(
        until.elementLocated(this.confirmModalHeading),
        timeoutMs,
      );
      await this.driver.wait(until.elementIsVisible(heading), timeoutMs);
      return true;
    } catch {
      return false;
    }
  }

  async cancelConfirmModal(): Promise<void> {
    const btn = await this.driver.wait(
      until.elementLocated(this.confirmModalCancelBtn),
      5000,
    );
    await this.driver.wait(until.elementIsVisible(btn), 5000);
    await btn.click();
  }

  async acceptConfirmModal(): Promise<void> {
    const btn = await this.driver.wait(
      until.elementLocated(this.confirmModalAcceptBtn),
      5000,
    );
    await this.driver.wait(until.elementIsVisible(btn), 5000);
    await btn.click();
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
}
