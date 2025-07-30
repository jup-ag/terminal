import { PublicKey } from '@solana/web3.js';
import { DEFAULT_EXPLORER, FormProps } from 'src/types';
import { SwapMode } from 'src/types/constants';

export const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
export const USDT_MINT = new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB');
export const JLP_MINT = new PublicKey('27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4');

export const WRAPPED_SOL_MINT = new PublicKey('So11111111111111111111111111111111111111112');


export interface IFormConfigurator {
  simulateWalletPassthrough: boolean;
  defaultExplorer: DEFAULT_EXPLORER;
  formProps: FormProps;
  colors: {
    /** Primary color (accent color) */
    primary?: string;
    /** Background color */
    background?: string;
    /** Primary text color */
    primaryText?: string;
    /** Warning color */
    warning?: string;
    /** Interactive elements color */
    interactive?: string;
    /** Module/component background color */
    module?: string;
  };
  branding?: {
    logoUri?: string;
    name?: string;
  };
}

export const INITIAL_FORM_CONFIG: IFormConfigurator = Object.freeze({
  simulateWalletPassthrough: false,
  defaultExplorer: 'Solana Explorer',
  formProps: {
    fixedAmount: false,
    initialAmount: '',
    initialInputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    initialOutputMint: WRAPPED_SOL_MINT.toString(),
    swapMode:SwapMode.ExactIn,  
  },
  colors: {
    primary: '199, 242, 132',
    background: '0, 0, 0',
    primaryText: '232, 249, 255',
    warning: '251, 191, 36',
    interactive: '33, 42, 54',
    module: '16, 23, 31',
  },
});
