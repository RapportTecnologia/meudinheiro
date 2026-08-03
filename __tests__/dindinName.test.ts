import { dindinLabelHash, formatDindinName, isDindinName } from '../src/domain/naming/dindinName';

describe('PNS .dindin', () => {
  it('normaliza e formata o nome público', () => {
    expect(formatDindinName('  Carlos Delfino.dindin ')).toBe('carlos-delfino.dindin');
    expect(isDindinName('carlosdelfino.dindin')).toBe(true);
  });

  it('gera o mesmo hash para formas equivalentes', () => {
    expect(dindinLabelHash('Tia Maria')).toBe(dindinLabelHash('tia-maria.dindin'));
  });

  it('rejeita labels fora do padrão', () => {
    expect(() => formatDindinName('ab')).toThrow('3 a 32');
    expect(() => formatDindinName('-nome')).toThrow('hífen');
  });
});
