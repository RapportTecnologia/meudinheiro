import { Contract, MaxUint256, type Signer } from 'ethers';
import type { Address } from '../../domain/wallet/types';
import type { SwapQuote } from '../../domain/swap/types';
import { erc20 } from './polygon';

const SWAP_ROUTER_ABI = [
  'function exactInputSingle((address tokenIn,address tokenOut,uint24 fee,address recipient,uint256 amountIn,uint256 amountOutMinimum,uint160 sqrtPriceLimitX96)) payable returns (uint256 amountOut)',
] as const;

export class UniswapV3SwapGateway {
  constructor(private readonly routerAddress: Address) {}

  async execute(quote: SwapQuote, signer: Signer) {
    if (Date.now() / 1000 > quote.deadline) throw new Error('Cotação expirada.');
    const owner = await signer.getAddress();
    const token = erc20(quote.tokenIn, signer);
    const allowance: bigint = await token.getFunction('allowance')(owner, this.routerAddress);
    if (allowance < quote.amountIn) {
      const approval = await token.getFunction('approve')(this.routerAddress, MaxUint256);
      await approval.wait();
    }
    const router = new Contract(this.routerAddress, SWAP_ROUTER_ABI, signer);
    return router.getFunction('exactInputSingle')({
      tokenIn: quote.tokenIn,
      tokenOut: quote.tokenOut,
      fee: quote.fee,
      recipient: owner,
      amountIn: quote.amountIn,
      amountOutMinimum: quote.minimumAmountOut,
      sqrtPriceLimitX96: 0,
    });
  }
}
