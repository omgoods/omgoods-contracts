import { toConstantName } from '../../common';
import { ContractBuild } from './interfaces';

export function buildContract(contract: ContractBuild): string {
  return `export const ${toConstantName(contract.buildName)} = ${JSON.stringify(
    contract,
  )};`;
}

export function buildContracts(contracts: Array<ContractBuild>): string {
  const lines = [
    ...contracts.map(({ buildName, buildFile }) => {
      return `export { ${toConstantName(buildName)} } from './${buildFile}';`;
    }),
  ];

  return lines.join('\n');
}
