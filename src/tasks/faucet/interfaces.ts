import { TaskArgsWithSilent } from '../common';

export interface FaucetTaskArgs extends TaskArgsWithSilent {
  account: string;
  amount: bigint;
}
