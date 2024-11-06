const TASK_PREFIX = 'tokens:erc20';

export enum TokenERC20TaskNames {
  CreateRegular = `${TASK_PREFIX}:create:regular`,
  CreateWrapped = `${TASK_PREFIX}:create:wrapped`,
  Generate = `${TASK_PREFIX}:generate`,
}
