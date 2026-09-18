const assert = require('node:assert/strict');

const today = new Date('2026-09-11T12:00:00');
const lettersOnly = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[\s'-][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function calculateAge(dateValue, referenceDate = today) {
  const birthDate = new Date(`${dateValue}T00:00:00`);
  let age = referenceDate.getFullYear() - birthDate.getFullYear();
  const birthdayHasPassed = referenceDate.getMonth() > birthDate.getMonth() || (referenceDate.getMonth() === birthDate.getMonth() && referenceDate.getDate() >= birthDate.getDate());
  if (!birthdayHasPassed) age -= 1;
  return age;
}

function validateValue(fieldName, value, maxDate = '2026-09-11') {
  const normalized = value.trim();
  if (!normalized) return 'Este campo es obligatorio.';
  if (fieldName === 'identificacion' && (!/^[A-Za-z0-9-]+$/.test(normalized) || normalized.length < 5)) return 'Usa al menos 5 caracteres alfanuméricos.';
  if (['nombre', 'apellido'].includes(fieldName) && (normalized.length < 2 || !lettersOnly.test(normalized))) return 'Usa solo letras, espacios y tildes (mínimo 2).';
  if (fieldName === 'correo' && !emailPattern.test(normalized)) return 'Ingresa un correo electrónico válido.';
  if (fieldName === 'fechaNacimiento' && normalized > maxDate) return 'La fecha no puede ser futura.';
  return '';
}

function isDuplicate(students, field, value) {
  return students.some((student) => student[field].toLowerCase() === value.toLowerCase());
}

const tests = [
  ['calcula edad antes del cumpleaños', () => assert.equal(calculateAge('2000-12-20'), 25)],
  ['calcula edad después del cumpleaños', () => assert.equal(calculateAge('2000-05-15'), 26)],
  ['acepta identificación alfanumérica de mínimo 5 caracteres', () => assert.equal(validateValue('identificacion', 'AB-123'), '')],
  ['rechaza identificación demasiado corta', () => assert.notEqual(validateValue('identificacion', 'A12'), '')],
  ['rechaza caracteres no permitidos en identificación', () => assert.notEqual(validateValue('identificacion', '12 345'), '')],
  ['acepta nombres con tildes y ñ', () => assert.equal(validateValue('nombre', 'Muñoz Álvarez'), '')],
  ['rechaza números en nombre', () => assert.notEqual(validateValue('nombre', 'Ana2'), '')],
  ['acepta correo válido', () => assert.equal(validateValue('correo', 'registro@unova.edu'), '')],
  ['rechaza correo inválido', () => assert.notEqual(validateValue('correo', 'registro@unova'), '')],
  ['rechaza fecha futura', () => assert.notEqual(validateValue('fechaNacimiento', '2026-09-12'), '')],
  ['acepta fecha actual', () => assert.equal(validateValue('fechaNacimiento', '2026-09-11'), '')],
  ['detecta identificación duplicada sin distinguir mayúsculas', () => assert.equal(isDuplicate([{ identificacion: 'ABC123' }], 'identificacion', 'abc123'), true)],
  ['permite identificación nueva', () => assert.equal(isDuplicate([{ identificacion: 'ABC123' }], 'identificacion', 'XYZ999'), false)],
];

let passed = 0;
console.log('\nPruebas unitarias - Registro de estudiantes');
console.log('='.repeat(48));
for (const [name, test] of tests) {
  try { test(); passed += 1; console.log(`  OK  ${name}`); }
  catch (error) { console.log(`  FAIL ${name}\n       ${error.message}`); }
}
console.log('='.repeat(48));
console.log(`Resultado: ${passed}/${tests.length} pruebas aprobadas`);
if (passed !== tests.length) process.exitCode = 1;