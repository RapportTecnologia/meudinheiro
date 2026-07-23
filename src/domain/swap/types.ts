import type { Address } from '../wallet/types';

export type SwapQuote = {
  tokenIn: Address;
  tokenOut: Address;
  amountIn: bigint;
  minimumAmountOut: bigint;
  fee: 500 | 3000 | 10000;
  deadline: number;
};
