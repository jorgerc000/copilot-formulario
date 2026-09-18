const form = document.querySelector('#student-form');
const birthDateInput = document.querySelector('#fechaNacimiento');
const ageInput = document.querySelector('#edad');
const tableBody = document.querySelector('#student-table-body');
const countElements = [document.querySelector('#student-count'), document.querySelector('#table-count')];
const message = document.querySelector('#form-message');
const fields = ['identificacion', 'nombre', 'apellido', 'correo', 'pais', 'carrera', 'fechaNacimiento'];
const students = [];

const today = new Date();
birthDateInput.max = today.toISOString().split('T')[0];

function calculateAge(dateValue) {
  const birthDate = new Date(`${dateValue}T00:00:00`);
  let age = today.getFullYear() - birthDate.getFullYear();
  const birthdayHasPassed = today.getMonth() > birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
  if (!birthdayHasPassed) age -= 1;
  return age;
}

function setError(fieldName, errorText = '') {
  const field = document.querySelector(`[data-field="${fieldName}"]`);
  const errorElement = document.querySelector(`#${fieldName}-error`);
  field.classList.toggle('invalid', Boolean(errorText));
  field.classList.toggle('valid', !errorText && field.querySelector('input, select').value);
  errorElement.textContent = errorText;
  field.querySelector('input, select').setAttribute('aria-invalid', Boolean(errorText));
}

function validateField(fieldName) {
  const input = document.querySelector(`#${fieldName}`);
  const value = input.value.trim();
  let error = '';
  const lettersOnly = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[\s'-][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/;

  if (!value) error = 'Este campo es obligatorio.';
  else if (fieldName === 'identificacion' && (!/^[A-Za-z0-9-]+$/.test(value) || value.length < 5)) error = 'Usa al menos 5 caracteres alfanuméricos.';
  else if (['nombre', 'apellido'].includes(fieldName) && (value.length < 2 || !lettersOnly.test(value))) error = 'Usa solo letras, espacios y tildes (mínimo 2).';
  else if (fieldName === 'correo' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) error = 'Ingresa un correo electrónico válido.';
  else if (fieldName === 'carrera' && !input.value) error = 'Selecciona una carrera.';
  else if (fieldName === 'fechaNacimiento' && (Number.isNaN(new Date(`${value}T00:00:00`).getTime()) || value > birthDateInput.max)) error = 'La fecha no puede ser futura.';
  setError(fieldName, error);
  return !error;
}

function updateAge() {
  const value = birthDateInput.value;
  if (!value || value > birthDateInput.max) { ageInput.value = '—'; return; }
  const age = calculateAge(value);
  ageInput.value = age >= 0 ? age : '—';
}

function showMessage(text, type) {
  message.textContent = text;
  message.className = `form-message ${type}`;
}

function renderTable() {
  tableBody.innerHTML = '';
  students.forEach((student) => {
    const row = document.createElement('tr');
    row.className = 'new-row';
    row.innerHTML = `<td>${student.identificacion}</td><td>${student.nombre} ${student.apellido}</td><td>${student.correo}</td><td>${student.pais}</td><td class="career-cell">${student.carrera}</td><td>${student.fechaNacimiento}</td><td class="age-cell">${student.edad} años</td>`;
    tableBody.appendChild(row);
  });
  if (!students.length) tableBody.innerHTML = '<tr class="empty-row"><td colspan="7"><span><i data-lucide="inbox" aria-hidden="true"></i></span><strong>Aún no hay estudiantes registrados</strong><small>Los registros aparecerán aquí al completar el formulario.</small></td></tr>';
  countElements[0].textContent = students.length;
  countElements[1].textContent = `${students.length} ${students.length === 1 ? 'registro' : 'registros'}`;
  if (window.lucide) lucide.createIcons();
}

birthDateInput.addEventListener('input', () => { updateAge(); validateField('fechaNacimiento'); });
fields.forEach((fieldName) => document.querySelector(`#${fieldName}`).addEventListener('blur', () => validateField(fieldName)));

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const isValid = fields.map(validateField).every(Boolean);
  if (!isValid) { showMessage('Revisa los campos señalados para continuar.', 'error'); return; }
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  if (students.some((student) => student.identificacion.toLowerCase() === data.identificacion.toLowerCase())) { setError('identificacion', 'Esta identificación ya está registrada.'); showMessage('No se pudo registrar: la identificación ya existe.', 'error'); return; }
  if (students.some((student) => student.correo.toLowerCase() === data.correo.toLowerCase())) { setError('correo', 'Este correo ya está registrado.'); showMessage('No se pudo registrar: el correo ya existe.', 'error'); return; }
  students.push({ ...data, edad: ageInput.value });
  renderTable();
  showMessage('Estudiante registrado correctamente en esta sesión.', 'success');
  form.reset();
  ageInput.value = '—';
  fields.forEach((fieldName) => setError(fieldName));
});

form.addEventListener('reset', () => {
  window.setTimeout(() => {
    ageInput.value = '—';
    fields.forEach((fieldName) => setError(fieldName));
    message.textContent = '';
    message.className = 'form-message';
  }, 0);
});

if (window.lucide) lucide.createIcons();