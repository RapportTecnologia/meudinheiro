const OPS = ['+', '-', '×', '÷'] as const;

export function appendKey(expression: string, key: string): string {
  if (key === 'C') return '';
  if (key === '⌫') return expression.slice(0, -1);
  if (key === '=') return calculate(expression);
  if (OPS.includes(key as never) && (!expression || OPS.includes(expression.at(-1) as never))) {
    return expression;
  }
  return `${expression}${key}`;
}

export function calculate(expression: string): string {
  if (!/^[\d+\-×÷.,\s]+$/.test(expression)) throw new Error('Expressão inválida.');
  const normalized = expression.replaceAll(',', '.').replaceAll('×', '*').replaceAll('÷', '/');
  // Parser restrito: a validação acima impede identificadores, chamadas e propriedades.
  const result = Function(`"use strict"; return (${normalized})`)();
  if (!Number.isFinite(result)) throw new Error('Resultado inválido.');
  return String(Number(result.toFixed(12)));
}

export function toTransferAmount(display: string): string {
  const result = calculate(display || '0');
  if (Number(result) <= 0) throw new Error('O valor deve ser maior que zero.');
  return result;
}
