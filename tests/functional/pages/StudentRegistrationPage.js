class StudentRegistrationPage {
  selectors = {
    form: '#studentForm',
    identification: '#identification',
    name: '#name',
    lastname: '#lastname',
    email: '#email',
    country: '#country',
    career: '#career',
    birthdate: '#birthdate',
    age: '#age',
    register: '#registerBtn',
    clear: '#clearBtn',
    message: '#message',
    table: '#studentsTable',
  };

  visit() {
    cy.visit('/');
  }

  field(name) {
    return cy.get(this.selectors[name]);
  }

  error(fieldName) {
    return cy.get(`#${fieldName}Error`);
  }

  fillStudent(student = {}) {
    const values = {
      identification: 'QA20260911',
      name: 'Valentina',
      lastname: 'Martínez Rojas',
      email: `qa.${Date.now()}@unova.edu`,
      country: 'Colombia',
      career: 'Ing. Informática',
      birthdate: '2000-05-15',
      ...student,
    };

    Object.entries(values).forEach(([fieldName, value]) => {
      if (fieldName === 'career') this.field(fieldName).select(value);
      else this.field(fieldName).clear().type(value);
    });
    return this;
  }

  register() {
    this.field('register').click();
    return this;
  }

  clear() {
    this.field('clear').click();
    return this;
  }

  tableRows() {
    return this.field('table').find('tbody tr');
  }

  assertFieldError(fieldName, text) {
    this.error(fieldName).should('be.visible').and('contain.text', text);
    return this;
  }
}

export default StudentRegistrationPage;