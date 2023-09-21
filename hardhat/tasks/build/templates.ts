import { toConstantName } from '../../common';
import { ContractBuild } from './interfaces';

export function buildContract(contract: ContractBuild): string {
  return `export const ${toConstantName(contract.buildName)} = ${JSON.stringify(
    contract,
  )};`;
}

export function buildIndex(contracts: Array<ContractBuild>): string {
  const contractImports: string[] = [];
  const contractNames: string[] = [];
  const contractAddresses: string[] = [];
  const contractByteCodes: string[] = [];
  const contractInterfaces: string[] = [];
  const contractTypedData: string[] = [];

  for (const {
    buildName,
    buildFile,
    addresses,
    byteCode,
    abi,
    typedData,
  } of contracts) {
    contractImports.push(
      `import { ${toConstantName(buildName)} } from './${buildFile}';`,
    );

    contractNames.push(
      `${buildName} = '${buildName}',`, //
    );

    if (addresses) {
      contractAddresses.push(
        `[ContractNames.${buildName}, ${toConstantName(
          buildName,
        )}.addresses as Record<NetworkTypes, string>],`,
      );
    }

    if (byteCode) {
      contractByteCodes.push(
        `[ContractNames.${buildName}, ${toConstantName(buildName)}.byteCode],`,
      );
    }

    if (abi) {
      contractInterfaces.push(
        `[ContractNames.${buildName}, new Interface(${toConstantName(
          buildName,
        )}.abi)],`,
      );
    }

    if (typedData) {
      contractTypedData.push(
        `[ContractNames.${buildName}, ${toConstantName(buildName)}.typedData],`,
      );
    }
  }

  const lines = [
    'import { Interface, TypedDataDomain, TypedDataField } from "ethers";',
    ...contractImports,
    '',
    'export enum NetworkTypes {',
    " Mainnet = 'mainnet',",
    " Testnet = 'testnet',",
    " Localhost = 'localhost',",
    '};',
    '',
    'export enum ContractNames {',
    ...contractNames,
    '}',
    '',
    'export const CONTRACT_ADDRESSES = new Map<ContractNames, Record<NetworkTypes, string>>([',
    ...contractAddresses,
    ']);',
    '',
    'export const CONTRACT_BYTE_CODES = new Map<ContractNames,string>([',
    ...contractByteCodes,
    ']);',
    '',
    'export const CONTRACT_INTERFACES = new Map<ContractNames,Interface>([',
    ...contractInterfaces,
    ']);',
    '',
    'export const CONTRACT_TYPED_DATA = new Map<ContractNames,{',
    '    domain: TypedDataDomain;',
    '    types: Record<string, Array<TypedDataField>>',
    '}>([',
    ...contractTypedData,
    ']);',
  ];

  return lines.join('\n');
}
