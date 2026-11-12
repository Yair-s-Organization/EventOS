import assert from "node:assert/strict";
import { Builder, WebDriver, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";
import { LoginPage } from "../pages/LoginPage";
import { AdminSpacesPage } from "../pages/AdminSpacesPage";
import { AdminEquipmentPage } from "../pages/AdminEquipmentPage";

const ALL_SPACES = [
  { name: "Auditorio Principal", isLab: false },
  { name: "Laboratorio de Cómputo A", isLab: true, id: 2 },
  { name: "Laboratorio de Cómputo B", isLab: true, id: 3 },
  { name: "Sala 14", isLab: false },
];

async function runAdminSuite(): Promise<void> {
  const options = new chrome.Options();
  options.addArguments("--window-size=1366,900");
  if (process.env.HEADLESS === "true") {
    options.addArguments(
      "--headless=new",
      "--no-sandbox",
      "--disable-dev-shm-usage",
    );
  }

  const driver: WebDriver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  const loginPage = new LoginPage(driver);
  const spacesPage = new AdminSpacesPage(driver);
  const equipmentPage = new AdminEquipmentPage(driver);

  try {
    // =========================================================================
    // TC-ADM-01: Login as Administrador -> /menu-admin -> /gestion-espacios
    // =========================================================================
    console.log(
      "Running TC-ADM-01: Login as Administrador -> /menu-admin -> /gestion-espacios...",
    );
    await loginPage.login("admin@ipn.mx", "Admin123!");
    await driver.wait(until.urlContains("/menu-admin"), 10000);
    await spacesPage.open();

    for (const space of ALL_SPACES) {
      const hasManageBtn = await spacesPage.hasManageEquipmentButton(space.name);
      assert.equal(
        hasManageBtn,
        space.isLab,
        `Space '${space.name}' should ${space.isLab ? "have" : "NOT have"} 'Gestionar equipos' button`,
      );
    }
    console.log("  ✓ TC-ADM-01 passed");

    // =========================================================================
    // TC-ADM-02: Inhabilitar and Habilitar ALL 4 spaces (Auditorio, Lab A, Lab B, Sala 14)
    // =========================================================================
    console.log(
      "Running TC-ADM-02: Inhabilitar and Habilitar across all 4 physical spaces...",
    );
    for (const space of ALL_SPACES) {
      // Ensure space starts Habilitado
      const initialStatus = await spacesPage.getSpaceStatusText(space.name);
      if (initialStatus === "Inhabilitado") {
        await spacesPage.clickToggleStateButton(space.name);
        assert.equal(await spacesPage.isEnableModalOpen(), true);
        await spacesPage.confirmEnableSpace(space.name);
      }

      // Open Inhabilitar modal and verify Cancelar on the first space
      if (space.name === "Auditorio Principal") {
        await spacesPage.clickToggleStateButton(space.name);
        assert.equal(
          await spacesPage.isDisableModalOpen(),
          true,
          "Should open 'Inhabilitar espacio físico' modal",
        );
        await spacesPage.cancelModal();
        assert.equal(
          await spacesPage.getSpaceStatusText(space.name),
          "Habilitado",
          "Canceling modal should keep space 'Habilitado'",
        );
      }

      // Inhabilitar space
      await spacesPage.clickToggleStateButton(space.name);
      assert.equal(
        await spacesPage.isDisableModalOpen(),
        true,
        `Should open 'Inhabilitar espacio físico' modal for ${space.name}`,
      );
      await spacesPage.confirmDisableSpace(space.name);
      assert.equal(
        await spacesPage.getSpaceStatusText(space.name),
        "Inhabilitado",
        `${space.name} should now be 'Inhabilitado'`,
      );

      // Re-Habilitar space so system returns to clean state
      await spacesPage.clickToggleStateButton(space.name);
      assert.equal(
        await spacesPage.isEnableModalOpen(),
        true,
        `Should open 'Habilitar espacio físico' modal for ${space.name}`,
      );
      await spacesPage.confirmEnableSpace(space.name);
      assert.equal(
        await spacesPage.getSpaceStatusText(space.name),
        "Habilitado",
        `${space.name} should be restored to 'Habilitado'`,
      );
      console.log(`    ✓ ${space.name}: Inhabilitar -> Habilitar verified`);
    }
    console.log("  ✓ TC-ADM-02 passed");

    // =========================================================================
    // TC-ADM-03 & TC-ADM-04: 'Gestionar equipos' & Inhabilitar/Habilitar equipos in Lab A and Lab B
    // =========================================================================
    const laboratories = ALL_SPACES.filter((s) => s.isLab);

    for (const lab of laboratories) {
      const tcId = lab.id === 2 ? "TC-ADM-03" : "TC-ADM-04";
      console.log(
        `Running ${tcId}: 'Gestionar equipos' & Inhabilitar/Habilitar Equipo 1 in ${lab.name} (ID ${lab.id})...`,
      );

      const initialLabCapacity = await spacesPage.getSpaceCapacity(lab.name);
      await spacesPage.clickManageEquipment(lab.name);
      await equipmentPage.waitUntilLoaded(lab.id);

      // Ensure Equipo 1 starts enabled
      if (await equipmentPage.isEquipmentDisabled(1)) {
        await equipmentPage.clickEquipmentSwitch(1);
        assert.equal(await equipmentPage.isWarningModalOpen(), true);
        await equipmentPage.acceptWarningModalAndWaitForState(1, false);
      }

      const statsBefore = await equipmentPage.getStats();
      assert.equal(
        statsBefore.total,
        36,
        `Expected 36 total computers in ${lab.name}`,
      );

      // 1. Test Cancelar in 'Advertencia' modal
      await equipmentPage.clickEquipmentSwitch(1);
      assert.equal(
        await equipmentPage.isWarningModalOpen(),
        true,
        "Should open 'Advertencia' modal when clicking Equipo 1 switch",
      );
      const modalMessage = await equipmentPage.getWarningModalText();
      assert.equal(
        modalMessage.includes("inhabilitar el Equipo 1"),
        true,
        `Expected confirmation text for Equipo 1, got: ${modalMessage}`,
      );
      await equipmentPage.cancelWarningModal();
      assert.equal(
        await equipmentPage.isEquipmentDisabled(1),
        false,
        "Equipo 1 should remain enabled after clicking Cancelar",
      );

      // 2. Confirm Inhabilitar Equipo 1
      await equipmentPage.clickEquipmentSwitch(1);
      assert.equal(await equipmentPage.isWarningModalOpen(), true);
      await equipmentPage.acceptWarningModalAndWaitForState(1, true);

      const statsAfterDisable = await equipmentPage.getStats();
      assert.equal(
        statsAfterDisable.disponibles,
        statsBefore.disponibles - 1,
        "Available computers count should decrease by 1 after disabling Equipo 1",
      );
      assert.equal(
        statsAfterDisable.fueraDeServicio,
        statsBefore.fueraDeServicio + 1,
        "Out-of-service computers count should increase by 1 after disabling Equipo 1",
      );

      // 3. Return to /gestion-espacios and verify dynamic capacity (aforo) decreased by 1
      await equipmentPage.clickBackToSpaces();
      await spacesPage.waitUntilLoaded();
      const updatedLabCapacity = await spacesPage.getSpaceCapacity(lab.name);
      assert.equal(
        updatedLabCapacity,
        statsAfterDisable.disponibles,
        `Lab capacity on card (${updatedLabCapacity}) should match available computers (${statsAfterDisable.disponibles})`,
      );

      // 4. Re-enter 'Gestionar equipos' and re-enable Equipo 1 to restore clean state
      await spacesPage.clickManageEquipment(lab.name);
      await equipmentPage.waitUntilLoaded(lab.id);
      await equipmentPage.clickEquipmentSwitch(1);
      assert.equal(await equipmentPage.isWarningModalOpen(), true);
      await equipmentPage.acceptWarningModalAndWaitForState(1, false);

      const statsRestored = await equipmentPage.getStats();
      assert.equal(statsRestored.disponibles, statsBefore.disponibles);
      assert.equal(statsRestored.fueraDeServicio, statsBefore.fueraDeServicio);

      await equipmentPage.clickBackToSpaces();
      await spacesPage.waitUntilLoaded();
      assert.equal(
        await spacesPage.getSpaceCapacity(lab.name),
        initialLabCapacity,
      );

      console.log(`  ✓ ${tcId} passed (${lab.name})`);
    }

    console.log(
      "\nALL ADMINISTRATOR (GESTIÓN DE ESPACIOS & GESTIÓN DE EQUIPOS) E2E TESTS PASSED SUCCESSFULLY!",
    );
  } finally {
    await driver.quit();
  }
}

runAdminSuite();
