import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EC_POR_GRAMAS_LITRO_MISTURA,
  calcularNutricao,
} from '../src/nutricao.ts';

test('coeficiente acumulado da mistura deve ser 1.2448 dS m⁻¹ por g/L', () => {
  assert.ok(Math.abs(EC_POR_GRAMAS_LITRO_MISTURA - 1.2448) < 1e-12);
});

test('caso de aceite 1: CE 0,55 -> 1,1 em 10 L', () => {
  const res = calcularNutricao({ ceAtual: '0,55', ceEsperada: '1,1', volume: '10' });
  assert.equal(res.erro, null);
  assert.equal(res.kristalon, 2);
  assert.equal(res.nitratoCalcio, 2);
  assert.ok(Math.abs(res.ferro - 0.2) < 1e-12);
});

test('caso de aceite 2: CE 0,8 -> 1,5 em 20 L', () => {
  const res = calcularNutricao({ ceAtual: '0,8', ceEsperada: '1,5', volume: '20' });
  assert.equal(res.erro, null);
  assert.equal(res.kristalon, 6);
  assert.equal(res.nitratoCalcio, 5);
  assert.ok(Math.abs(res.ferro - 0.4) < 1e-12);
});

test('caso de aceite 3: CE 1,2 -> 1,2 em 5 L retorna aviso', () => {
  const res = calcularNutricao({ ceAtual: '1,2', ceEsperada: '1,2', volume: '5' });
  assert.equal(res.erro, 'A CE esperada deve ser maior que a CE atual.');
});

test('caso de aceite 4: CE 0,6 -> 1,3 em 2 L', () => {
  const res = calcularNutricao({ ceAtual: '0,6', ceEsperada: '1,3', volume: '2' });
  assert.equal(res.erro, null);
  assert.equal(res.kristalon, 1);
  assert.equal(res.nitratoCalcio, 1);
  assert.ok(Math.abs(res.ferro - 0.04) < 1e-12);
});

test('caso de aceite 5: campo vazio retorna "Preencha todos os campos!"', () => {
  const res = calcularNutricao({ ceAtual: '', ceEsperada: '1,1', volume: '10' });
  assert.equal(res.erro, 'Preencha todos os campos!');
});

test('aceita ponto decimal da mesma forma que vírgula e rejeita volume <= 0', () => {
  const comPonto = calcularNutricao({ ceAtual: '0.55', ceEsperada: '1.1', volume: '10' });
  assert.equal(comPonto.erro, null);
  assert.equal(comPonto.kristalon, 2);
  assert.equal(comPonto.nitratoCalcio, 2);

  const volZero = calcularNutricao({ ceAtual: '0,5', ceEsperada: '1,0', volume: '0' });
  assert.equal(volZero.erro, 'O volume deve ser maior que zero.');
});

