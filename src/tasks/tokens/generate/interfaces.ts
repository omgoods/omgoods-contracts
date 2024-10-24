import { TaskArgsWithSilent } from '../../common';

export interface TokensGenerateTaskArgs extends TaskArgsWithSilent {
  customAccount: string;
  totalErc20: number;
  totalErc721: number;
}
