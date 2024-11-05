import { subtask, task, types } from 'hardhat/config';
import {
  TASK_NODE,
  TASK_NODE_SERVER_READY,
} from 'hardhat/builtin-tasks/task-names';
import { customTypes, TaskArgsWithSilent } from './common';
import { DeploymentsTaskNames } from './deployments';
import { FAUCET_TASK_NAME, FaucetTaskArgs } from './faucet';
import { TokensTaskNames, TokensGenerateTaskArgs } from './tokens';

let globalArgs: {
  erc20RegularTotal: number;
  erc721RegularTotal: number;
  externalAccount: string;
  externalBalance: bigint;
  disableExport: boolean;
};

task(TASK_NODE)
  .addOptionalParam(
    'erc20RegularTotal',
    'Number of regular ERC20 tokens to generate',
    undefined,
    types.int,
  )
  .addOptionalParam(
    'erc721RegularTotal',
    'Number of regular ERC721 tokens to generate',
    undefined,
    types.int,
  )
  .addOptionalParam(
    'externalAccount',
    'External account address',
    undefined,
    customTypes.address,
  )
  .addOptionalParam(
    'externalBalance',
    'External account balance',
    undefined,
    customTypes.ether,
  )
  .addFlag('disableExport', 'Disables export deployment')
  .setAction(async (args: typeof globalArgs, _, runSuper) => {
    const {
      externalAccount,
      externalBalance,
      erc20RegularTotal,
      erc721RegularTotal,
      disableExport,
      ...superArgs
    } = args;

    globalArgs = {
      externalAccount,
      externalBalance,
      erc20RegularTotal,
      erc721RegularTotal,
      disableExport,
    };

    return runSuper(superArgs);
  });

subtask(TASK_NODE_SERVER_READY, async (_, hre, runSuper) => {
  await runSuper();

  const { run } = hre;

  const {
    externalAccount,
    externalBalance,
    erc20RegularTotal,
    erc721RegularTotal,
    disableExport,
  } = globalArgs;

  if (erc20RegularTotal || erc721RegularTotal) {
    const subTaskArgs: TokensGenerateTaskArgs = {
      customAccount: externalAccount,
      erc20RegularTotal,
      erc20Wrapped: true,
      erc721RegularTotal,
      silent: true,
    };

    await run(TokensTaskNames.Generate, subTaskArgs);
  }

  if (externalAccount && externalBalance > 0n) {
    const subTaskArgs: FaucetTaskArgs = {
      account: externalAccount,
      amount: externalBalance,
      silent: true,
    };

    await run(FAUCET_TASK_NAME, subTaskArgs);
  }

  if (!disableExport) {
    const subTaskArgs: TaskArgsWithSilent = {
      silent: true,
    };

    await run(DeploymentsTaskNames.Export, subTaskArgs);
  }
});
