import { TaskDefinition } from './interfaces';
import { TaskNames, TASK_DEFINITIONS } from './constants';

export function registerTask<
  Args extends Record<string, any> = Record<string, any>,
  Result extends Record<string, any> = Record<string, any>,
>(name: TaskNames, definition: TaskDefinition<Args, Result>) {
  TASK_DEFINITIONS.set(name, definition);
}
