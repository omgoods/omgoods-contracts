import { readdir, stat, readJson, writeFile } from 'fs-extra';
import { join } from 'path';
import { task } from 'hardhat/config';

task(
  'deployments:export',
  'Exports deployed contracts into ./deployments.ts',
  async (_, hre) => {
    const {
      run,
      config: { paths, networks },
    } = hre;

    const deployments: Record<
      string,
      {
        addresses: Record<number, string>;
        abi: any;
      }
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
            const { address, abi }: { address: string; abi: any } =
              await readJson(join(rootPath, fileName), {
                encoding: 'utf8',
              });

            const name = fileName.slice(0, -5);

            if (!deployments[name]) {
              deployments[name] = {
                addresses: {
                  [chainId]: address,
                },
                abi,
              };
            } else {
              deployments[name].addresses[chainId] = address;
            }
          }
        }
      }
    }

    await writeFile(
      `${paths.deployments}.ts`,
      `export default ${JSON.stringify(deployments, null, 2)};`,
      {
        encoding: 'utf8',
      },
    );
  },
);
