import { parseEther } from 'ethers';
import { TOKEN } from '../../constants';
import { randomAddress } from '../../../common';

export const FIXED_TOKEN = {
  ...TOKEN,
  owner: randomAddress(),
  totalSupply: parseEther('1000000'),
};
