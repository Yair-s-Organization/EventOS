import { By, Key, WebDriver, WebElement, until } from "selenium-webdriver";

export class AdminDepartmentHeadPage {
  private readonly url = process.env.E2E_BASE_URL
    ? `${process.env.E2E_BASE_URL}/admin/jefe-departamento`
    : "http://localhost:5173/admin/jefe-departamento";

  private readonly navLink = By.xpath(
    "//nav//a[normalize-space()='Gestión de Jefes de departamento']",
  );

  private readonly mainHeading = By.xpath(
    "//h1[normalize-space()='Asignar Jefe de Departamento']",
  );

  private readonly assignTabBtn = By.xpath(
    "//div[contains(@class,'border-b')]//button[normalize-space()='Asignar Jefe']",
  );

  private readonly revokeTabBtn = By.xpath(
    "//div[contains(@class,'border-b')]//button[normalize-space()='Revocar Jefe']",
  );

  private readonly searchInput = By.xpath(
    "//input[@placeholder='Buscar Correo o nombre...']",
  );

  private readonly searchSubmitBtn = By.xpath(
    "//form//button[@type='submit' and @aria-label='Buscar']",
  );

  private readonly loadingCell = By.xpath(
    "//td[normalize-space()='Cargando registros...']",
  );

  private readonly emptyTableCell = By.xpath(
    "//td[normalize-space()='No se encontraron registros.']",
  );

  private readonly assignModalHeading = By.xpath(
    "//h2[normalize-space()='Asignar Jefe de Departamento']",
  );

  private readonly revokeModalHeading = By.xpath(
    "//h2[normalize-space()='Revocar Jefe de Departamento']",
  );

  private readonly modalCancelBtn = By.xpath(
    "//div[contains(@class,'fixed')]//button[normalize-space()='Cancelar']",
  );

  private readonly modalAssignConfirmBtn = By.xpath(
    "//div[contains(@class,'fixed')]//button[normalize-space()='Asignar']",
  );

  private readonly modalRevokeConfirmBtn = By.xpath(
    "//div[contains(@class,'fixed')]//button[normalize-space()='Confirmar']",
  );

  constructor(private readonly driver: WebDriver) {}

  async navigateFromNavbar(): Promise<void> {
    const link = await this.driver.wait(
      until.elementLocated(this.navLink),
      8000,
    );
    await this.driver.wait(until.elementIsVisible(link), 5000);
    await link.click();
    await this.waitUntilLoaded();
  }

  async open(): Promise<void> {
    await this.driver.get(this.url);
    await this.waitUntilLoaded();
  }

  async waitUntilLoaded(): Promise<void> {
    await this.driver.wait(
      until.urlContains("/admin/jefe-departamento"),
      10000,
    );
    const heading = await this.driver.wait(
      until.elementLocated(this.mainHeading),
      8000,
    );
    await this.driver.wait(until.elementIsVisible(heading), 5000);
    await this.waitForTableLoaded();
  }

  async waitForTableLoaded(): Promise<void> {
    await this.driver.wait(async () => {
      const loadingEls = await this.driver.findElements(this.loadingCell);
      return loadingEls.length === 0;
    }, 8000);
  }

  async selectAssignTab(): Promise<void> {
    const btn = await this.driver.wait(
      until.elementLocated(this.assignTabBtn),
      5000,
    );
    await this.driver.wait(until.elementIsVisible(btn), 5000);
    await btn.click();
    await this.waitForTableLoaded();
  }

  async selectRevokeTab(): Promise<void> {
    const btn = await this.driver.wait(
      until.elementLocated(this.revokeTabBtn),
      5000,
    );
    await this.driver.wait(until.elementIsVisible(btn), 5000);
    await btn.click();
    await this.waitForTableLoaded();
  }

