import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { zeroAddress } from 'viem';

export default buildModule('ACTRegistry', (m) => {
  const deployer = m.getAccount(0);
  const owner = m.getAccount(1);

  const entryPoint = m.getParameter('entryPoint', zeroAddress);

  const epochWindowLength = m.getParameter(
    'epochWindowLength',
    60 * 60 * 24 * 7,
  ); // 7 days

  const registry = m.contract('ACTRegistry', [owner], {
    from: deployer,
    id: 'registry',
  });

  m.call(registry, 'initialize', [entryPoint, owner, [], epochWindowLength], {
    from: owner,
  });

  return { registry };
});
