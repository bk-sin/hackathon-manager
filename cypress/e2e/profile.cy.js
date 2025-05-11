describe("Pantalla de perfil - flujo completo", () => {
  it("Permite editar y previsualizar el perfil completo", () => {
    cy.visit("/sign-in");
    const email = Cypress.env("USER_EMAIL");
    cy.get("input#identifier-field").type(`${email}{enter}`);
    const password = Cypress.env("USER_PASSWORD");
    cy.get("input#password-field", { timeout: 10000 })
      .should("be.visible")
      .type(`${password}{enter}`);
    cy.url().should("not.include", "/sign-in");
    cy.visit("/profile");
    cy.contains("Tu Perfil").should("be.visible");
    cy.get('input[placeholder="Tu nombre"]')
      .focus()
      .clear()
      .type("{selectall}{backspace}Ana", { delay: 0 });
    cy.get('input[placeholder="Tu apellido"]')
      .focus()
      .clear()
      .type("{selectall}{backspace}Martínez", { delay: 0 });
    cy.get('textarea[placeholder*="Cuéntanos sobre ti"]')
      .clear()
      .type("¡Bio de prueba Cypress!");
    cy.get('input[placeholder="Ciudad, País"]').clear().type("Madrid, España");
    cy.get('input[placeholder="https://tu-sitio.com"]')
      .clear()
      .type("https://anamartinez.dev");
    cy.get('input[placeholder="https://github.com/username"]')
      .clear()
      .type("https://github.com/anamartinez");
    cy.contains("label", "Desarrollo Frontend")
      .prev('input[type="checkbox"]')
      .check({ force: true });
    cy.contains("label", "IA/Machine Learning")
      .prev('input[type="checkbox"]')
      .check({ force: true });
    cy.get('button#available[role="checkbox"]').then(($btn) => {
      if ($btn.attr("aria-checked") === "true") {
        cy.wrap($btn).click({ force: true }).click({ force: true });
      } else {
        cy.wrap($btn).click({ force: true });
      }
    });
    cy.contains("button", "Guardar Cambios").click();
    cy.contains("button", "Vista Previa").should(
      "have.attr",
      "aria-selected",
      "true"
    );
    cy.contains("button", "Vista Previa").should(
      "have.attr",
      "data-state",
      "active"
    );
    cy.get("h2").should("contain", "Ana Martínez");
    cy.contains("¡Bio de prueba Cypress!").should("be.visible");
    cy.contains("Madrid, España").should("be.visible");
    cy.get("a")
      .contains("anamartinez.dev")
      .should("have.attr", "href", "https://anamartinez.dev");
    cy.get('a[href="https://github.com/anamartinez"]').should("be.visible");
    cy.contains("Disponible").should("be.visible");
    cy.contains("Desarrollo Frontend").should("be.visible");
    cy.contains("IA/Machine Learning").should("be.visible");
    cy.contains("Hackathons").should("be.visible");
    cy.contains("Proyectos").should("be.visible");
    cy.contains("Equipos").should("be.visible");
    cy.contains("Acerca de").should("be.visible");
    cy.contains("Habilidades").should("be.visible");
    cy.contains("Actividad Reciente").should("be.visible");
  });
});