  async searchByEmailOrName(query: string): Promise<void> {
    const input = await this.driver.wait(
      until.elementLocated(this.searchInput),
      5000,
    );
    await this.driver.wait(until.elementIsVisible(input), 5000);
    await input.click();
    await input.sendKeys(Key.chord(Key.CONTROL, "a"), Key.BACK_SPACE);

    const currentVal = await input.getAttribute("value");
    if (currentVal && currentVal.length > 0) {
      await input.clear();
    }

    if (query.length > 0) {
      await input.sendKeys(query);
    }

    const submitBtn = await this.driver.wait(
      until.elementLocated(this.searchSubmitBtn),
      5000,
    );
    await submitBtn.click();
    await this.waitForTableLoaded();
  }

  private rowByEmail(email: string): By {
    return By.xpath(
      `//tbody/tr[td[normalize-space()=${JSON.stringify(email)}]]`,
    );
  }

  async isEmailPresentInTable(email: string, timeoutMs = 4000): Promise<boolean> {
    try {
      const row = await this.driver.wait(
        until.elementLocated(this.rowByEmail(email)),
        timeoutMs,
      );
      return await row.isDisplayed();
    } catch {
      return false;
    }
  }

  async getVisibleRowEmails(): Promise<string[]> {
    await this.waitForTableLoaded();
    const emptyCells = await this.driver.findElements(this.emptyTableCell);
    if (emptyCells.length > 0) {
      return [];
    }
    const emailCells = await this.driver.findElements(
      By.xpath("//tbody/tr/td[3]"),
    );
    const emails: string[] = [];
    for (const cell of emailCells) {
      emails.push((await cell.getText()).trim());
    }
    return emails;
  }

  async getRowByEmail(email: string): Promise<WebElement> {
    const row = await this.driver.wait(
      until.elementLocated(this.rowByEmail(email)),
      6000,
    );
    await this.driver.wait(until.elementIsVisible(row), 5000);
    return row;
  }

  async clickAssignButtonForEmail(email: string): Promise<void> {
    const row = await this.getRowByEmail(email);
    const btn = await row.findElement(
      By.xpath(".//button[normalize-space()='Asignar Jefe']"),
    );
    await btn.click();
  }

  async clickRevokeButtonForEmail(email: string): Promise<void> {
    const row = await this.getRowByEmail(email);
    const btn = await row.findElement(
      By.xpath(".//button[normalize-space()='Revocar']"),
    );
    await btn.click();
  }

  async isAssignModalOpen(timeoutMs = 5000): Promise<boolean> {
    try {
      const heading = await this.driver.wait(
        until.elementLocated(this.assignModalHeading),
        timeoutMs,
      );
      return await heading.isDisplayed();
    } catch {
      return false;
    }
  }

  async isRevokeModalOpen(timeoutMs = 5000): Promise<boolean> {
    try {
      const heading = await this.driver.wait(
        until.elementLocated(this.revokeModalHeading),
        timeoutMs,
      );
      return await heading.isDisplayed();
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

  async confirmAssignForEmail(email: string): Promise<void> {
    const btn = await this.driver.wait(
      until.elementLocated(this.modalAssignConfirmBtn),
      5000,
    );
    await this.driver.wait(until.elementIsVisible(btn), 5000);
    await btn.click();

    await this.driver.wait(async () => {
      const rows = await this.driver.findElements(this.rowByEmail(email));
      return rows.length === 0;
    }, 8000);
  }

  async confirmRevokeForEmail(email: string): Promise<void> {
    const btn = await this.driver.wait(
      until.elementLocated(this.modalRevokeConfirmBtn),
      5000,
    );
    await this.driver.wait(until.elementIsVisible(btn), 5000);
    await btn.click();

    await this.driver.wait(async () => {
      const rows = await this.driver.findElements(this.rowByEmail(email));
      return rows.length === 0;
    }, 8000);
  }

  async getSuccessBannerText(timeoutMs = 6000): Promise<string> {
    const banner = await this.driver.wait(
      until.elementLocated(
        By.xpath(
          "//div[contains(@class,'bg-[#38761d]')]//span[last()]",
        ),
      ),
      timeoutMs,
    );
    await this.driver.wait(until.elementIsVisible(banner), timeoutMs);
    return (await banner.getText()).trim();
  }
}
