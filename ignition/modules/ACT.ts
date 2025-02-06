import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { ACTVariants } from '@/common';
import ACTImpls from './ACTImpls';
import ACTRegistry from './ACTRegistry';

export default buildModule('ACT', (m) => {
  const owner = m.getAccount(1);

  const { registry } = m.useModule(ACTRegistry);

  const { fungible, nonFungible } = m.useModule(ACTImpls);

  m.call(registry, 'setVariant', [ACTVariants.Fungible, fungible], {
    from: owner,
    id: 'setFungibleVariant',
  });

  m.call(registry, 'setVariant', [ACTVariants.NonFungible, nonFungible], {
    from: owner,
    id: 'setNonFungibleVariant',
  });

  return { registry };
});
