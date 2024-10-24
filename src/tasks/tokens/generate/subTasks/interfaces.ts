import { TaskArgsWithSilent } from '../../../common';

interface CommonSubTaskArgs extends TaskArgsWithSilent {
  name: string;
  symbol: string;
}

export interface ERC20SubTaskArgs extends CommonSubTaskArgs {
  customAccount?: string;
  initialSupply: number;
  burnAmount: number;
  maxTransfers: number;
  totalApproves: number;
}

export interface ERC721SubTaskArgs extends CommonSubTaskArgs {
  //
}
