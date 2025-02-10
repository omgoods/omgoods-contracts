import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import ACTImpls from './ACTImpls';

export default buildModule('ACTExtensions', (m) => {
  const deployer = m.getAccount(0);

  const signerExtension = m.contract('ACTSignerExtension', [], {
    from: deployer,
    id: 'signerExtension',
    after: [ACTImpls],
  });

  const votingExtension = m.contract('ACTVotingExtension', [], {
    from: deployer,
    id: 'votingExtension',
    after: [signerExtension],
  });

  const walletExtension = m.contract('ACTWalletExtension', [], {
    from: deployer,
    id: 'walletExtension',
    after: [votingExtension],
  });

  return { signerExtension, votingExtension, walletExtension };
});
