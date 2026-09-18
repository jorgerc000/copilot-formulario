const frame = document.querySelector('#app-frame');
const results = document.querySelector('#test-results');
const passedCount = document.querySelector('#passed-count');
const failedCount = document.querySelector('#failed-count');
const suiteStatus = document.querySelector('#suite-status');
const tests = [];

function loadApp() {
  return new Promise((resolve, reject) => {
    frame.onload = () => resolve(frame.contentDocument);
    frame.onerror = () => reject(new Error('No se pudo cargar index.html'));
    frame.src = `index.html?test=${Date.now()}-${Math.random()}`;
  });
}

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

function fillValidForm(document, overrides = {}) {
  const values = { identificacion: 'ABC12345', nombre: 'Valentina', apellido: 'Martínez Rojas', correo: 'valentina@unova.edu', pais: 'Colombia', carrera: 'Ing. Informática', fechaNacimiento: '2000-05-15', ...overrides };
  Object.entries(values).forEach(([field, value]) => {
    const input = document.querySelector(`#${field}`);
    if (input.tagName === 'SELECT') input.value = value;
    else { input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })); }
  });
}

async function addTest(name, callback) {
  try { await callback(); tests.push({ name, passed: true }); }
  catch (error) { tests.push({ name: `${name}: ${error.message}`, passed: false }); }
}

async function run() {
  await addTest('Rechaza el envío cuando faltan campos obligatorios', async () => {
    const document = await loadApp();
    document.querySelector('#student-form').requestSubmit();
    expect(document.querySelectorAll('.field.invalid').length === 7, 'deben marcarse los 7 campos');
    expect(document.querySelector('#form-message').textContent.includes('Revisa'), 'debe mostrar mensaje de error');
  });
  await addTest('Calcula automáticamente la edad desde la fecha de nacimiento', async () => {
    const document = await loadApp();
    const birthDate = document.querySelector('#fechaNacimiento');
    birthDate.value = '2000-01-01';
    birthDate.dispatchEvent(new Event('input', { bubbles: true }));
    const expectedAge = new Date().getFullYear() - 2000 - (new Date() < new Date(`${new Date().getFullYear()}-01-01`) ? 1 : 0);
    expect(document.querySelector('#edad').value === String(expectedAge), `edad esperada: ${expectedAge}`);
  });
  await addTest('Limpia la edad y muestra error para una fecha futura', async () => {
    const document = await loadApp();
    const birthDate = document.querySelector('#fechaNacimiento');
    birthDate.value = '2999-01-01';
    birthDate.dispatchEvent(new Event('input', { bubbles: true }));
    expect(document.querySelector('#edad').value === '—', 'la edad debe quedar en —');
    expect(document.querySelector('[data-field="fechaNacimiento"]').classList.contains('invalid'), 'la fecha debe quedar inválida');
  });
  await addTest('Registra un estudiante y actualiza la tabla', async () => {
    const document = await loadApp();
    fillValidForm(document);
    document.querySelector('#student-form').requestSubmit();
    expect(document.querySelector('#student-count').textContent === '1', 'el contador debe ser 1');
    expect(document.querySelector('#student-table-body tr').textContent.includes('Valentina Martínez Rojas'), 'la fila debe contener el nombre');
    expect(document.querySelector('#form-message').classList.contains('success'), 'debe mostrar éxito');
  });
  await addTest('Bloquea identificaciones duplicadas', async () => {
    const document = await loadApp();
    fillValidForm(document);
    document.querySelector('#student-form').requestSubmit();
    fillValidForm(document, { nombre: 'Otra', correo: 'otra@unova.edu' });
    document.querySelector('#student-form').requestSubmit();
    expect(document.querySelector('#student-count').textContent === '1', 'no debe agregar una segunda fila');
    expect(document.querySelector('#form-message').textContent.includes('identificación ya existe'), 'debe informar el duplicado');
  });
  await addTest('Limpia el formulario sin borrar los registros', async () => {
    const document = await loadApp();
    fillValidForm(document);
    document.querySelector('#student-form').requestSubmit();
    document.querySelector('button[type="reset"]').click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(document.querySelector('#student-count').textContent === '1', 'la tabla debe conservar el registro');
    expect(document.querySelector('#identificacion').value === '', 'el formulario debe quedar vacío');
    expect(document.querySelector('#edad').value === '—', 'la edad debe reiniciarse');
  });

  const passed = tests.filter((test) => test.passed).length;
  passedCount.textContent = passed;
  failedCount.textContent = tests.length - passed;
  suiteStatus.textContent = passed === tests.length ? 'Suite aprobada' : 'Suite con fallos';
  suiteStatus.style.color = passed === tests.length ? '#52d19d' : '#ff9ca6';
  results.innerHTML = tests.map((test) => `<li class="${test.passed ? '' : 'failed'}">${test.name}</li>`).join('');
  document.querySelector('#finished-at').textContent = `${tests.length} pruebas ejecutadas · ${new Date().toLocaleTimeString('es-CO')}`;
}

run();