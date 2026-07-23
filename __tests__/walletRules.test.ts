import { addAccountRule } from '../src/domain/wallet/rules';
import type { WalletAccount } from '../src/domain/wallet/types';

const account = (id: string): WalletAccount => ({
  id, name: id, address: (`0x${id.padStart(40, '0')}`) as `0x${string}`, secretRef: `secret.${id}`,
});
describe('regras de contas', () => {
  it('aceita no máximo duas', () => {
    const two = addAccountRule(addAccountRule([], account('1')), account('2'));
    expect(() => addAccountRule(two, account('3'))).toThrow('Limite');
  });
  it('rejeita duplicidade', () => expect(() => addAccountRule([account('1')], account('1'))).toThrow('já cadastrada'));
});
