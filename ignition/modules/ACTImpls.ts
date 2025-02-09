import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import ACTRegistry from './ACTRegistry';

export default buildModule('ACTImpls', (m) => {
  const deployer = m.getAccount(0);

  const fungibleImpl = m.contract('ACTFungibleImpl', [], {
    from: deployer,
    id: 'fungibleImpl',
    after: [ACTRegistry],
  });

  const nonFungibleImpl = m.contract('ACTNonFungibleImpl', [], {
    from: deployer,
    id: 'nonFungibleImpl',
    after: [fungibleImpl],
  });

  return { fungibleImpl, nonFungibleImpl };
});
