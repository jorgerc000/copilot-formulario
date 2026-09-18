import StudentRegistrationPage from './pages/StudentRegistrationPage';

describe('Registro de estudiantes - criterios de aceptación', () => {
  const page = new StudentRegistrationPage();

  beforeEach(() => {
    page.visit();
  });

  it('muestra todos los campos, controles y columnas requeridos', () => {
    cy.get(page.selectors.form).should('be.visible');
    ['identification', 'name', 'lastname', 'email', 'country', 'career', 'birthdate', 'age'].forEach((fieldName) => {
      page.field(fieldName).should('be.visible');
    });
    page.field('age').should('have.attr', 'readonly');
    page.field('register').should('be.visible');
    page.field('clear').should('be.visible');
    page.field('table').find('thead th').should('have.length', 8);
  });

  it('muestra errores para todos los campos obligatorios', () => {
    page.register();
    ['identification', 'name', 'lastname', 'email', 'country', 'career', 'birthdate'].forEach((fieldName) => {
      page.error(fieldName).should('have.class', 'show').and('not.be.empty');
    });
  });

  it('valida identificación, nombre, apellido y correo', () => {
    page.fillStudent({ identification: '12', name: 'A1', lastname: 'R2', email: 'correo-invalido' }).register();
    page.assertFieldError('identification', '5');
    page.assertFieldError('name', 'letras');
    page.assertFieldError('lastname', 'letras');
    page.assertFieldError('email', 'correo');
  });

  it('rechaza una fecha futura y calcula la edad para una fecha válida', () => {
    page.field('birthdate').type('2999-01-01').blur();
    page.assertFieldError('birthdate', 'futura');
    page.field('age').should('have.value', '');
    page.field('birthdate').clear().type('2000-05-15').blur();
    page.field('age').should('have.value', '26');
  });

  it('registra un estudiante y lo agrega con sus ocho columnas', () => {
    page.fillStudent().register();
    page.tableRows().should('have.length', 1).first().find('td').should('have.length', 8);
    page.tableRows().first().should('contain.text', 'Valentina').and('contain.text', 'Martínez Rojas');
  });

  it('bloquea la identificación o el correo duplicado', () => {
    const student = { identification: `DUP${Date.now()}`, email: `duplicate.${Date.now()}@unova.edu` };
    page.fillStudent(student).register();
    page.fillStudent({ ...student, name: 'Otro' }).register();
    page.field('message').should('have.class', 'show').and('contain.text', 'registrados');
    page.tableRows().should('have.length', 1);
  });

  it('limpia los campos, errores y edad, pero conserva la tabla', () => {
    page.fillStudent().register();
    page.clear();
    ['identification', 'name', 'lastname', 'email', 'country', 'birthdate'].forEach((fieldName) => {
      page.field(fieldName).should('have.value', '');
    });
    page.field('career').should('have.value', '');
    page.field('age').should('have.value', '');
    page.field('table').find('tbody tr').should('have.length', 1);
    page.field('message').should('not.be.visible');
  });
});