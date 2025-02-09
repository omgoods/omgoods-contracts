import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { ACTVariants } from '@/common';
import ACTExtensions from './ACTExtensions';
import ACTImpls from './ACTImpls';
import ACTRegistry from './ACTRegistry';

export default buildModule<'ACT', 'ACTRegistry', any>('ACT', (m) => {
  const owner = m.getAccount(1);

  const { registry } = m.useModule(ACTRegistry);

  const { fungibleImpl, nonFungibleImpl } = m.useModule(ACTImpls);

  const { signerExtension, walletExtension } = m.useModule(ACTExtensions);

  m.call(registry, 'setVariant', [ACTVariants.Fungible, fungibleImpl], {
    from: owner,
    id: 'addFungibleVariant',
  });

  m.call(registry, 'setVariant', [ACTVariants.NonFungible, nonFungibleImpl], {
    from: owner,
    id: 'addNonFungibleVariant',
  });

  m.call(
    registry,
    'setExtension',
    [
      signerExtension,
      {
        active: true,
        variant: ACTVariants.UnknownOrAny,
      },
    ],
    {
      from: owner,
      id: 'addSignerExtension',
    },
  );

  m.call(
    registry,
    'setExtension',
    [
      walletExtension,
      {
        active: true,
        variant: ACTVariants.UnknownOrAny,
      },
    ],
    {
      from: owner,
      id: 'addWalletExtension',
    },
  );

  return {
    registry,
    fungibleImpl,
    nonFungibleImpl,
    signerExtension,
    walletExtension,
  };
});
