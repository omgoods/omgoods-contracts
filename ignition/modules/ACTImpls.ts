import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import ACTRegistry from './ACTRegistry';

export default buildModule('ACTImpls', (m) => {
  const deployer = m.getAccount(0);

  const { registry } = m.useModule(ACTRegistry);

  const fungible = m.contract('ACTFungibleImpl', [], {
    from: deployer,
    id: 'fungible',
    after: [registry],
  });

  const nonFungible = m.contract('ACTNonFungibleImpl', [], {
    from: deployer,
    id: 'nonFungible',
    after: [fungible],
  });

  return { fungible, nonFungible };
});
