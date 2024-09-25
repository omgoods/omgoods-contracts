export interface ERC20SubTaskArgs {
  name: string;
  symbol: string;
  account?: string;
  initialSupply: number;
  burnAmount: number;
  maxTransfers: number;
  totalApproves: number;
}

export interface ERC721SubTaskArgs {
  name: string;
  symbol: string;
}
