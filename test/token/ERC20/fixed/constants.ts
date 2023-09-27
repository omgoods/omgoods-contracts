import { parseEther } from 'ethers';
import { TOKEN } from '../../constants';

export const FIXED_TOKEN = {
  ...TOKEN,
  totalSupply: parseEther('1000000'),
};
