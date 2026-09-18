# Pruebas del registro de estudiantes

El proyecto separa las pruebas unitarias de las pruebas funcionales Cypress:

```text
tests/
  unit/                         Reglas aisladas ejecutadas con Node.js
    tests-terminal.js
  functional/                   Flujos reales ejecutados con Cypress
    pages/StudentRegistrationPage.js
    support/e2e.js
    student-registration.cy.js
```

## Ejecución local

```bash
npm ci
npm run test:unit
npm run test:e2e
```

Para abrir Cypress en modo interactivo:

```bash
npm run test:e2e:open
```

La suite funcional usa `https://admisions.geekqa.net` como `baseUrl` y el Page Object Model concentra los selectores y acciones reutilizables. El workflow de GitHub Actions ejecuta unitarias y funcionales en jobs independientes.