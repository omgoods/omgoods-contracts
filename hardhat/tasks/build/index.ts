import { mkdir, remove, pathExists, writeJson } from 'fs-extra';
import { join } from 'path';
import { task } from 'hardhat/config';
import { toKebabCase } from '../../common';
import { HARDHAT_NETWORK } from '../../config';
import { ContractBuild } from './interfaces';
import { writeCode } from './utils';
import { DEFAULT_BUILD_CONFIG } from './constants';
import * as templates from './templates';

task<{
  format: 'json' | 'ts-react' | 'ts-nest';
}>('build', 'Builds export files', async (args, hre) => {
  const {
    config: {
      namedAccounts,
      paths: { build: buildRootPath },
      contracts: contractsConfig,
      deterministicDeployment: getDeterministicDeploymentConfig,
    },
    deployments: { getArtifact },
    ethers: { AbiCoder, concat, keccak256, getCreate2Address, id },
  } = hre;

  if (typeof getDeterministicDeploymentConfig !== 'function') {
    return;
  }

  if (await pathExists(buildRootPath)) {
    await remove(buildRootPath);
  }

  await mkdir(buildRootPath);

  const networkEnvsConfigs = Object.entries({
    mainnet: {
      owner: namedAccounts.owner[1],
      deterministicDeployment: getDeterministicDeploymentConfig('1'),
    },
    testnet: {
      owner: namedAccounts.owner[5],
      deterministicDeployment: getDeterministicDeploymentConfig('5'),
    },
    localhost: {
      owner: namedAccounts.owner[HARDHAT_NETWORK.chainId],
      deterministicDeployment: getDeterministicDeploymentConfig(
        `${HARDHAT_NETWORK.chainId}`,
      ),
    },
  });

  const contracts: Array<ContractBuild> = [];
  const contractsConfigEntries = Object.entries(contractsConfig);

  for (let [buildName, { typedData, build }] of contractsConfigEntries) {
    if (!build) {
      continue;
    }

    const options =
      typeof build === 'boolean'
        ? DEFAULT_BUILD_CONFIG
        : {
            ...DEFAULT_BUILD_CONFIG,
            ...build,
          };

    const name = options?.name || buildName;

    const artifact = await getArtifact(name);

    if (!artifact) {
      continue;
    }

    const contract: ContractBuild = {
      typedData: typedData || null,
      addresses: null,
      byteCode: null,
      abi: null,
    };

    if (options.address) {
      const constructor: {
        inputs: Array<{ name: string; type: string }>;
      } = artifact.abi.find((item) => item.type === 'constructor');

      contract.addresses = {};

      for (const [
        networkEnv,
        {
          owner,
          deterministicDeployment: { factory },
        },
      ] of networkEnvsConfigs) {
        if (!owner || !factory) {
          continue;
        }

        let initCode = artifact.bytecode;

        if (constructor?.inputs?.length) {
          initCode = concat([
            initCode,
            AbiCoder.defaultAbiCoder().encode(
              constructor.inputs.map(({ type }) => type),
              constructor.inputs.map(({ name }) => {
                let result: unknown;

                switch (name) {
                  case 'owner':
                    result = owner;
                    break;

                  case 'typedDataDomainName':
                    result = typedData.domain.name;
                    break;

                  case 'typedDataDomainVersion':
                    result = typedData.domain.version;
                    break;
                }

                return result;
              }),
            ),
          ]);
        }

        contract.addresses[networkEnv] = getCreate2Address(
          factory,
          id(name),
          keccak256(initCode),
        );
      }
    }

    if (options.abi) {
      contract.abi = artifact.abi;
    }

    if (options.byteCode) {
      contract.byteCode = artifact.bytecode;
    }

    let buildFile: string;

    switch (args.format) {
      case 'ts-nest':
        buildFile = toKebabCase(buildName);
        break;

      default:
        buildFile = buildName;
        break;
    }

    const buildPath = join(buildRootPath, buildFile);

    switch (args.format) {
      case 'ts-react':
      case 'ts-nest':
        console.log(`saving ${buildFile}.ts`);

        await writeCode(
          `${buildPath}.ts`,
          templates.buildContract({
            ...contract,
            buildName,
          }),
        );
        break;

      default:
        console.log(`saving ${buildFile}.json`);

        await writeJson(`${buildPath}.json`, contract, {
          spaces: 2,
        });
    }

    contracts.push({
      ...contract,
      buildName,
      buildFile,
    });
  }

  switch (args.format) {
    case 'ts-react':
    case 'ts-nest':
      console.log(`saving index.ts`);

      await writeCode(
        join(buildRootPath, 'index.ts'),
        templates.buildIndex(contracts),
      );
      break;
  }
}).addParam(
  'format',
  'Output format (options: "json","ts-react","ts-nest")',
  'json',
);
