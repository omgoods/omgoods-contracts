import { TaskArgsWithSilent } from '../../common';

export interface TokensGenerateTaskArgs extends TaskArgsWithSilent {
  account: string;
  erc20RegularTotal: number;
  erc721RegularTotal: number;
  erc20Wrapped: boolean;
}
