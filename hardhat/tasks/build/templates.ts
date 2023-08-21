import { toConstantName } from '../../common';
import { ContractBuild } from './interfaces';

export function buildContract(contract: ContractBuild): string {
  return `export const ${toConstantName(contract.buildName)} = ${JSON.stringify(
    contract,
  )};`;
}

export function buildIndex(contracts: Array<ContractBuild>): string {
  const lines = [
    'import { Interface } from "ethers";',
    ...contracts.map(({ buildName, buildFile }) => {
      return `import { ${toConstantName(buildName)} } from './${buildFile}';`;
    }),
    '',
    'export enum NetworkEnvs {',
    " Mainnet = 'mainnet',",
    " Testnet = 'testnet',",
    " Localhost = 'localhost',",
    '};',
    '',
    'export enum ContractNames {',
    ...contracts.map(({ buildName }) => `${buildName} = '${buildName}',`),
    '}',
    '',
    'export const CONTRACT_ADDRESSES = new Map<ContractNames, Record<NetworkEnvs, string>>([',
    ...contracts
      .filter(({ addresses }) => !!addresses)
      .map(
        ({ buildName }) =>
          `[ContractNames.${buildName}, ${toConstantName(
            buildName,
          )}.addresses as Record<NetworkEnvs, string>],`,
      ),
    '])',
    '',
    'export const CONTRACT_BYTE_CODES = new Map<ContractNames,string>([',
    ...contracts
      .filter(({ byteCode }) => !!byteCode)
      .map(
        ({ buildName }) =>
          `[ContractNames.${buildName}, ${toConstantName(
            buildName,
          )}.byteCode],`,
      ),
    '])',
    '',
    'export const CONTRACT_INTERFACES = new Map<ContractNames,Interface>([',
    ...contracts
      .filter(({ abi }) => !!abi)
      .map(
        ({ buildName }) =>
          `[ContractNames.${buildName}, new Interface(${toConstantName(
            buildName,
          )}.abi)],`,
      ),
    '])',
  ];

  return lines.join('\n');
}
