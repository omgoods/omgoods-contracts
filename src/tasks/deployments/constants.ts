const TASK_PREFIX = 'deployments';

export enum DeploymentsTaskNames {
  Export = `${TASK_PREFIX}:export`,
  Verify = `${TASK_PREFIX}:verify`,
}
