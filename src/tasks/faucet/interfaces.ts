import { TaskArgsWithSilent } from '../common';

export interface FaucetTaskArgs extends TaskArgsWithSilent {
  to: string;
  value: bigint;
}
