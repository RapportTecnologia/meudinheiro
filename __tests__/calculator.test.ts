import { appendKey, calculate, toTransferAmount } from '../src/domain/calculator/calculator';

describe('calculadora', () => {
  it('respeita precedência', () => expect(calculate('2+3×4')).toBe('14'));
  it('limpa e apaga', () => {
    expect(appendKey('12', '⌫')).toBe('1');
    expect(appendKey('12', 'C')).toBe('');
  });
  it('rejeita injeção', () => expect(() => calculate('globalThis.process')).toThrow());
  it('não envia zero ou negativo', () => expect(() => toTransferAmount('0')).toThrow());
});
