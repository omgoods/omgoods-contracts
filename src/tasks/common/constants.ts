import { TaskDefinition } from './interfaces';

export enum TaskNames {
  accountSelect = 'account:select',
  accountCreate = 'account:create',
  signerSelect = 'signer:select',
}

export const TASK_DEFINITIONS = new Map<TaskNames, TaskDefinition>();
