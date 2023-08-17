import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { TaskNames } from './constants';
import { TasksUtils } from '../../utils';

export interface CommonTaskArgs {
  signer?: HardhatEthersSigner;
  account?: Awaited<ReturnType<TasksUtils['getAccountAt']>>;
  rootCall?: boolean;
}

export type TaskArgs<A extends Record<string, any> = Record<string, any>> =
  CommonTaskArgs & A;

export interface TaskDefinition<
  Args extends Record<string, any> = Record<string, any>,
  Result extends Record<string, any> = Record<string, any>,
> {
  hidden?: boolean;
  description: string;
  action: (
    args: TaskArgs<Args>,
    hre: HardhatRuntimeEnvironment & {
      runTask: <
        R extends Record<string, any> = Record<string, any>,
        A extends Record<string, any> = Record<string, any>,
      >(
        name: TaskNames,
        args?: TaskArgs<A>,
      ) => Promise<TaskArgs<R>>;
    },
  ) => Promise<TaskArgs<Result> | void>;
}
