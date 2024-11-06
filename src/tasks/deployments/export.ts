import { readdir, stat, readJson, writeFile, unlink } from 'fs-extra';
import { format } from 'prettier';
import { join, resolve } from 'path';
import { task } from 'hardhat/config';
import { Logger, TaskArgsWithSilent } from '../common';
import { DeploymentsTaskNames } from './constants';

task(
  DeploymentsTaskNames.Export,
  'Exports all deployed contracts into ./deployments/exported/*.ts',
)
  .addFlag('silent', 'Turn off logging')
  .setAction(async (args: TaskArgsWithSilent, hre) => {
    const {
      config: { paths, networks },
    } = hre;

    const deployments: Record<
      number,
      Record<
        string,
        {
          address: string;
          abi: unknown;
          receipt: unknown;
        }
      >
    > = {};

    const { silent } = args;

    const logger = new Logger(!silent);

    const dirNames = await readdir(paths.deployments);

    for (const dirName of dirNames) {
      const rootPath = join(paths.deployments, dirName);
      const rootStats = await stat(rootPath);

      if (!rootStats.isDirectory()) {
        continue;
      }

      const network = networks[dirName];

      if (!network) {
        continue;
      }

      const { chainId } = network;

      const fileNames = (await readdir(rootPath)).filter((fileName) =>
        fileName.endsWith('.json'),
      );

      for (const fileName of fileNames) {
        if (fileName.includes('External')) {
          continue;
        }

        const {
          address,
          abi,
          receipt,
        }: { address: string; abi: any; receipt: any } = await readJson(
          join(rootPath, fileName),
          {
            encoding: 'utf8',
          },
        );

        const name = fileName.slice(0, -5);

        if (!deployments[chainId]) {
          deployments[chainId] = {};
        }

        deployments[chainId][name] = {
          address,
          abi,
          receipt,
        };
      }
    }

    for (const type of ['backend', 'frontend'] as const) {
      const filePath = `${resolve(paths.deployments, `./../exported/${type}`)}.ts`;

      try {
        const fileStats = await stat(filePath);

        if (fileStats.isFile()) {
          await unlink(filePath);
        }
      } catch (err) {
        //
      }

      let dataFields: [any, any][];
      let dataType: string;

      switch (type) {
        case 'backend':
          dataFields = Object.entries(deployments);
          dataType = 'Record<string, Record<string, any>>';
          break;

        case 'frontend':
          dataFields = Object.entries(deployments).map(
            ([chainId, deployments]) => [
              chainId,
              Object.entries(deployments)
                .map(([key, { address }]) => [key, address])
                .reduce(
                  (result, [key, address]) => ({
                    ...result,
                    [key]: address,
                  }),
                  {},
                ),
            ],
          );
          dataType = 'Record<string, Record<string, string>>';
          break;
      }

      if (!dataFields) {
        continue;
      }

      const content = await (format(
        `export default {${dataFields.map(([key, value]) => `['${key}']: ${JSON.stringify(value)}`).join(',')}} as ${dataType}`,
        {
          parser: 'typescript',
          singleQuote: true,
          trailingComma: 'all',
        },
      ) as Promise<string>);

      logger.print(`exporting ${type.padEnd(8, ' ')} `);

      await writeFile(filePath, content, {
        encoding: 'utf8',
      });

      logger.printLn('[DONE]');
    }
  });
