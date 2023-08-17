import { task, subtask } from 'hardhat/config';
import './definitions';
import { TASK_DEFINITIONS, TaskNames, TaskArgs } from './common';

const ROOT_TASK = {
  name: 'interact',
  description: 'Interact with contracts',
};

function prepareTaskName(name: TaskNames): string {
  return `${ROOT_TASK.name}:${name}`;
}

const contents: Array<{
  title: string;
  value: string;
}> = [];

for (const [internalName, internalDefinition] of TASK_DEFINITIONS) {
  const { description, hidden, action } = internalDefinition;

  const name = prepareTaskName(internalName);
  const definition = (hidden ? subtask : task)(name, description);

  contents.push({
    title: description,
    value: name,
  });

  definition.setAction(async (args: TaskArgs, hre) => {
    const {
      tasksUtils: { printExit },
      run,
    } = hre;

    const { rootCall } = args;

    const result = await action(args, {
      ...hre,
      runTask: (name, args?) =>
        run(prepareTaskName(name), { ...(args || {}), rootCall: false }),
    });

    if (!rootCall && !result) {
      printExit();
      process.exit();
    }

    return result;
  });
}

if (contents.length) {
  task(ROOT_TASK.name, ROOT_TASK.description, async (_, hre) => {
    const {
      tasksUtils: { printExit, promptSelect },
      run,
    } = hre;

    let args: TaskArgs = {
      rootCall: true,
    };

    for (;;) {
      const taskName = await promptSelect({
        message: 'Action',
        choices: contents,
      });

      if (!taskName) {
        break;
      }

      const result = await run(taskName, args);

      if (!result) {
        break;
      }

      args = {
        ...args,
        ...result,
        rootCall: true,
      };
    }

    printExit();
  });
}
