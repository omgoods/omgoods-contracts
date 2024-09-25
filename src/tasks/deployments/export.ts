import { readdir, stat, readJson, writeFile } from 'fs-extra';
import { format } from 'prettier';
import { join } from 'path';
import { task } from 'hardhat/config';
import { TaskNames } from './constants';

task(
  TaskNames.Export,
  'Exports deployed contracts into ./deployments.ts',
  async (_, hre) => {
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

    const dirNames = await readdir(paths.deployments);

    for (const dirName of dirNames) {
      const rootPath = join(paths.deployments, dirName);
      const rootStats = await stat(rootPath);

      if (rootStats.isDirectory()) {
        const network = networks[dirName];

        if (network) {
          const { chainId } = network;

          const fileNames = (await readdir(rootPath)).filter((fileName) =>
            fileName.endsWith('.json'),
          );

          for (const fileName of fileNames) {
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
      }
    }

    let content = `export default {${Object.entries(deployments)
      .map(
        ([chainId, deployment]) =>
          `[${chainId}]: ${JSON.stringify(deployment)}`,
      )
      .join(',')}} as const;`;

    content = await (format(content, {
      parser: 'typescript',
      singleQuote: true,
      trailingComma: 'all',
    }) as Promise<string>);

    await writeFile(`${paths.deployments}.ts`, content, {
      encoding: 'utf8',
    });
  },
);
