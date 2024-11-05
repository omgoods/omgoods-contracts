import { TaskArgsWithSilent } from '../../../common';

export interface ERC20RegularSubTaskArgs extends TaskArgsWithSilent {
  name: string;
  symbol: string;
  account?: string;
  initialSupply: number;
  burnAmount: number;
  maxTransfers: number;
}

export interface ERC721RegularSubTaskArgs extends TaskArgsWithSilent {
  name: string;
  symbol: string;
  account?: string;
  totalItems: number;
}
